import { useEffect, useRef, useState } from 'react';
import { API_BASE_URL } from '../../api/client';
import 'leaflet/dist/leaflet.css';

interface Props {
  address: string;
  isDark: boolean;
}

export function MapView({ address, isDark }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [destCoords, setDestCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<'pending' | 'granted' | 'denied'>('pending');
  const geocodedRef = useRef(false);

  // Geocode destination address — always append Kazan context for reliable results
  useEffect(() => {
    if (geocodedRef.current) return;
    geocodedRef.current = true;

    const searchQuery = /казань|kazan/i.test(address) ? address : `${address}, Казань, Россия`;
    fetch(`${API_BASE_URL}/geocode?q=${encodeURIComponent(searchQuery)}`)
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

    import('leaflet').then(({ default: L }) => {
      if (!containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, { zoomControl: true }).setView([destLat, destLon], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

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
            setGeoStatus('granted');
            const { latitude: userLat, longitude: userLon } = pos.coords;

            const userIcon = L.divIcon({
              html: '<div style="width:16px;height:16px;background:#4CAF50;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>',
              iconSize: [16, 16],
              iconAnchor: [8, 8],
              className: '',
            });
            L.marker([userLat, userLon], { icon: userIcon })
              .addTo(map)
              .bindPopup('<b>Вы здесь</b>');

            const bounds = L.latLngBounds([[userLat, userLon], [destLat, destLon]]);
            map.fitBounds(bounds, { padding: [40, 40] });

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
                L.polyline([[userLat, userLon], [destLat, destLon]], { color: '#2196F3', weight: 3, opacity: 0.6, dashArray: '8,8' }).addTo(map);
              });
          },
          () => {
            setGeoStatus('denied');
          },
          { timeout: 8000, enableHighAccuracy: false }
        );
      } else {
        setGeoStatus('denied');
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
    const addrEnc = encodeURIComponent(address + ', Казань');
    return (
      <div style={{ padding: '1rem', background: bg, borderRadius: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
        <div style={{ fontSize: '0.875rem', color: '#9ca3af', textAlign: 'center' }}>Откройте маршрут в картах</div>
        <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
          <a href={`https://yandex.ru/maps/43/kazan/?mode=routes&rtext=~${addrEnc}&rtt=auto`} target="_blank" rel="noreferrer"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '2.25rem', borderRadius: '0.5rem', background: '#FC3F1D', color: 'white', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600 }}>
            🗺️ Яндекс
          </a>
          <a href={`https://www.google.com/maps/dir/?api=1&destination=${addrEnc}`} target="_blank" rel="noreferrer"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '2.25rem', borderRadius: '0.5rem', background: '#4285F4', color: 'white', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600 }}>
            Google
          </a>
          <a href={`https://2gis.ru/kazan/search/${encodeURIComponent(address)}`} target="_blank" rel="noreferrer"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '2.25rem', borderRadius: '0.5rem', background: '#1E9B5A', color: 'white', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600 }}>
            2GIS
          </a>
        </div>
      </div>
    );
  }

  const { lat, lon } = destCoords;
  const gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
  const twoGisUrl = `https://2gis.ru/kazan/directions/points/${lon}%2C${lat}`;
  const yandexUrl = `https://yandex.ru/maps/?mode=routes&rtext=~${lat},${lon}&rtt=auto`;

  return (
    <div style={{ borderRadius: '0.75rem', overflow: 'hidden', border: `1px solid ${border}` }}>
      <div ref={containerRef} style={{ height: '260px', width: '100%' }} />
      {geoStatus === 'denied' && (
        <div style={{ padding: '0.5rem 0.75rem', background: isDark ? '#1c2333' : '#fffbeb', borderTop: `1px solid ${isDark ? '#374151' : '#fde68a'}`, fontSize: '0.72rem', color: isDark ? '#fbbf24' : '#92400e' }}>
          ⚠️ Разрешите доступ к геолокации в браузере, чтобы видеть маршрут от вашего местоположения
        </div>
      )}
      <div style={{ display: 'flex', gap: '0.5rem', padding: '0.625rem', background: surface, flexWrap: 'wrap' }}>
        <div style={{ width: '100%', display: 'flex', gap: '0.75rem', fontSize: '0.72rem', color: '#9ca3af', paddingBottom: '0.25rem' }}>
          {geoStatus === 'granted' && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#4CAF50', display: 'inline-block', border: '2px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
              Вы
            </span>
          )}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', display: 'inline-block', border: '2px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
            Адрес заказа
          </span>
        </div>
        <a
          href={yandexUrl}
          target="_blank" rel="noreferrer"
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', height: '2.25rem', borderRadius: '0.5rem', background: '#FC3F1D', color: 'white', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600 }}
        >
          🗺️ Яндекс
        </a>
        <a
          href={gmapsUrl}
          target="_blank" rel="noreferrer"
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', height: '2.25rem', borderRadius: '0.5rem', background: '#4285F4', color: 'white', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600 }}
        >
          📍 Google
        </a>
        <a
          href={twoGisUrl}
          target="_blank" rel="noreferrer"
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', height: '2.25rem', borderRadius: '0.5rem', background: '#1E9B5A', color: 'white', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600 }}
        >
          2GIS
        </a>
      </div>
    </div>
  );
}
