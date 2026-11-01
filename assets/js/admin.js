import { ALLERGENS, ALLERGEN_MAP, allergenIcon, TAGS } from './allergens.js';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fold = (s) => String(s || '').toLocaleLowerCase('tr').replace(/ı/g, 'i').normalize('NFD').replace(/[̀-ͯ]/g, '');
const uid = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const fmt = (n) => `${Number(n).toLocaleString('tr-TR')} ₺`;

const ICONS = {
  up: '<svg viewBox="0 0 24 24"><path d="m6 15 6-6 6 6"/></svg>',
  down: '<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>',
  edit: '<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
};

const state = { menu: null, storage: false, query: '', editing: null, editingCat: null, saving: false, pending: false };

/* ---------- API ---------- */
async function api(path, opts = {}) {
  const r = await fetch(path, { credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, ...opts });
  let data = {};
  try { data = await r.json(); } catch { /* empty */ }
  if (!r.ok) throw Object.assign(new Error(data.error || String(r.status)), { status: r.status });
  return data;
}

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toast.t);
  toast.t = setTimeout(() => { t.hidden = true; }, 2600);
}

function setStatus(text, kind = '') {
  const s = $('#saveStatus');
  s.textContent = text;
  s.className = 'topbar__status' + (kind ? ` is-${kind}` : '');
}

/* ---------- Saving (debounced autosave) ---------- */
let saveTimer;
function queueSave(delay = 500) {
  setStatus('Kaydediliyor…');
  clearTimeout(saveTimer);
  saveTimer = setTimeout(save, delay);
}

async function save() {
  if (!state.storage) { setStatus('Kaydedilemedi: veri deposu bağlı değil', 'err'); return false; }
  if (state.saving) { state.pending = true; return; }
  state.saving = true;
  try {
    const r = await api('/api/menu', { method: 'PUT', body: JSON.stringify({ menu: state.menu }) });
    state.menu = r.menu;
    const time = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    setStatus(`Tüm değişiklikler kaydedildi (${time})`, 'ok');
    return true;
  } catch (e) {
    if (e.status === 401) { toast('Oturum süresi doldu, lütfen tekrar giriş yapın.'); showLogin(); return false; }
    setStatus('Kaydedilemedi, tekrar deneniyor', 'err');
    clearTimeout(saveTimer);
    saveTimer = setTimeout(save, 4000);
    return false;
  } finally {
    state.saving = false;
    if (state.pending) { state.pending = false; save(); }
  }
}

/* ---------- Auth ---------- */
function showLogin(msg) {
  $('#appView').hidden = true;
  $('#loginView').hidden = false;
  if (msg) { $('#loginError').textContent = msg; $('#loginError').hidden = false; }
  $('#password').focus();
}

async function showApp() {
  const data = await api('/api/menu?admin=1');
  state.menu = data.menu;
  state.storage = data.storage;
  $('#storageWarn').hidden = state.storage;
  $('#loginView').hidden = true;
  $('#appView').hidden = false;
  setStatus(data.source === 'seed' ? 'Başlangıç menüsü yüklendi' : 'Hazır');
  renderCats();
  fillSettings();
}

async function boot() {
  try {
    const s = await api('/api/session');
    if (!s.passwordConfigured) {
      showLogin('Yönetici şifresi henüz tanımlanmamış. Vercel projesine ADMIN_PASSWORD ortam değişkeni eklenmelidir.');
      $('#loginBtn').disabled = true;
      return;
    }
    if (s.authed) await showApp();
    else showLogin();
  } catch {
    showLogin('Sunucuya ulaşılamadı. Lütfen sayfayı yenileyin.');
  }
}

$('#loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = $('#loginBtn');
  btn.disabled = true;
  $('#loginError').hidden = true;
  try {
    await api('/api/login', { method: 'POST', body: JSON.stringify({ password: $('#password').value }) });
    $('#password').value = '';
    await showApp();
  } catch (err) {
    $('#loginError').textContent = err.status === 401 ? 'Şifre hatalı.' : 'Giriş yapılamadı. Lütfen tekrar deneyin.';
    $('#loginError').hidden = false;
  } finally {
    btn.disabled = false;
  }
});

