import { useEffect, useState, useRef } from 'react';

interface Props {
  address: string;
  isDark: boolean;
}

export function MapView({ address, isDark }: Props) {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
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
            target="_blank"
            rel="noreferrer"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '2.25rem', borderRadius: '0.5rem', background: '#4285F4', color: 'white', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600 }}
          >
            📍 Google Maps
          </a>
          <a
            href={`https://2gis.ru/search/${encodeURIComponent(address)}`}
            target="_blank"
            rel="noreferrer"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '2.25rem', borderRadius: '0.5rem', background: '#1E9B5A', color: 'white', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600 }}
          >
            🗺️ 2GIS
          </a>
        </div>
      </div>
    );
  }

  const { lat, lon } = coords;
  const delta = 0.008;
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - delta},${lat - delta},${lon + delta},${lat + delta}&layer=mapnik&marker=${lat},${lon}`;
  const gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  const twoGisUrl = `https://2gis.ru/directions/pedestrian/geo%2F${lon}%2C${lat}`;

  return (
    <div style={{ borderRadius: '0.75rem', overflow: 'hidden', border: `1px solid ${border}` }}>
      <iframe
        src={mapSrc}
        width="100%"
        height="240"
        style={{ border: 'none', display: 'block' }}
        title="Карта"
        loading="lazy"
      />
      <div style={{ display: 'flex', gap: '0.5rem', padding: '0.625rem', background: surface }}>
        <a
          href={gmapsUrl}
          target="_blank"
          rel="noreferrer"
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', height: '2.25rem', borderRadius: '0.5rem', background: '#4285F4', color: 'white', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600 }}
        >
          📍 Google Maps
        </a>
        <a
          href={twoGisUrl}
          target="_blank"
          rel="noreferrer"
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', height: '2.25rem', borderRadius: '0.5rem', background: '#1E9B5A', color: 'white', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600 }}
        >
          🗺️ 2GIS
        </a>
      </div>
    </div>
  );
}
