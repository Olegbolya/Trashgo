import { useState, useRef, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { searchKazanStreets } from '../../data/kazanStreets';
import { useTheme } from '../context/ThemeContext';
import { API_BASE_URL } from '../../api/client';

interface Suggestion {
  label: string;
  sub?: string;
}

interface Props {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  autoFocus?: boolean;
}

export function KazanAddressInput({ value, onChange, placeholder = 'ул. Баумана, 58', style, autoFocus }: Props) {
  const { isDark } = useTheme();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const c = {
    surface: isDark ? '#1e2433' : '#ffffff',
    border:  isDark ? '#374151' : '#e5e7eb',
    text:    isDark ? '#f9fafb' : '#111827',
    muted:   isDark ? '#9ca3af' : '#6b7280',
    subtle:  isDark ? '#1f2937' : '#f3f4f6',
    hover:   isDark ? '#374151' : '#f3f4f6',
  };

  const buildSuggestions = async (val: string) => {
    if (val.length < 2) { setSuggestions([]); setOpen(false); return; }

    // Instant local streets
    const local = searchKazanStreets(val, 6);
    const localItems: Suggestion[] = local.map(s => ({ label: s.label, sub: s.district }));
    setSuggestions(localItems);
    if (localItems.length > 0) setOpen(true);

    // Debounced Nominatim for house numbers
    if (timerRef.current) clearTimeout(timerRef.current);
    if (val.length >= 4) {
      timerRef.current = setTimeout(async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/geocode?q=${encodeURIComponent(val + ' Казань')}&limit=5`, { signal: AbortSignal.timeout(5000) });
          const data: any[] = await res.json();
          const geo: Suggestion[] = data
            .filter(d => d.address)
            .map(d => {
              const a = d.address;
              const road = a.road || a.pedestrian || a.footway || '';
              const house = a.house_number || '';
              const label = [road, house].filter(Boolean).join(', ') || d.display_name.split(',')[0];
              return { label, sub: 'Казань' };
            })
            .filter(s => s.label.length > 0);
          if (geo.length > 0) {
            // Merge: local first, then geocode entries not already in local
            const localLabels = new Set(localItems.map(l => l.label.toLowerCase()));
            const merged = [...localItems, ...geo.filter(g => !localLabels.has(g.label.toLowerCase()))].slice(0, 7);
            setSuggestions(merged);
            setOpen(true);
          }
        } catch {}
      }, 700);
    }
  };

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const pick = (label: string) => {
    onChange(label);
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <input
        value={value}
        onChange={e => { onChange(e.target.value); buildSuggestions(e.target.value); }}
        onFocus={() => { if (value.length >= 2) buildSuggestions(value); }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        style={style}
      />
      {open && suggestions.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 9999,
          background: c.surface, border: `1px solid ${c.border}`,
          borderRadius: '0.625rem', boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          marginTop: 2, overflow: 'hidden',
          maxHeight: '13rem', overflowY: 'auto',
        }}>
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={() => pick(s.label)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                width: '100%', padding: '0.5rem 0.75rem',
                background: 'none', border: 'none', cursor: 'pointer',
                textAlign: 'left', fontFamily: 'inherit',
                borderBottom: i < suggestions.length - 1 ? `1px solid ${c.border}` : 'none',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = c.hover)}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <MapPin style={{ width: '0.875rem', height: '0.875rem', flexShrink: 0, color: c.muted }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.8125rem', color: c.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.label}</div>
                {s.sub && <div style={{ fontSize: '0.7rem', color: c.muted }}>{s.sub}</div>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
