import { useEffect, useRef, useState } from 'react';

interface Props {
  address: string;
  isDark: boolean;
}

export function MapView({ address, isDark }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [destCoords, setDestCoords] = useState<{ lat: number; lon: number } | null>(null);
  const geocodedRef = useRef(false);

  // Geocode destination address
  useEffect(() => {
    if (geocodedRef.current) return;
    geocodedRef.current = true;

    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&accept-language=ru`)
      .then(r => r.json())
      .then((data: any[]) => {
        if (data[0]) {
          setDestCoords({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) });
          setStatus('ready');
        } else {
          setStatus('error');
        }
      })
      .catch(() => setStatus('error'));
  }, [address]);

  // Build map with route when coords are ready
  useEffect(() => {
    if (!destCoords || !containerRef.current || mapRef.current) return;

    const { lat: destLat, lon: destLon } = destCoords;

    if (!document.querySelector('link[data-leaflet-css]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.setAttribute('data-leaflet-css', '1');
      document.head.appendChild(link);
    }

    import('leaflet').then(({ default: L }) => {
      if (!containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, { zoomControl: true }).setView([destLat, destLon], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Destination marker (blue)
      const destIcon = L.divIcon({
        html: '<div style="width:20px;height:20px;background:#ef4444;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.5)"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        className: '',
      });
      L.marker([destLat, destLon], { icon: destIcon })
        .addTo(map)
        .bindPopup(`<b>Адрес заказа</b><br>${address}`)
        .openPopup();

      mapRef.current = map;

      // Try to get user's current location and draw route
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude: userLat, longitude: userLon } = pos.coords;

            // Current location marker (green)
            const userIcon = L.divIcon({
              html: '<div style="width:16px;height:16px;background:#4CAF50;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>',
              iconSize: [16, 16],
              iconAnchor: [8, 8],
              className: '',
            });
            L.marker([userLat, userLon], { icon: userIcon })
              .addTo(map)
              .bindPopup('<b>Вы здесь</b>');

            // Fit map to both points
            const bounds = L.latLngBounds([[userLat, userLon], [destLat, destLon]]);
            map.fitBounds(bounds, { padding: [40, 40] });

            // Fetch route from OSRM (free routing API)
            fetch(`https://router.project-osrm.org/route/v1/driving/${userLon},${userLat};${destLon},${destLat}?overview=full&geometries=geojson`)
              .then(r => r.json())
              .then((data: any) => {
                const coords = data?.routes?.[0]?.geometry?.coordinates;
                if (coords && coords.length > 0) {
                  const latlngs = coords.map((c: number[]) => [c[1], c[0]]);
                  L.polyline(latlngs, { color: '#2196F3', weight: 4, opacity: 0.8 }).addTo(map);
                }
              })
              .catch(() => {
                // If routing fails, just draw a straight line
                L.polyline([[userLat, userLon], [destLat, destLon]], { color: '#2196F3', weight: 3, opacity: 0.6, dashArray: '8,8' }).addTo(map);
              });
          },
          () => {
            // Geolocation denied/unavailable — just show destination
          },
          { timeout: 5000, enableHighAccuracy: false }
        );
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [destCoords, address]);

  const bg = isDark ? '#1f2937' : '#f3f4f6';
  const surface = isDark ? '#1e2433' : '#ffffff';
  const border = isDark ? '#374151' : '#e5e7eb';

  if (status === 'loading') {
    return (
      <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg, borderRadius: '0.75rem' }}>
        <div style={{ fontSize: '0.875rem', color: '#9ca3af' }} className="animate-pulse">Загружаем карту...</div>
      </div>
    );
  }

  if (status === 'error' || !destCoords) {
    return (
      <div style={{ padding: '1rem', background: bg, borderRadius: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
        <div style={{ fontSize: '0.875rem', color: '#9ca3af', textAlign: 'center' }}>Не удалось найти адрес на карте</div>
        <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`}
            target="_blank" rel="noreferrer"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '2.25rem', borderRadius: '0.5rem', background: '#4285F4', color: 'white', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600 }}
          >
            📍 Google Maps
          </a>
          <a
            href={`https://2gis.ru/search/${encodeURIComponent(address)}`}
            target="_blank" rel="noreferrer"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '2.25rem', borderRadius: '0.5rem', background: '#1E9B5A', color: 'white', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600 }}
          >
            🗺️ 2GIS
          </a>
        </div>
      </div>
    );
  }

  const { lat, lon } = destCoords;
  const gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  const twoGisUrl = `https://2gis.ru/directions/pedestrian/geo%2F${lon}%2C${lat}`;

  return (
    <div style={{ borderRadius: '0.75rem', overflow: 'hidden', border: `1px solid ${border}` }}>
      <div ref={containerRef} style={{ height: '260px', width: '100%' }} />
      <div style={{ display: 'flex', gap: '0.5rem', padding: '0.625rem', background: surface, flexWrap: 'wrap' }}>
        <div style={{ width: '100%', display: 'flex', gap: '0.35rem', fontSize: '0.72rem', color: '#9ca3af', paddingBottom: '0.25rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#4CAF50', display: 'inline-block', border: '2px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
            Вы
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', display: 'inline-block', border: '2px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
            Адрес заказа
          </span>
        </div>
        <a
          href={gmapsUrl}
          target="_blank" rel="noreferrer"
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', height: '2.25rem', borderRadius: '0.5rem', background: '#4285F4', color: 'white', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600 }}
        >
          📍 Google Maps
        </a>
        <a
          href={twoGisUrl}
          target="_blank" rel="noreferrer"
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', height: '2.25rem', borderRadius: '0.5rem', background: '#1E9B5A', color: 'white', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600 }}
        >
          🗺️ 2GIS
        </a>
      </div>
    </div>
  );
}
