import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons broken by bundlers (self-hosted, no external CDN)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet-marker-icon-2x.png',
  iconUrl: '/leaflet-marker-icon.png',
  shadowUrl: '/leaflet-marker-shadow.png',
});

interface MapPickerProps {
  onSelect: (address: string) => void;
  onClose: () => void;
}

// Kazan center
const KAZAN = { lat: 55.7887, lng: 49.1221 };

export function MapPicker({ onSelect, onClose }: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [resolving, setResolving] = useState(false);
  const [resolvedAddress, setResolvedAddress] = useState('');
  const [pickedLatLng, setPickedLatLng] = useState<L.LatLng | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([KAZAN.lat, KAZAN.lng], 13);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    map.on('click', async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      if (markerRef.current) {
        markerRef.current.setLatLng(e.latlng);
      } else {
        markerRef.current = L.marker(e.latlng).addTo(map);
      }

      setPickedLatLng(e.latlng);
      setResolving(true);
      setResolvedAddress('');

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&accept-language=ru`,
          { headers: { 'User-Agent': 'TrashGo/1.0 (trashgo.pro)' }, signal: AbortSignal.timeout(8000) }
        );
        const data = await res.json();
        const addr = data?.address;
        if (addr) {
          const road = addr.road || addr.pedestrian || addr.footway || addr.cycleway
            || addr.path || addr.street || addr.neighbourhood || addr.suburb || '';
          const houseNumber = addr.house_number || '';
          if (road && houseNumber) {
            setResolvedAddress(`${road}, ${houseNumber}`);
          } else if (road) {
            setResolvedAddress(road);
          } else {
            // display_name format: "90, улица Гареева, Казань, ..." — reorder to "улица Гареева, 90"
            const parts = (data.display_name || '').split(',').map((s: string) => s.trim()).filter(Boolean);
            const num = parts.find((p: string) => /^\d+[а-яА-Я]?$/.test(p)) || '';
            const street = parts.find((p: string) => /^(улица|ул\.|проспект|пр\.|переулок|пер\.|бульвар|б\-р|набережная|шоссе|проезд|площадь)/i.test(p)) || '';
            if (street && num) {
              setResolvedAddress(`${street}, ${num}`);
            } else {
              setResolvedAddress(parts.slice(0, 2).join(', ') || 'Казань');
            }
          }
        } else {
          setResolvedAddress(data.display_name?.split(',').slice(0, 2).join(',').trim() || '');
        }
      } catch {
        setResolvedAddress('');
      } finally {
        setResolving(false);
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  const handleConfirm = () => {
    if (resolvedAddress) {
      onSelect(resolvedAddress);
      onClose();
    }
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', flexDirection: 'column', background: '#000' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1001, background: 'rgba(255,255,255,0.95)', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', padding: '0.25rem', color: '#374151', lineHeight: 1 }}
          >✕</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827' }}>Выберите дом на карте</div>
            <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>Подъезд, этаж и кв. укажите отдельно в форме</div>
          </div>
        </div>

        {/* Map */}
        <div ref={mapRef} style={{ flex: 1, marginTop: 64 }} />

        {/* Bottom panel */}
        {pickedLatLng && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1001, background: 'white', padding: '1rem', boxShadow: '0 -2px 12px rgba(0,0,0,0.15)', borderRadius: '1rem 1rem 0 0' }}>
            {resolving ? (
              <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.875rem', padding: '0.5rem 0' }}>
                Определяем адрес...
              </div>
            ) : resolvedAddress ? (
              <>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Выбранный адрес:</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#111827', marginBottom: '0.75rem' }}>{resolvedAddress}</div>
                <button
                  onClick={handleConfirm}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: '#66BB6A', color: 'white', border: 'none', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  ✓ Использовать этот адрес
                </button>
              </>
            ) : (
              <div style={{ textAlign: 'center', color: '#ef4444', fontSize: '0.875rem', padding: '0.5rem 0' }}>
                Не удалось определить адрес. Попробуйте другую точку.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
