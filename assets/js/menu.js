import { ALLERGENS, ALLERGEN_MAP, allergenIcon, TAGS } from './allergens.js';

const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fold = (s) => String(s || '')
  .toLocaleLowerCase('tr')
  .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c')
  .normalize('NFD').replace(/[̀-ͯ]/g, '');
const fmtPrice = (n) => `${Number(n).toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺`;
const flameSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 2s.9 3.2-1.3 5.9C10.4 10.1 8 11.6 8 15a4 4 0 0 0 8 0c0-1.3-.5-2.4-1.2-3.4 2.6 1 4.2 3.4 4.2 6A7 7 0 0 1 5 17.6C5 11.7 12.3 9.2 13.5 2z"/></svg>';

const STORE_KEY = 'ad_filters';
const state = {
  menu: null,
  excluded: new Set(loadFilters()),
  query: '',
};

function loadFilters() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || '[]').filter((k) => ALLERGEN_MAP[k]); } catch { return []; }
}
function saveFilters() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify([...state.excluded])); } catch { /* private mode */ }
}

async function loadMenu() {
  try {
    const r = await fetch('/api/menu', { headers: { Accept: 'application/json' } });
    if (!r.ok) throw new Error(String(r.status));
    return await r.json();
  } catch {
    const r = await fetch('/data/menu.json');
    const m = await r.json();
    m.categories = m.categories.filter((c) => c.visible !== false)
      .map((c) => ({ ...c, items: c.items.filter((p) => p.visible !== false) }));
    return m;
  }
}

function alChip(key) {
  const a = ALLERGEN_MAP[key];
  if (!a) return '';
  return `<span class="al" style="background:${a.bg};color:${a.fg}" title="${esc(a.name)}" role="img" aria-label="${esc(a.name)}">${allergenIcon(key, 16)}</span>`;
}

function mediaHtml(p, cls) {
  if (p.image) {
    const photo = /\.(jpe?g)(\?|$)/i.test(p.image) || p.image.includes('blob.vercel-storage.com');
    return `<div class="${cls}${photo ? ` ${cls}--photo` : ''}"><img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" decoding="async"></div>`;
  }
  return `<div class="${cls} ${cls}--empty"><img src="/assets/img/logo.webp" alt="" loading="lazy" decoding="async"></div>`;
}

function tagsHtml(p) {
  if (!p.tags || !p.tags.length) return '';
  return `<div class="tags">${p.tags.map((t) => TAGS[t] ? `<span class="tag tag--${TAGS[t].tone}">${esc(TAGS[t].label)}</span>` : '').join('')}</div>`;
}

function kcalText(p) {
  const ks = (p.variants || []).map((v) => Number(v.kcal) || 0).filter((k) => k > 0);
  if (!ks.length) return '';
  const min = Math.min(...ks), max = Math.max(...ks);
  return min === max ? `${min} kcal` : `${min} ile ${max} kcal`;
}

function pricesHtml(p) {
  const vs = p.variants || [];
  if (!vs.length) return '';
  if (vs.length === 1) {
    const v = vs[0];
    return `<div class="price-solo"><span class="price-solo__value">${fmtPrice(v.price)}</span>${v.label ? `<span class="price-solo__label">${esc(v.label)}</span>` : ''}</div>`;
  }
  return `<div class="prices">${vs.map((v) => `
    <span class="price-chip"><span class="price-chip__label">${esc(v.label)}</span><span class="price-chip__value">${fmtPrice(v.price)}</span></span>`).join('')}</div>`;
}

function cardHtml(p) {
  const kc = kcalText(p);
  const als = (p.allergens || []).map(alChip).join('');
  return `
  <button class="card" type="button" data-id="${esc(p.id)}" aria-haspopup="dialog">
    <div class="card__body">
      ${tagsHtml(p)}
      <h3 class="card__name">${esc(p.name)}</h3>
      ${p.description ? `<p class="card__desc">${esc(p.description)}</p>` : ''}
      ${p.ingredients ? `<p class="card__ing"><b>İçindekiler:</b> ${esc(p.ingredients)}</p>` : ''}
    </div>
    ${mediaHtml(p, 'card__media')}
    <div class="card__foot">
      ${kc || als ? `<div class="card__meta">${kc ? `<span class="kcal">${flameSvg}${esc(kc)}</span>` : ''}${als}</div>` : ''}
      ${pricesHtml(p)}
    </div>
  </button>`;
}