$('#logoutBtn').addEventListener('click', async () => {
  await api('/api/logout', { method: 'POST' }).catch(() => {});
  showLogin();
});

/* ---------- Tabs ---------- */
$$('.segmented [data-view]').forEach((b) => b.addEventListener('click', () => {
  $$('.segmented [data-view]').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
  $$('[data-panel]').forEach((p) => { p.hidden = p.dataset.panel !== b.dataset.view; });
}));

/* ---------- Category + product list ---------- */
function variantSummary(p) {
  const vs = p.variants || [];
  if (!vs.length) return 'Fiyat yok';
  const est = vs.some((v) => v.kcalEstimated) ? ' · kcal tahmini' : '';
  return vs.map((v) => `${v.label ? v.label + ' ' : ''}${fmt(v.price)}`).join(' · ') + est;
}

function thumb(p) {
  return p.image
    ? `<div class="prow__thumb"><img src="${esc(p.image)}" alt="" loading="lazy"></div>`
    : '<div class="prow__thumb prow__thumb--empty"><img src="/assets/img/logo.webp" alt=""></div>';
}

function renderCats() {
  const q = fold(state.query);
  const cats = state.menu.categories;
  $('#catList').innerHTML = cats.map((c, ci) => {
    const items = c.items.map((p, pi) => ({ p, pi })).filter(({ p }) => !q || fold(`${p.name} ${p.description}`).includes(q));
    if (q && !items.length) return '';
    return `
    <div class="cat${c.visible === false ? ' is-hidden' : ''}" data-ci="${ci}">
      <div class="cat__head">
        <h3 class="cat__name">${esc(c.name)}<small>${c.items.length} ürün${c.visible === false ? ' · gizli' : ''}</small></h3>
        <button class="icon-sm" data-act="cat-up" ${ci === 0 ? 'disabled' : ''} aria-label="Kategoriyi yukarı taşı">${ICONS.up}</button>
        <button class="icon-sm" data-act="cat-down" ${ci === cats.length - 1 ? 'disabled' : ''} aria-label="Kategoriyi aşağı taşı">${ICONS.down}</button>
        <button class="icon-sm" data-act="cat-edit" aria-label="Kategoriyi düzenle">${ICONS.edit}</button>
      </div>
      <div class="cat__body">
        ${items.map(({ p, pi }) => `
          <div class="prow${p.visible === false ? ' is-hidden' : ''}" data-pi="${pi}">
            ${thumb(p)}
            <button class="prow__main" data-act="edit" type="button">
              <p class="prow__name">${esc(p.name)}</p>
              <p class="prow__sub">${esc(variantSummary(p))}</p>
            </button>
            <div class="prow__tools">
              <label class="vis-toggle" title="Menüde göster">
                <input type="checkbox" data-act="vis" ${p.visible !== false ? 'checked' : ''} aria-label="${esc(p.name)} menüde göster">
                <span class="switch" aria-hidden="true"></span>
              </label>
              <button class="icon-sm" data-act="up" ${pi === 0 ? 'disabled' : ''} aria-label="Yukarı taşı">${ICONS.up}</button>
              <button class="icon-sm" data-act="down" ${pi === c.items.length - 1 ? 'disabled' : ''} aria-label="Aşağı taşı">${ICONS.down}</button>
            </div>
          </div>`).join('')}
        ${q ? '' : `<button class="btn-sm cat__add" data-act="add" type="button">+ Bu kategoriye ürün ekle</button>`}
      </div>
    </div>`;
  }).join('') || '<p class="muted">Sonuç bulunamadı.</p>';
}

