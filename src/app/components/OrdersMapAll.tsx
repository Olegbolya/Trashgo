'use client';

import { useEffect, useRef } from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { API_BASE_URL } from '../../api/client';

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
  // Track which order IDs already have a marker on the map
  const markersRef = useRef<Map<string, any>>(new Map());

  // Count how many orders have resolved coords (non-null)
  const resolvedCount = orders.filter(
    (o) => orderCoords.get(o.id) !== undefined && orderCoords.get(o.id) !== null
  ).length;

  // Initialise map once on mount
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    if (!document.querySelector('link[data-leaflet-css]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.setAttribute('data-leaflet-css', '1');
      document.head.appendChild(link);
    }

    import('leaflet').then(({ default: L }) => {
      if (!containerRef.current || mapRef.current) return;

      const tileUrl = isDark
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

      const tileAttribution = isDark
        ? '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
        : '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>';

      const map = L.map(containerRef.current, { zoomControl: true }).setView(
        [55.7965, 49.108],
        12
      );

      L.tileLayer(tileUrl, {
        attribution: tileAttribution,
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;

      // Add any coords that arrived before the map was ready
      addPendingMarkers(L, map);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current.clear();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper: add markers for orders that have coords and no marker yet
  function addPendingMarkers(L: any, map: any) {
    for (const order of orders) {
      if (markersRef.current.has(order.id)) continue;

      const coords = orderCoords.get(order.id);
      if (!coords) continue;

      const priceLabel =
        order.price >= 1000
          ? `${Math.round(order.price / 1000)}k`
          : String(order.price);

      const icon = L.divIcon({
        html: `<div style="
          width:26px;
          height:26px;
          background:${accentColor};
          border-radius:50%;
          border:2px solid white;
          box-shadow:0 2px 8px rgba(0,0,0,0.45);
          display:flex;
          align-items:center;
          justify-content:center;
          color:white;
          font-size:9px;
          font-weight:700;
          font-family:sans-serif;
          cursor:pointer;
          line-height:1;
        ">${priceLabel}</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
        className: '',
      });

      const districtLine = order.district
        ? `<br/><span style="color:#6b7280;font-size:0.78rem">${order.district}</span>`
        : '';

      const popup = L.popup({ offset: [0, -10] }).setContent(
        `<div style="min-width:140px">
          <b style="font-size:0.9rem">${order.address}</b>
          <br/>
          <span style="color:${accentColor};font-weight:600">${order.price} ₽</span>
          ${districtLine}
        </div>`
      );

      const marker = L.marker([coords.lat, coords.lon], { icon })
        .addTo(map)
        .bindPopup(popup);

      marker.on('click', () => {
        onOrderClick?.(order.id);
      });

      markersRef.current.set(order.id, marker);
    }
  }

  // When orderCoords changes, add markers for newly resolved coords
  useEffect(() => {
    if (!mapRef.current) return;

    import('leaflet').then(({ default: L }) => {
      if (!mapRef.current) return;
      addPendingMarkers(L, mapRef.current);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderCoords, orders]);

  const border = isDark ? '#374151' : '#e5e7eb';
  const badgeBg = isDark ? 'rgba(17,24,39,0.85)' : 'rgba(255,255,255,0.92)';
  const badgeText = isDark ? '#f9fafb' : '#111827';

  // Show overlay only while geocoding is actually in progress
  const pendingGeocode = orders.some(o => orderCoords.get(o.id) === undefined);
  const overlayText =
    ordersLoading || (orders.length === 0 && pendingGeocode)
      ? 'Загружаем заказы...'
      : orders.length === 0
      ? null // no overlay — badge shows "0 заказов"
      : pendingGeocode
      ? 'Определяем адреса...'
      : null;
  const noCoords = overlayText !== null;

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
      {/* Map container */}
      <div ref={containerRef} style={{ height: '100%', minHeight: '400px', width: '100%' }} />

      {/* Counter badge — top-right */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
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
        {resolvedCount} заказов на карте
      </div>

      {/* "Loading addresses" overlay shown while no coords are ready */}
      {noCoords && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isDark ? 'rgba(17,24,39,0.7)' : 'rgba(255,255,255,0.7)',
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