function matches(p) {
  if (state.excluded.size && (p.allergens || []).some((a) => state.excluded.has(a))) return false;
  if (state.query) {
    const hay = fold(`${p.name} ${p.description} ${p.ingredients}`);
    return state.query.split(/\s+/).every((w) => hay.includes(w));
  }
  return true;
}

function render() {
  const cats = state.menu.categories;
  const wrap = $('#sections');
  let shown = 0;
  const html = cats.map((c) => {
    const items = c.items.filter(matches);
    if (!items.length) return '';
    shown += items.length;
    return `
    <section class="section" id="k-${esc(c.id)}" data-cat="${esc(c.id)}" aria-labelledby="h-${esc(c.id)}">
      <div class="section__head">
        <h2 class="display section__title" id="h-${esc(c.id)}">${esc(c.name)}</h2>
        <span class="section__count">${items.length} ürün</span>
      </div>
      ${c.note ? `<p class="section__note">${esc(c.note)}</p>` : ''}
      <div class="grid">${items.map(cardHtml).join('')}</div>
    </section>`;
  }).join('');
  wrap.innerHTML = html;
  $('#empty').hidden = shown > 0;
  renderTabs();
  updateFilterUi();
  observeSections();
}

function renderTabs() {
  const tabs = $('#tabs');
  const visible = [...document.querySelectorAll('.section')].map((s) => s.dataset.cat);
  const cats = state.menu.categories.filter((c) => visible.includes(c.id));
  tabs.innerHTML = cats.map((c, i) => `<a class="tab" href="#k-${esc(c.id)}" data-cat="${esc(c.id)}"${i === 0 ? ' aria-current="true"' : ''}>${esc(c.name)}</a>`).join('');
}

let observer;
function observeSections() {
  if (observer) observer.disconnect();
  const tabs = $('#tabs');
  const setActive = (id) => {
    tabs.querySelectorAll('.tab').forEach((t) => {
      const on = t.dataset.cat === id;
      if (on) {
        t.setAttribute('aria-current', 'true');
        const l = t.offsetLeft - tabs.clientWidth / 2 + t.clientWidth / 2;
        tabs.scrollTo({ left: Math.max(0, l), behavior: 'smooth' });
      } else t.removeAttribute('aria-current');
    });
  };
  observer = new IntersectionObserver((entries) => {
    const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    if (vis[0]) setActive(vis[0].target.dataset.cat);
  }, { rootMargin: '-90px 0px -60% 0px', threshold: 0 });
  document.querySelectorAll('.section').forEach((s) => observer.observe(s));
}

/* ---------- Filters ---------- */
function updateFilterUi() {
  const n = state.excluded.size;
  const count = $('#filterCount');
  count.hidden = !n;
  count.textContent = n;
  $('#filterToggle').classList.toggle('is-active', n > 0);
  $('#filterBanner').hidden = !n;
  if (n) {
    const names = [...state.excluded].map((k) => ALLERGEN_MAP[k].name).join(', ');
    $('#filterBannerText').textContent = `Gizlenen alerjenler: ${names}`;
  }
  document.querySelectorAll('[data-al-toggle]').forEach((b) => b.setAttribute('aria-pressed', String(state.excluded.has(b.dataset.alToggle))));
}

function buildLegend() {
  $('#legendGrid').innerHTML = ALLERGENS.map((a) => `
    <li class="legend__item">
      <button type="button" data-al-toggle="${a.key}" aria-pressed="false" title="${esc(a.long)}">
        <span class="legend__icon" style="background:${a.bg};color:${a.fg}">${allergenIcon(a.key, 30)}</span>
        <span class="legend__name">${esc(a.name)}</span>
      </button>
    </li>`).join('');
  $('#legendGrid').addEventListener('click', (e) => {
    const b = e.target.closest('[data-al-toggle]');
    if (!b) return;
    const k = b.dataset.alToggle;
    state.excluded.has(k) ? state.excluded.delete(k) : state.excluded.add(k);
    saveFilters();
    render();
  });
}

