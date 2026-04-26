import { useEffect, useRef, useState } from 'react';

interface Props {
  address: string;
  isDark: boolean;
}

export function MapView({ address, isDark }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const geocodedRef = useRef(false);

  useEffect(() => {
    if (geocodedRef.current) return;
    geocodedRef.current = true;

    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&accept-language=ru`)
      .then(r => r.json())
      .then((data: any[]) => {
        if (data[0]) {
          setCoords({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) });
          setStatus('ready');
        } else {
          setStatus('error');
        }
      })
      .catch(() => setStatus('error'));
  }, [address]);

  useEffect(() => {
    if (!coords || !containerRef.current || mapRef.current) return;

    const { lat, lon } = coords;

    // Inject Leaflet CSS from CDN once
    if (!document.querySelector('link[data-leaflet-css]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.setAttribute('data-leaflet-css', '1');
      document.head.appendChild(link);
    }

    import('leaflet').then(({ default: L }) => {
      if (!containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, { zoomControl: true }).setView([lat, lon], 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Div-based marker — no image files needed
      const icon = L.divIcon({
        html: '<div style="width:18px;height:18px;background:#2196F3;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.5)"></div>',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
        className: '',
      });

      L.marker([lat, lon], { icon }).addTo(map);
      mapRef.current = map;
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [coords]);

  const bg = isDark ? '#1f2937' : '#f3f4f6';
  const surface = isDark ? '#1e2433' : '#ffffff';
  const border = isDark ? '#374151' : '#e5e7eb';

  if (status === 'loading') {
    return (
      <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg, borderRadius: '0.75rem' }}>
        <div style={{ fontSize: '0.875rem', color: '#9ca3af' }} className="animate-pulse">Загружаем карту...</div>
      </div>
    );
  }

  if (status === 'error' || !coords) {
    return (
      <div style={{ padding: '1rem', background: bg, borderRadius: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
        <div style={{ fontSize: '0.875rem', color: '#9ca3af', textAlign: 'center' }}>Не удалось найти адрес на карте</div>
        <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
          <a
            href={`https://www.google.com/maps/search/${encodeURIComponent(address)}`}
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

  const { lat, lon } = coords;
  const gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  const twoGisUrl = `https://2gis.ru/directions/pedestrian/geo%2F${lon}%2C${lat}`;

  return (
    <div style={{ borderRadius: '0.75rem', overflow: 'hidden', border: `1px solid ${border}` }}>
      <div ref={containerRef} style={{ height: '240px', width: '100%' }} />
      <div style={{ display: 'flex', gap: '0.5rem', padding: '0.625rem', background: surface }}>
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
