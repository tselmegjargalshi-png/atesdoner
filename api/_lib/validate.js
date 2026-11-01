export const ALLERGEN_KEYS = [
  'gluten', 'kabuklu', 'yumurta', 'balik', 'yerfistigi', 'soya', 'sut',
  'kuruyemis', 'kereviz', 'hardal', 'susam', 'sulfit', 'lupin', 'yumusakca',
];
export const TAG_KEYS = ['populer', 'acili', 'peynirli', 'yeni', 'vejetaryen'];

const str = (v, max = 400) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const num = (v, min = 0, max = 100000) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n * 100) / 100)) : 0;
};
const safeUrl = (v) => {
  const s = str(v, 600);
  if (!s) return '';
  if (s.startsWith('/assets/')) return s;
  try {
    const u = new URL(s);
    return u.protocol === 'https:' ? u.toString() : '';
  } catch {
    return '';
  }
};
const safeId = (v, fallback) => {
  const s = str(v, 60).replace(/[^a-zA-Z0-9_]/g, '');
  return s || fallback;
};

export function sanitizeMenu(input) {
  if (!input || typeof input !== 'object' || !Array.isArray(input.categories)) {
    throw Object.assign(new Error('invalid_menu'), { status: 400 });
  }
  const s = input.settings || {};
  const settings = {
    name: str(s.name, 80) || 'Ateş Döner',
    branch: str(s.branch, 80),
    tagline: str(s.tagline, 160),
    since: str(s.since, 10),
    notice: str(s.notice, 300),
    address: str(s.address, 200),
    mapsUrl: safeUrl(s.mapsUrl),
    instagram: str(s.instagram, 60).replace(/^@/, ''),
    phones: (Array.isArray(s.phones) ? s.phones : []).map((p) => str(p, 30)).filter(Boolean).slice(0, 4),
    website: str(s.website, 120),
    mealCards: (Array.isArray(s.mealCards) ? s.mealCards : []).map((p) => str(p, 40)).filter(Boolean).slice(0, 12),
    footnotes: (Array.isArray(s.footnotes) ? s.footnotes : []).map((p) => str(p, 300)).filter(Boolean).slice(0, 12),
  };
  const seen = new Set();
  const uid = (prefix, v) => {
    let id = safeId(v, prefix + Math.random().toString(36).slice(2, 8));
    while (seen.has(id)) id = prefix + Math.random().toString(36).slice(2, 8);
    seen.add(id);
    return id;
  };
  const categories = input.categories.slice(0, 60).map((c) => ({
    id: uid('c_', c.id),
    name: str(c.name, 80) || 'Kategori',
    note: str(c.note, 240),
    visible: c.visible !== false,
    items: (Array.isArray(c.items) ? c.items : []).slice(0, 120).map((p) => ({
      id: uid('p_', p.id),
      name: str(p.name, 100) || 'Ürün',
      description: str(p.description, 500),
      ingredients: str(p.ingredients, 300),
      variants: (Array.isArray(p.variants) ? p.variants : []).slice(0, 8).map((v) => ({
        label: str(v.label, 40),
        price: num(v.price),
        kcal: num(v.kcal, 0, 5000),
        ...(v.kcalEstimated ? { kcalEstimated: true } : {}),
      })),
      allergens: (Array.isArray(p.allergens) ? p.allergens : []).filter((a) => ALLERGEN_KEYS.includes(a)),
      tags: (Array.isArray(p.tags) ? p.tags : []).filter((t) => TAG_KEYS.includes(t)),
      image: safeUrl(p.image),
      visible: p.visible !== false,
    })),
  }));
  return { version: 1, updatedAt: new Date().toISOString(), settings, categories };
}