let draft = new Set();
function buildFilterSheet() {
  const grid = $('#filterGrid');
  grid.innerHTML = ALLERGENS.map((a) => `
    <button type="button" class="filter-opt" data-key="${a.key}" aria-pressed="false">
      <span class="al" style="background:${a.bg};color:${a.fg}">${allergenIcon(a.key, 20)}</span>
      <span class="filter-opt__name">${esc(a.name)}</span>
    </button>`).join('');
  const sync = () => {
    grid.querySelectorAll('.filter-opt').forEach((b) => b.setAttribute('aria-pressed', String(draft.has(b.dataset.key))));
    const n = state.menu.categories.reduce((s, c) => s + c.items.filter((p) => !(p.allergens || []).some((a) => draft.has(a))).length, 0);
    $('#filterApply').textContent = `Uygula (${n} ürün)`;
  };
  grid.addEventListener('click', (e) => {
    const b = e.target.closest('.filter-opt');
    if (!b) return;
    const k = b.dataset.key;
    draft.has(k) ? draft.delete(k) : draft.add(k);
    sync();
  });
  $('#filterToggle').addEventListener('click', () => {
    draft = new Set(state.excluded);
    sync();
    openSheet($('#filterSheet'));
  });
  $('#filterReset').addEventListener('click', () => { draft.clear(); sync(); });
  $('#filterApply').addEventListener('click', () => {
    state.excluded = new Set(draft);
    saveFilters();
    render();
    $('#filterSheet').close();
  });
  $('#filterBannerClear').addEventListener('click', () => { state.excluded.clear(); saveFilters(); render(); });
}

/* ---------- Search ---------- */
function setupSearch() {
  const toggle = $('#searchToggle'), row = $('#searchRow'), input = $('#searchInput'), clear = $('#searchClear');
  toggle.addEventListener('click', () => {
    const open = row.hidden;
    row.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    if (open) input.focus();
    else if (state.query) { input.value = ''; state.query = ''; clear.hidden = true; render(); }
  });
  let t;
  input.addEventListener('input', () => {
    clear.hidden = !input.value;
    clearTimeout(t);
    t = setTimeout(() => { state.query = fold(input.value.trim()); render(); }, 120);
  });
  clear.addEventListener('click', () => { input.value = ''; clear.hidden = true; state.query = ''; render(); input.focus(); });
}

/* ---------- Product sheet ---------- */
function findProduct(id) {
  for (const c of state.menu.categories) for (const p of c.items) if (p.id === id) return { p, c };
  return null;
}

function openProduct(id) {
  const hit = findProduct(id);
  if (!hit) return;
  const { p, c } = hit;
  const rows = (p.variants || []).map((v) => `<tr><td>${esc(v.label || 'Porsiyon')}</td><td>${v.kcal ? `${v.kcal} kcal` : ''}</td><td>${fmtPrice(v.price)}</td></tr>`).join('');
  const als = (p.allergens || []).filter((k) => ALLERGEN_MAP[k]);
  $('#productBody').innerHTML = `
    ${mediaHtml(p, 'pd__media')}
    <p class="eyebrow">${esc(c.name)}</p>
    <h2 class="display pd__title" id="sheetTitle">${esc(p.name)}</h2>
    ${tagsHtml(p) ? `<div style="margin-top:10px">${tagsHtml(p)}</div>` : ''}
    ${p.description ? `<p class="pd__desc">${esc(p.description)}</p>` : ''}
    ${p.ingredients ? `<p class="pd__ing"><b>İçindekiler:</b> ${esc(p.ingredients)}</p>` : ''}
    ${rows ? `<p class="pd__h">Porsiyon ve fiyat</p><table class="pd__table"><tbody>${rows}</tbody></table>` : ''}
    <p class="pd__h">Alerjenler</p>
    ${als.length ? `<div class="pd__als">${als.map((k) => `<span class="pd__al">${alChip(k)}${esc(ALLERGEN_MAP[k].name)}</span>`).join('')}</div>` : '<p class="pd__none">Bu ürün için belirtilmiş bir alerjen yoktur.</p>'}
    <p class="pd__foot">Kalori değerleri yaklaşıktır. Alerjiniz varsa lütfen sipariş öncesi personelimize danışınız.</p>`;
  openSheet($('#productSheet'));
}