$('#catList').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-act]');
  if (!btn) return;
  const catEl = btn.closest('.cat');
  const ci = Number(catEl.dataset.ci);
  const cats = state.menu.categories;
  const cat = cats[ci];
  const row = btn.closest('.prow');
  const pi = row ? Number(row.dataset.pi) : -1;
  const act = btn.dataset.act;
  const swap = (arr, i, j) => { [arr[i], arr[j]] = [arr[j], arr[i]]; };

  if (act === 'vis') {
    cat.items[pi].visible = btn.checked;
    row.classList.toggle('is-hidden', !btn.checked);
    queueSave();
    return;
  }
  if (act === 'cat-up' && ci > 0) swap(cats, ci, ci - 1);
  else if (act === 'cat-down' && ci < cats.length - 1) swap(cats, ci, ci + 1);
  else if (act === 'cat-edit') return openCategory(ci);
  else if (act === 'up' && pi > 0) swap(cat.items, pi, pi - 1);
  else if (act === 'down' && pi < cat.items.length - 1) swap(cat.items, pi, pi + 1);
  else if (act === 'edit') return openProduct(ci, pi);
  else if (act === 'add') return openProduct(ci, -1);
  else return;
  renderCats();
  queueSave();
});

$('#adminSearch').addEventListener('input', (e) => { state.query = e.target.value.trim(); renderCats(); });

$('#addCategory').addEventListener('click', () => {
  state.menu.categories.push({ id: uid('c_'), name: 'Yeni kategori', note: '', visible: true, items: [] });
  renderCats();
  openCategory(state.menu.categories.length - 1, true);
});

/* ---------- Category dialog ---------- */
function openCategory(ci, isNew = false) {
  const c = state.menu.categories[ci];
  state.editingCat = { ci, isNew };
  const f = $('#categoryForm');
  f.name.value = c.name;
  f.note.value = c.note || '';
  f.visible.checked = c.visible !== false;
  $('#cdTitle').textContent = isNew ? 'Yeni kategori' : 'Kategoriyi düzenle';
  $('#categoryDialog').showModal();
  f.name.focus();
  f.name.select();
}

$('#categoryForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const f = e.target;
  const c = state.menu.categories[state.editingCat.ci];
  c.name = f.name.value.trim() || 'Kategori';
  c.note = f.note.value.trim();
  c.visible = f.visible.checked;
  $('#categoryDialog').close();
  renderCats();
  queueSave(0);
});

$('#cdDelete').addEventListener('click', () => {
  const { ci } = state.editingCat;
  const c = state.menu.categories[ci];
  const msg = c.items.length
    ? `"${c.name}" kategorisi ve içindeki ${c.items.length} ürün silinecek. Emin misiniz?`
    : `"${c.name}" kategorisi silinecek. Emin misiniz?`;
  if (!confirm(msg)) return;
  state.menu.categories.splice(ci, 1);
  $('#categoryDialog').close();
  renderCats();
  queueSave(0);
});

/* ---------- Product dialog ---------- */
let draftImage = '';

function variantRow(v = { label: '', price: '', kcal: '' }) {
  const d = document.createElement('div');
  d.className = 'vrow';
  d.innerHTML = `
    <label>Porsiyon<input data-f="label" value="${esc(v.label)}" placeholder="Örnek: 120 gr" maxlength="40"></label>
    <label>Fiyat (₺)<input data-f="price" type="number" inputmode="decimal" min="0" step="any" value="${esc(v.price)}" required></label>
    <label>Kalori (kcal)<input data-f="kcal" type="number" inputmode="numeric" min="0" step="1" value="${esc(v.kcal)}"></label>
    <button type="button" class="icon-sm" data-rm aria-label="Porsiyonu sil">${ICONS.trash}</button>
    <label class="vrow__est"><input type="checkbox" data-f="est" ${v.kcalEstimated ? 'checked' : ''}> Kalori tahmini (henüz doğrulanmadı)</label>`;
  d.querySelector('[data-rm]').addEventListener('click', () => {
    if ($$('#variants .vrow').length > 1) d.remove();
  });
  return d;
}

function chip(key, label, pressed, iconHtml = '') {
  return `<button type="button" class="chip${iconHtml ? '' : ' chip--text'}" data-key="${key}" aria-pressed="${pressed}">${iconHtml}${esc(label)}</button>`;
}

