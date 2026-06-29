import { Hono } from 'hono';

const geocodeRoutes = new Hono();

// In-process cache keyed by "query|limit" to avoid redundant Nominatim calls
const cache = new Map<string, unknown[]>();

// Strip apartment-level suffixes that Nominatim can't resolve
// "ул. Химиков, 45а, подъезд 1, этаж 3, кв. 35" → "ул. Химиков, 45а"
function cleanAddress(q: string): string {
  return q
    .replace(/,?\s*(подъезд|п-д|этаж|эт\.?|кв\.?|квартира|офис|оф\.?|комната|ком\.?)\s*[\d\w/-]+/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// GET /api/v1/geocode?q=...&limit=N (default 1, max 5)
// Returns full Nominatim objects — callers that only need lat/lon use data[0].lat / data[0].lon;
// callers that need address details use data[0].address.road etc.
geocodeRoutes.get('/', async (c) => {
  const q = c.req.query('q');
  const limit = Math.min(5, Math.max(1, parseInt(c.req.query('limit') ?? '1', 10) || 1));
  if (!q || q.trim().length < 3) return c.json([]);

  const key = `${cleanAddress(q.toLowerCase().trim())}|${limit}`;
  if (key.length < 3) return c.json([]);
  if (cache.has(key)) return c.json(cache.get(key));

  try {
    const params = new URLSearchParams({
      q: cleanAddress(q),
      format: 'json',
      limit: String(limit),
      'accept-language': 'ru',
      countrycodes: 'ru',
      addressdetails: '1',
      bounded: '1',
      viewbox: '48.7,56.05,49.55,55.55', // Kazan bounding box
    });
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      {
        headers: { 'User-Agent': 'TrashGo/1.0 (trashgo.pro)', 'Accept-Language': 'ru,en' },
        signal: AbortSignal.timeout(5000),
      },
    );
    const data = (await res.json()) as unknown[];
    const result = data.slice(0, limit);
    cache.set(key, result);
    if (cache.size > 2000) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) cache.delete(firstKey);
    }
    return c.json(result);
  } catch {
    return c.json([]);
  }
});

export default geocodeRoutes;