function openSheet(d) {
  if (typeof d.showModal === 'function') d.showModal();
  else d.setAttribute('open', '');
}

function setupSheets() {
  document.querySelectorAll('dialog.sheet').forEach((d) => {
    d.addEventListener('click', (e) => {
      if (e.target === d || e.target.closest('[data-close]')) d.close();
    });
  });
  $('#sections').addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    if (card) openProduct(card.dataset.id);
  });
}

/* ---------- Settings driven content ---------- */
function applySettings(s = {}) {
  const tel = (p) => 'tel:+90' + String(p).replace(/\D/g, '').replace(/^0/, '');
  if (s.phones && s.phones[0]) $('#callBtn').href = tel(s.phones[0]);
  if (s.mapsUrl) $('#mapBtn').href = s.mapsUrl;
  if (s.instagram) $('#igBtn').href = `https://instagram.com/${encodeURIComponent(s.instagram)}`;
  if (s.address) $('#address').textContent = s.address;
  if (s.notice) { $('#notice').textContent = s.notice; $('#notice').hidden = false; }
  $('#footnotes').innerHTML = (s.footnotes || []).map((f) => `<li>${esc(f)}</li>`).join('');
  const links = [];
  if (s.mapsUrl) links.push(`<a class="pill-btn" href="${esc(s.mapsUrl)}" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>Yol tarifi al</a>`);
  if (s.instagram) links.push(`<a class="pill-btn" href="https://instagram.com/${encodeURIComponent(s.instagram)}" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 7.3A4.7 4.7 0 1 0 16.7 12 4.7 4.7 0 0 0 12 7.3zm0 7.7a3 3 0 1 1 3-3 3 3 0 0 1-3 3zm6-7.9a1.1 1.1 0 1 1-1.1-1.1A1.1 1.1 0 0 1 18 7.1z"/><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>@${esc(s.instagram)}</a>`);
  for (const p of s.phones || []) links.push(`<a class="pill-btn" href="${tel(p)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"/></svg>${esc(p)}</a>`);
  if (s.website) links.push(`<a class="pill-btn" href="https://${esc(s.website.replace(/^https?:\/\//, ''))}" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm6.9 6h-3a15.7 15.7 0 0 0-1.4-3.6A8 8 0 0 1 18.9 8zM12 4a14 14 0 0 1 1.9 4h-3.8A14 14 0 0 1 12 4zM4.3 14a8.2 8.2 0 0 1 0-4h3.4a16.5 16.5 0 0 0 0 4zm.8 2h3a15.7 15.7 0 0 0 1.4 3.6A8 8 0 0 1 5.1 16zm3-8h-3a8 8 0 0 1 4.4-3.6A15.7 15.7 0 0 0 8.1 8zM12 20a14 14 0 0 1-1.9-4h3.8A14 14 0 0 1 12 20zm2.3-6H9.7a14.7 14.7 0 0 1 0-4h4.6a14.7 14.7 0 0 1 0 4zm.3 5.6a15.7 15.7 0 0 0 1.4-3.6h3a8 8 0 0 1-4.4 3.6zm1.7-5.6a16.5 16.5 0 0 0 0-4h3.4a8.2 8.2 0 0 1 0 4z"/></svg>${esc(s.website.replace(/^https?:\/\//, ''))}</a>`);
  $('#contactLinks').innerHTML = links.join('');
  const mc = s.mealCards || [];
  $('#mealCards').hidden = !mc.length;
  $('#mealCards ul').innerHTML = mc.map((m) => `<li>${esc(m)}</li>`).join('');
  $('#year').textContent = new Date().getFullYear();
}

async function init() {
  buildLegend();
  setupSheets();
  setupSearch();
  try {
    state.menu = await loadMenu();
  } catch {
    $('#sections').innerHTML = '<p class="empty">Menü şu an yüklenemedi. Lütfen sayfayı yenileyin.</p>';
    return;
  }
  applySettings(state.menu.settings);
  buildFilterSheet();
  render();
}

init();
