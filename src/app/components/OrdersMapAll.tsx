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
  onOrderClick?: (orderIds: string[]) => void;
  accentColor?: string;
}

// Round to 4 decimal places (~11 m precision) so orders at the same address
// share one marker even if Nominatim returns marginally different coords.
function coordKey(lat: number, lon: number) {
  return `${lat.toFixed(4)},${lon.toFixed(4)}`;
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
  // Markers keyed by coordKey (one marker per unique location, may hold many orders)
  const markersRef = useRef<Map<string, any>>(new Map());
  // Track which order IDs each marker currently represents (for change detection)
  const markerOrdersRef = useRef<Map<string, string[]>>(new Map());
  const hasFitRef = useRef(false);

  // ─── ALWAYS-FRESH REFS ────────────────────────────────────────────────────
  const ordersRef = useRef(orders);
  const orderCoordsRef = useRef(orderCoords);
  const onOrderClickRef = useRef(onOrderClick);
  const accentRef = useRef(accentColor);
  ordersRef.current = orders;
  orderCoordsRef.current = orderCoords;
  onOrderClickRef.current = onOrderClick;
  accentRef.current = accentColor;

  // ─── DERIVED STATE ────────────────────────────────────────────────────────
  const resolvedCount = orders.filter(
    (o) => orderCoords.get(o.id) !== undefined && orderCoords.get(o.id) !== null
  ).length;
  const pendingGeocode = orders.some((o) => orderCoords.get(o.id) === undefined);
  const allFailed =
    !ordersLoading && orders.length > 0 && !pendingGeocode && resolvedCount === 0;

  // ─── SYNC MARKERS ────────────────────────────────────────────────────────
  function syncMarkers(L: any, map: any) {
    const curOrders = ordersRef.current;
    const curCoords = orderCoordsRef.current;
    const accent = accentRef.current;

    // Build coord-groups: one entry per unique location with all orders at that location.
    const groups = new Map<string, { lat: number; lon: number; orders: Order[] }>();
    for (const order of curOrders) {
      const coords = curCoords.get(order.id);
      if (!coords) continue;
      const key = coordKey(coords.lat, coords.lon);
      if (!groups.has(key)) groups.set(key, { lat: coords.lat, lon: coords.lon, orders: [] });
      groups.get(key)!.orders.push(order);
    }

    // Remove markers whose location no longer has any orders.
    for (const [key, marker] of markersRef.current.entries()) {
      if (!groups.has(key)) {
        map.removeLayer(marker);
        markersRef.current.delete(key);
        markerOrdersRef.current.delete(key);
      }
    }

    // Add or update markers for each coord group.
    for (const [key, group] of groups.entries()) {
      const currentIds = (markerOrdersRef.current.get(key) ?? []).slice().sort().join(',');
      const newIds = group.orders.map((o) => o.id).slice().sort().join(',');
      if (markersRef.current.has(key) && currentIds === newIds) continue; // no change

      // Remove stale marker if it exists.
      if (markersRef.current.has(key)) {
        map.removeLayer(markersRef.current.get(key));
        markersRef.current.delete(key);
      }

      const { lat, lon, orders: grpOrders } = group;
      const multi = grpOrders.length > 1;
      const totalPrice = grpOrders.reduce((s, o) => s + o.price, 0);

      const priceLabel =
        totalPrice >= 1000
          ? `${Math.round(totalPrice / 1000)}k`
          : String(totalPrice);

      const icon = L.divIcon({
        html: `<div style="
            position:relative;
            width:${multi ? 44 : 38}px;height:${multi ? 44 : 38}px;
            background:${accent};border-radius:50%;
            border:2.5px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,0.45);
            display:flex;flex-direction:column;align-items:center;justify-content:center;
            color:#fff;font-family:system-ui,sans-serif;cursor:pointer;gap:0;line-height:1.1;">
          <span style="font-size:${multi ? 9 : 10}px;font-weight:800">${priceLabel}</span>
          <span style="font-size:7px;font-weight:600;opacity:.9">₽</span>
          ${multi ? `<div style="
              position:absolute;top:-5px;right:-5px;
              background:#ef4444;color:#fff;font-size:9px;font-weight:800;
              border-radius:50%;width:16px;height:16px;
              display:flex;align-items:center;justify-content:center;
              border:1.5px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.3);">${grpOrders.length}</div>` : ''}
        </div>`,
        iconSize: [multi ? 44 : 38, multi ? 44 : 38],
        iconAnchor: [multi ? 22 : 19, multi ? 22 : 19],
        className: '',
      });

      const popupBody = multi
        ? `<b style="font-size:0.88rem;color:#111">${grpOrders[0].address}</b>
           <br/><span style="color:#6b7280;font-size:0.78rem">${grpOrders.length} заявки по этому адресу</span>
           <br/><span style="color:${accent};font-weight:700;font-size:1rem">${totalPrice} ₽ суммарно</span>
           <br/><span style="color:#4b5563;font-size:0.8rem">Нажмите для выбора заявки</span>`
        : (() => {
            const o = grpOrders[0];
            const districtLine = o.district
              ? `<br/><span style="color:#6b7280;font-size:0.78rem">${o.district}</span>`
              : '';
            return `<b style="font-size:0.88rem;color:#111">${o.address}</b>
              ${districtLine}
              <br/><span style="color:${accent};font-weight:700;font-size:1rem">${o.price} ₽</span>
              <br/><span style="color:#4b5563;font-size:0.8rem">Нажмите для просмотра</span>`;
          })();

      const popup = L.popup({ offset: [0, -16], maxWidth: 220 }).setContent(
        `<div style="min-width:150px;font-family:system-ui,sans-serif">${popupBody}</div>`
      );

      const marker = L.marker([lat, lon], { icon })
        .addTo(map)
        .bindPopup(popup);

      const ids = grpOrders.map((o) => o.id);
      marker.on('click', () => {
        onOrderClickRef.current?.(ids);
      });

      markersRef.current.set(key, marker);
      markerOrdersRef.current.set(key, ids);
    }

    // Auto-fit to show all markers on first load.
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

      const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      const attribution = '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>';

      const map = L.map(containerRef.current, { zoomControl: true }).setView(
        [55.7965, 49.108],
        12
      );
      L.tileLayer(tileUrl, { attribution, maxZoom: 19 }).addTo(map);
      mapRef.current = map;

      requestAnimationFrame(() => {
        if (mapRef.current) mapRef.current.invalidateSize();
      });

      syncMarkers(L, map);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current.clear();
        markerOrdersRef.current.clear();
        hasFitRef.current = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── RE-SYNC ON DATA CHANGE ───────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;
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
