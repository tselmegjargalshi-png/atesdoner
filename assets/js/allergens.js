// 14 standard allergens (EU 1169/2011 and Türk Gıda Kodeksi), Turkish labels, simple line icons.
const c = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}"/>`;

export const ALLERGENS = [
  { key: 'gluten', name: 'Gluten', long: 'Gluten içeren tahıllar', bg: '#B5713A', fg: '#FFF6EA',
    svg: '<path d="M12 22V8"/><path d="M12 8c-2.2-.8-3.4-2.6-3.4-5 2.2.3 3.4 2 3.4 5z"/><path d="M12 8c2.2-.8 3.4-2.6 3.4-5-2.2.3-3.4 2-3.4 5z"/><path d="M12 13.5c-2.3-.7-3.8-2.3-3.8-4.6 2.3.2 3.8 2 3.8 4.6z"/><path d="M12 13.5c2.3-.7 3.8-2.3 3.8-4.6-2.3.2-3.8 2-3.8 4.6z"/><path d="M12 19c-2.3-.7-3.8-2.3-3.8-4.6 2.3.2 3.8 2 3.8 4.6z"/><path d="M12 19c2.3-.7 3.8-2.3 3.8-4.6-2.3.2-3.8 2-3.8 4.6z"/>' },
  { key: 'kabuklu', name: 'Kabuklular', long: 'Kabuklu deniz ürünleri', bg: '#3D7BD9', fg: '#F3F8FF',
    svg: '<ellipse cx="12" cy="13.5" rx="5" ry="3.8"/><path d="M8 11.5 4.5 7.5l2.8-1.2M4.5 7.5l-.8 3"/><path d="m16 11.5 3.5-4-2.8-1.2m2.8 1.2.8 3"/><path d="m7.4 15.3-3 1.8M16.6 15.3l3 1.8M8.6 16.9l-1.8 2.8M15.4 16.9l1.8 2.8"/>' },
  { key: 'yumurta', name: 'Yumurta', long: 'Yumurta ve ürünleri', bg: '#F2C230', fg: '#3A2600',
    svg: '<path d="M12 3c3.6 0 6.5 5.6 6.5 10a6.5 6.5 0 0 1-13 0C5.5 8.6 8.4 3 12 3z"/>' },
  { key: 'balik', name: 'Balık', long: 'Balık ve ürünleri', bg: '#2A9BD6', fg: '#F2FAFF',
    svg: '<path d="M3 12c3-4.8 9.2-6 13-2l5-3v10l-5-3c-3.8 4-10 2.8-13-2z"/><path d="M8 11.2h.01" stroke-width="2.6"/>' },
  { key: 'yerfistigi', name: 'Yer fıstığı', long: 'Yer fıstığı ve ürünleri', bg: '#D9A35B', fg: '#2E1A04',
    svg: '<path d="M12 3a4 4 0 0 1 4 4c0 1.6-.9 2.4-.9 3.6s.9 2 .9 3.6a4 4 0 0 1-8 0c0-1.6.9-2.4.9-3.6S8 8.6 8 7a4 4 0 0 1 4-4z"/><path d="M11 7h.01M13 9h.01M11 14h.01M13 16h.01" stroke-width="2.2"/>' },
  { key: 'soya', name: 'Soya', long: 'Soya fasulyesi ve ürünleri', bg: '#4FA35A', fg: '#F2FFF3',
    svg: '<path d="M5 19C5 11 11 5 19 5c0 8-6 14-14 14z"/>' + c(9.6, 14.4, 1.3) + c(12, 12, 1.3) + c(14.4, 9.6, 1.3) },
  { key: 'sut', name: 'Süt', long: 'Süt ve süt ürünleri (laktoz dahil)', bg: '#E9E1D3', fg: '#2B2118',
    svg: '<path d="M9.5 3h5M10 3v3L8 9v11a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V9l-2-3V3"/><path d="M8 13h8"/>' },
  { key: 'kuruyemis', name: 'Kuruyemiş', long: 'Sert kabuklu yemişler', bg: '#8C5A3C', fg: '#FFF3E8',
    svg: '<path d="M4.5 10.5c0-3.2 3.4-5.5 7.5-5.5s7.5 2.3 7.5 5.5z"/><path d="M12 5V2.8"/><path d="M6 10.5c0 5 3 9 6 10.2 3-1.2 6-5.2 6-10.2"/>' },
  { key: 'kereviz', name: 'Kereviz', long: 'Kereviz ve ürünleri', bg: '#86B94B', fg: '#F6FFEC',
    svg: '<path d="M8 21c0-6 1-11 3-16M12 21c0-6 .4-11 1-16M16 21c0-5-1-10-3-15"/><path d="M11 5C10 4 8 3 6 3.8M13 5c1-1 3-2 5-1.2"/>' },
  { key: 'hardal', name: 'Hardal', long: 'Hardal ve ürünleri', bg: '#D7A21E', fg: '#2E2000',
    svg: '<path d="M11 2h2l.8 4h-3.6z"/><path d="M9 6h6l1 3v11a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V9z"/><path d="M8 13h8"/>' },
  { key: 'susam', name: 'Susam', long: 'Susam tohumu ve ürünleri', bg: '#EE8A2E', fg: '#FFF7EE',
    svg: '<ellipse cx="8" cy="9" rx="2" ry="3.2" transform="rotate(-30 8 9)"/><ellipse cx="16" cy="8.5" rx="2" ry="3.2" transform="rotate(25 16 8.5)"/><ellipse cx="12" cy="16" rx="2" ry="3.2" transform="rotate(5 12 16)"/>' },
  { key: 'sulfit', name: 'Sülfitler', long: 'Kükürt dioksit ve sülfitler', bg: '#9E2B3A', fg: '#FFF0F2',
    svg: '<path d="M8 3h8l-.5 5a3.5 3.5 0 0 1-7 0z"/><path d="M12 11.5V20M8.5 21h7"/>' },
  { key: 'lupin', name: 'Acı bakla', long: 'Acı bakla (lupin) ve ürünleri', bg: '#8E6CC7', fg: '#F8F3FF',
    svg: c(12, 4.2, 1.5) + c(9.8, 7.6, 1.5) + c(14.2, 7.6, 1.5) + c(9.8, 11.2, 1.5) + c(14.2, 11.2, 1.5) + c(12, 14.4, 1.5) + '<path d="M12 16v6M12 19c-2-1.2-4-1.2-6 0M12 19c2-1.2 4-1.2 6 0"/>' },
  { key: 'yumusakca', name: 'Yumuşakçalar', long: 'Yumuşakçalar (midye, kalamar vb.)', bg: '#2BA79A', fg: '#EFFFFC',
    svg: '<path d="M12 20 4 11.5a8 8 0 0 1 16 0z"/><path d="M12 20V6.5M12 20 7.8 8.4M12 20l4.2-11.6M9.8 20h4.4"/>' },
];

export const ALLERGEN_MAP = Object.fromEntries(ALLERGENS.map((a) => [a.key, a]));

export function allergenIcon(key, size = 22) {
  const a = ALLERGEN_MAP[key];
  if (!a) return '';
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${a.svg}</svg>`;
}

export const TAGS = {
  populer: { label: 'Çok sevilen', tone: 'flame' },
  acili: { label: 'Acılı', tone: 'red' },
  peynirli: { label: 'Peynirli', tone: 'yellow' },
  yeni: { label: 'Yeni', tone: 'cream' },
  vejetaryen: { label: 'Vejetaryen', tone: 'green' },
};