function setPreview(url) {
  draftImage = url || '';
  $('#imgPreview').innerHTML = draftImage
    ? `<img src="${esc(draftImage)}" alt="Ürün görseli">`
    : '<img src="/assets/img/logo.webp" alt="" style="width:60%;height:60%;opacity:.4">';
  $('#imgRemove').hidden = !draftImage;
}

function openProduct(ci, pi) {
  const cat = state.menu.categories[ci];
  const isNew = pi < 0;
  const p = isNew
    ? { id: uid('p_'), name: '', description: '', ingredients: '', variants: [{ label: '', price: '', kcal: '' }], allergens: [], tags: [], image: '', visible: true }
    : cat.items[pi];
  state.editing = { ci, pi, isNew, id: p.id };
  const f = $('#productForm');
  $('#pdTitle').textContent = isNew ? 'Yeni ürün' : 'Ürünü düzenle';
  $('#pdEyebrow').textContent = cat.name;
  $('#pdDelete').hidden = isNew;
  $('#pdError').hidden = true;
  f.name.value = p.name;
  f.description.value = p.description || '';
  f.ingredients.value = p.ingredients || '';
  f.visible.checked = p.visible !== false;
  f.category.innerHTML = state.menu.categories.map((c, i) => `<option value="${i}" ${i === ci ? 'selected' : ''}>${esc(c.name)}</option>`).join('');
  const vw = $('#variants');
  vw.innerHTML = '';
  (p.variants && p.variants.length ? p.variants : [{ label: '', price: '', kcal: '' }]).forEach((v) => vw.appendChild(variantRow(v)));
  $('#allergenChips').innerHTML = ALLERGENS.map((a) => chip(a.key, a.name, (p.allergens || []).includes(a.key),
    `<span class="al" style="background:${a.bg};color:${a.fg}">${allergenIcon(a.key, 16)}</span>`)).join('');
  $('#tagChips').innerHTML = Object.entries(TAGS).map(([k, t]) => chip(k, t.label, (p.tags || []).includes(k))).join('');
  setPreview(p.image);
  $('#imgStatus').textContent = 'JPG, PNG ya da WEBP. Otomatik küçültülür.';
  $('#productDialog').showModal();
  if (isNew) f.name.focus();
}

$('#addVariant').addEventListener('click', () => $('#variants').appendChild(variantRow()));
['#allergenChips', '#tagChips'].forEach((sel) => $(sel).addEventListener('click', (e) => {
  const b = e.target.closest('.chip');
  if (b) b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true'));
}));

$('#productForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const f = e.target;
  const variants = $$('#variants .vrow').map((r) => ({
    label: r.querySelector('[data-f="label"]').value.trim(),
    price: Number(r.querySelector('[data-f="price"]').value),
    kcal: Number(r.querySelector('[data-f="kcal"]').value) || 0,
    ...(r.querySelector('[data-f="est"]').checked ? { kcalEstimated: true } : {}),
  })).filter((v) => v.label || v.price);
  if (!f.name.value.trim()) return showErr('Ürün adı gerekli.');
  if (!variants.length || variants.some((v) => !(v.price >= 0) || Number.isNaN(v.price))) return showErr('En az bir porsiyon ve geçerli fiyat girin.');
  const { ci, pi, isNew, id } = state.editing;
  const product = {
    id,
    name: f.name.value.trim(),
    description: f.description.value.trim(),
    ingredients: f.ingredients.value.trim(),
    variants,
    allergens: $$('#allergenChips .chip[aria-pressed="true"]').map((b) => b.dataset.key),
    tags: $$('#tagChips .chip[aria-pressed="true"]').map((b) => b.dataset.key),
    image: draftImage,
    visible: f.visible.checked,
  };
  const target = Number(f.category.value);
  const cats = state.menu.categories;
  if (!isNew) cats[ci].items.splice(pi, 1);
  if (!isNew && target === ci) cats[ci].items.splice(pi, 0, product);
  else cats[target].items.push(product);
  $('#productDialog').close();
  renderCats();
  queueSave(0);
  toast(isNew ? 'Ürün eklendi' : 'Ürün güncellendi');
});

