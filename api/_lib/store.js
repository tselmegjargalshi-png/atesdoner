import { put, head, list, del } from '@vercel/blob';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export function storageConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

export async function readSeed() {
  const file = join(process.cwd(), 'data', 'menu.json');
  return JSON.parse(await readFile(file, 'utf8'));
}

// Public Blob URLs are CDN cached and an overwrite can take up to 60 s to show.
// So every save writes an immutable version file, and a small pointer blob carries
// the current version id in its content type. head() reads metadata from the Blob
// API (not the CDN), so the pointer is always fresh and the version file never stale.
const POINTER = 'menu/current.json';
const VERSION_DIR = 'menu/v/';

export async function readMenu() {
  if (storageConfigured()) {
    try {
      const meta = await head(POINTER);
      const m = /version=([a-z0-9]+)/i.exec(meta.contentType || '');
      if (m) {
        const origin = new URL(meta.url).origin;
        const r = await fetch(`${origin}/${VERSION_DIR}${m[1]}.json`);
        if (r.ok) return { menu: await r.json(), source: 'blob' };
        console.error('readMenu version fetch', r.status);
      }
    } catch (e) {
      const msg = String((e && e.message) || e);
      if (!/not.?found|does not exist/i.test(msg)) console.error('readMenu', e);
    }
  }
  return { menu: await readSeed(), source: 'seed' };
}

export async function writeMenu(menu) {
  if (!storageConfigured()) {
    throw Object.assign(new Error('storage_not_configured'), { status: 503 });
  }
  const body = JSON.stringify(menu);
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  await put(`${VERSION_DIR}${id}.json`, body, {
    access: 'public',
    contentType: 'application/json; charset=utf-8',
    addRandomSuffix: false,
    cacheControlMaxAge: 31536000,
  });
  await put(POINTER, id, {
    access: 'public',
    contentType: `text/plain; version=${id}`,
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 60,
  });
  // Occasionally prune old versions (keeps the newest 40 as an undo history).
  if (Math.random() < 0.1) {
    try {
      const { blobs } = await list({ prefix: VERSION_DIR, limit: 1000 });
      const old = blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)).slice(40).map((b) => b.url);
      if (old.length) await del(old);
    } catch (e) { console.error('prune', e); }
  }
}

export async function uploadImage(buffer, contentType, ext) {
  if (!storageConfigured()) {
    throw Object.assign(new Error('storage_not_configured'), { status: 503 });
  }
  const name = `images/${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const r = await put(name, buffer, { access: 'public', contentType, addRandomSuffix: false });
  return r.url;
}
