'use client';

import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

interface Order {
  id: string;
  address: string;
  price: number;
  district?: string;
  status: string;
}

interface Props {
  orders: Order[];
  orderCoords: Map<string, { lat: number; lon: number } | null>;
  ordersLoading?: boolean;
  isDark: boolean;
  onOrderClick?: (orderId: string) => void;
  accentColor?: string;
}

export function OrdersMapAll({
  orders,
  orderCoords,
  ordersLoading = false,
  isDark,
  onOrderClick,
  accentColor = '#4CAF50',
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const hasFitRef = useRef(false);

  // ─── ALWAYS-FRESH REFS ────────────────────────────────────────────────────
  // Updated synchronously during every render so any async closure can safely
  // read .current and always gets the latest props — this is the fix for the
  // stale-closure bug where init useEffect captured empty orderCoords.
  const ordersRef = useRef(orders);
  const orderCoordsRef = useRef(orderCoords);
  const onOrderClickRef = useRef(onOrderClick);
  const accentRef = useRef(accentColor);
  ordersRef.current = orders;
  orderCoordsRef.current = orderCoords;
  onOrderClickRef.current = onOrderClick;
  accentRef.current = accentColor;

  // ─── DERIVED STATE (rendered with fresh props, not refs) ──────────────────
  const resolvedCount = orders.filter(
    (o) => orderCoords.get(o.id) !== undefined && orderCoords.get(o.id) !== null
  ).length;
  const pendingGeocode = orders.some((o) => orderCoords.get(o.id) === undefined);
  const allFailed =
    !ordersLoading && orders.length > 0 && !pendingGeocode && resolvedCount === 0;

  // ─── SYNC MARKERS ────────────────────────────────────────────────────────
  // Reads exclusively from refs → safe to call from any async closure, even a
  // stale one, because refs always hold the latest data.
  function syncMarkers(L: any, map: any) {
    const curOrders = ordersRef.current;
    const curCoords = orderCoordsRef.current;
    const accent = accentRef.current;

    // 1. Remove markers whose orders left the visible list
    const liveIds = new Set(curOrders.map((o) => o.id));
    for (const [id, marker] of markersRef.current.entries()) {
      if (!liveIds.has(id)) {
        map.removeLayer(marker);
        markersRef.current.delete(id);
      }
    }

    // 2. Add markers for newly geocoded orders
    for (const order of curOrders) {
      if (markersRef.current.has(order.id)) continue; // already on map
      const coords = curCoords.get(order.id);
      if (!coords) continue; // undefined (pending) or null (failed) → skip

      const priceLabel =
        order.price >= 1000
          ? `${Math.round(order.price / 1000)}k`
          : String(order.price);

      const icon = L.divIcon({
        html: `<div style="
            width:38px;height:38px;background:${accent};border-radius:50%;
            border:2.5px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,0.45);
            display:flex;flex-direction:column;align-items:center;justify-content:center;
            color:#fff;font-family:system-ui,sans-serif;cursor:pointer;gap:0;line-height:1.1;">
          <span style="font-size:10px;font-weight:800">${priceLabel}</span>
          <span style="font-size:7px;font-weight:600;opacity:.9">₽</span>
        </div>`,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
        className: '',
      });

      const districtLine = order.district
        ? `<br/><span style="color:#6b7280;font-size:0.78rem">${order.district}</span>`
        : '';

      const popup = L.popup({ offset: [0, -16], maxWidth: 210 }).setContent(
        `<div style="min-width:150px;font-family:system-ui,sans-serif">
          <b style="font-size:0.88rem;color:#111">${order.address}</b>
          ${districtLine}
          <br/>
          <span style="color:${accent};font-weight:700;font-size:1rem">${order.price} ₽</span>
          <br/>
          <span style="color:#4b5563;font-size:0.8rem">Нажмите для просмотра</span>
        </div>`
      );

      const marker = L.marker([coords.lat, coords.lon], { icon })
        .addTo(map)
        .bindPopup(popup);

      marker.on('click', () => {
        onOrderClickRef.current?.(order.id);
      });

      markersRef.current.set(order.id, marker);
    }

    // Auto-fit to show all markers on first load (never fights user panning)
    if (!hasFitRef.current && markersRef.current.size > 0) {
      hasFitRef.current = true;
      const latlngs = Array.from(markersRef.current.values()).map((m) => m.getLatLng());
      if (latlngs.length === 1) {
        map.setView(latlngs[0], 14);
      } else {
        map.fitBounds(L.latLngBounds(latlngs).pad(0.35));
      }
    }
  }

  // ─── INIT MAP (once on mount) ─────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    import('leaflet').then(({ default: L }) => {
      if (!containerRef.current || mapRef.current) return;

      const tileUrl =
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      const attribution =
        '&copy; <a href="https://carto.com/">CARTO</a> ' +
        '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>';

      const map = L.map(containerRef.current, { zoomControl: true }).setView(
        [55.7965, 49.108],
        12
      );
      L.tileLayer(tileUrl, { attribution, maxZoom: 19 }).addTo(map);
      mapRef.current = map;

      // Fix tile layout after the container is painted at its real size
      requestAnimationFrame(() => {
        if (mapRef.current) mapRef.current.invalidateSize();
      });

      // syncMarkers reads from refs → sees latest orders/coords even though
      // this closure was captured at first render (stale closure fix)
      syncMarkers(L, map);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current.clear();
        hasFitRef.current = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── RE-SYNC ON DATA CHANGE ───────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return; // Leaflet not loaded yet → init will pick it up
    import('leaflet').then(({ default: L }) => {
      if (!mapRef.current) return;
      syncMarkers(L, mapRef.current);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderCoords, orders]);

  // ─── STYLES ──────────────────────────────────────────────────────────────
  const border = isDark ? '#374151' : '#e5e7eb';
  const badgeBg = isDark ? 'rgba(17,24,39,0.88)' : 'rgba(255,255,255,0.92)';
  const badgeText = isDark ? '#f9fafb' : '#111827';

  const overlayText = ordersLoading
    ? 'Загружаем заказы...'
    : orders.length === 0
    ? 'Нет доступных заказов'
    : pendingGeocode
    ? 'Определяем адреса...'
    : null;

  const badgeLabel = ordersLoading
    ? 'Загрузка...'
    : pendingGeocode
    ? `${orders.length} заказов (определяем...)`
    : allFailed
    ? `${orders.length} заказов (адреса не найдены)`
    : `${resolvedCount} из ${orders.length} на карте`;

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: '0.75rem',
        overflow: 'hidden',
        border: `1px solid ${border}`,
        height: '100%',
        minHeight: '400px',
      }}
    >
      {/* Leaflet container */}
      <div
        ref={containerRef}
        style={{ height: '100%', minHeight: '400px', width: '100%' }}
      />

      {/* Counter badge — top-right */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 1000,
          background: badgeBg,
          color: badgeText,
          borderRadius: '999px',
          padding: '4px 12px',
          fontSize: '0.78rem',
          fontWeight: 600,
          boxShadow: '0 1px 6px rgba(0,0,0,0.2)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          pointerEvents: 'none',
          border: `1px solid ${border}`,
        }}
      >
        {badgeLabel}
      </div>

      {/* Loading / geocoding / empty overlay */}
      {overlayText && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isDark ? 'rgba(17,24,39,0.65)' : 'rgba(255,255,255,0.65)',
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              fontSize: '0.9rem',
              color: isDark ? '#9ca3af' : '#6b7280',
              fontWeight: 500,
            }}
          >
            {overlayText}
          </span>
        </div>
      )}
    </div>
  );
}