function showErr(m) { $('#pdError').textContent = m; $('#pdError').hidden = false; }

$('#pdDelete').addEventListener('click', () => {
  const { ci, pi } = state.editing;
  const p = state.menu.categories[ci].items[pi];
  if (!confirm(`"${p.name}" silinecek. Emin misiniz?`)) return;
  state.menu.categories[ci].items.splice(pi, 1);
  $('#productDialog').close();
  renderCats();
  queueSave(0);
  toast('Ürün silindi');
});

/* image upload: resize in the browser, then send to /api/upload */
async function resizeImage(file, max = 1000) {
  const bmp = await createImageBitmap(file).catch(() => null);
  let w, h, src;
  if (bmp) { w = bmp.width; h = bmp.height; src = bmp; } else {
    src = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(file); });
    w = src.naturalWidth; h = src.naturalHeight;
  }
  const s = Math.min(1, max / Math.max(w, h));
  const c = document.createElement('canvas');
  c.width = Math.round(w * s); c.height = Math.round(h * s);
  c.getContext('2d').drawImage(src, 0, 0, c.width, c.height);
  let url = c.toDataURL('image/webp', 0.85);
  if (!url.startsWith('data:image/webp')) url = c.toDataURL('image/jpeg', 0.85);
  return url;
}

$('#imgFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  if (!state.storage) { $('#imgStatus').textContent = 'Veri deposu bağlı olmadığı için görsel yüklenemez.'; return; }
  $('#imgStatus').textContent = 'Yükleniyor…';
  try {
    const dataUrl = await resizeImage(file);
    const { url } = await api('/api/upload', { method: 'POST', body: JSON.stringify({ dataUrl }) });
    setPreview(url);
    $('#imgStatus').textContent = 'Görsel yüklendi. Kaydetmeyi unutmayın.';
  } catch {
    $('#imgStatus').textContent = 'Görsel yüklenemedi. Daha küçük bir dosya deneyin.';
  }
});
$('#imgRemove').addEventListener('click', () => setPreview(''));

/* close buttons and backdrop */
$$('dialog.sheet').forEach((d) => d.addEventListener('click', (e) => {
  if (e.target === d || e.target.closest('[data-close]')) d.close();
}));

/* ---------- Settings ---------- */
function fillSettings() {
  const s = state.menu.settings || {};
  const f = $('#settingsForm');
  f.notice.value = s.notice || '';
  f.tagline.value = s.tagline || '';
  f.address.value = s.address || '';
  f.mapsUrl.value = s.mapsUrl || '';
  f.phone1.value = (s.phones || [])[0] || '';
  f.phone2.value = (s.phones || [])[1] || '';
  f.instagram.value = s.instagram || '';
  f.website.value = s.website || '';
  f.mealCards.value = (s.mealCards || []).join(', ');
  f.footnotes.value = (s.footnotes || []).join('\n');
}

$('#settingsForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target;
  state.menu.settings = {
    ...state.menu.settings,
    notice: f.notice.value.trim(),
    tagline: f.tagline.value.trim(),
    address: f.address.value.trim(),
    mapsUrl: f.mapsUrl.value.trim(),
    phones: [f.phone1.value.trim(), f.phone2.value.trim()].filter(Boolean),
    instagram: f.instagram.value.trim().replace(/^@/, ''),
    website: f.website.value.trim(),
    mealCards: f.mealCards.value.split(',').map((x) => x.trim()).filter(Boolean),
    footnotes: f.footnotes.value.split('\n').map((x) => x.trim()).filter(Boolean),
  };
  clearTimeout(saveTimer);
  setStatus('Kaydediliyor…');
  if (await save()) toast('Ayarlar kaydedildi');
});

window.addEventListener('beforeunload', (e) => {
  if (state.saving || $('#saveStatus').textContent.startsWith('Kaydediliyor')) { e.preventDefault(); e.returnValue = ''; }
});

boot();
