import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons in Vite/webpack
import markerIcon2xUrl from 'leaflet/dist/images/marker-icon-2x.png';
import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerIcon2xUrl,
  shadowUrl: markerShadowUrl,
});

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: markerShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length >= 2) {
      map.fitBounds(points, { padding: [40, 40] });
    } else if (points.length === 1) {
      map.setView(points[0], 14);
    }
  }, [points, map]);
  return null;
}

interface Props {
  address: string;
  isDark: boolean;
}

export function MapView({ address, isDark }: Props) {
  const [currentPos, setCurrentPos] = useState<[number, number] | null>(null);
  const [destPos, setDestPos] = useState<[number, number] | null>(null);
  const [routePoints, setRoutePoints] = useState<[number, number][]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const geocodedRef = useRef(false);

  useEffect(() => {
    if (geocodedRef.current) return;
    geocodedRef.current = true;

    // Geocode address via Nominatim
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&accept-language=ru`)
      .then(r => r.json())
      .then((data: any[]) => {
        if (data[0]) {
          setDestPos([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        } else {
          setStatus('error');
        }
      })
      .catch(() => setStatus('error'));

    // Get current geolocation
    navigator.geolocation.getCurrentPosition(
      pos => setCurrentPos([pos.coords.latitude, pos.coords.longitude]),
      () => {},
      { timeout: 8000, enableHighAccuracy: false }
    );
  }, [address]);

  // Fetch route once both positions are known
  useEffect(() => {
    if (!destPos) return;
    setStatus('ready');
    if (!currentPos) return;

    const [fromLat, fromLon] = currentPos;
    const [toLat, toLon] = destPos;
    fetch(`https://router.project-osrm.org/route/v1/driving/${fromLon},${fromLat};${toLon},${toLat}?overview=full&geometries=geojson`)
      .then(r => r.json())
      .then((data: any) => {
        const coords = data?.routes?.[0]?.geometry?.coordinates;
        if (coords) {
          setRoutePoints(coords.map(([lon, lat]: [number, number]) => [lat, lon] as [number, number]));
        }
      })
      .catch(() => {});
  }, [currentPos, destPos]);

  const fitPoints: [number, number][] = [
    ...(currentPos ? [currentPos] : []),
    ...(destPos ? [destPos] : []),
  ];
  const defaultCenter: [number, number] = destPos ?? currentPos ?? [55.8304, 49.0661]; // Kazan default

  if (status === 'loading') {
    return (
      <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDark ? '#1f2937' : '#f3f4f6', borderRadius: '0.75rem' }}>
        <div style={{ fontSize: '0.875rem', color: '#6b7280' }} className="animate-pulse">Загружаем карту...</div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDark ? '#1f2937' : '#f3f4f6', borderRadius: '0.75rem' }}>
        <div style={{ fontSize: '0.875rem', color: '#9ca3af', textAlign: 'center', padding: '1rem' }}>Не удалось найти адрес на карте</div>
      </div>
    );
  }

  return (
    <div style={{ height: '280px', borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {fitPoints.length > 0 && <FitBounds points={fitPoints} />}
        {currentPos && <Marker position={currentPos} icon={greenIcon} />}
        {destPos && <Marker position={destPos} />}
        {routePoints.length > 1 && (
          <Polyline positions={routePoints} color="#2196F3" weight={4} opacity={0.8} />
        )}
      </MapContainer>
    </div>
  );
}
