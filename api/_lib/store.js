import { put, head } from '@vercel/blob';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const MENU_PATH = 'menu/current.json';

export function storageConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

export async function readSeed() {
  const file = join(process.cwd(), 'data', 'menu.json');
  return JSON.parse(await readFile(file, 'utf8'));
}

export async function readMenu() {
  if (storageConfigured()) {
    try {
      const meta = await head(MENU_PATH);
      // Version the URL by upload time: fresh after every save, still CDN cacheable.
      const v = new Date(meta.uploadedAt).getTime();
      const r = await fetch(`${meta.url}?v=${v}`, { cache: 'no-store' });
      if (r.ok) return { menu: await r.json(), source: 'blob' };
      console.error('readMenu fetch', r.status);
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
  await put(MENU_PATH, body, {
    access: 'public',
    contentType: 'application/json; charset=utf-8',
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 60,
  });
  // Keep a dated backup so a bad edit can be recovered from the Vercel Blob dashboard.
  const stamp = new Date().toISOString().slice(0, 10);
  await put(`menu/backup/${stamp}.json`, body, {
    access: 'public',
    contentType: 'application/json; charset=utf-8',
    addRandomSuffix: false,
    allowOverwrite: true,
  }).catch(() => {});
}

export async function uploadImage(buffer, contentType, ext) {
  if (!storageConfigured()) {
    throw Object.assign(new Error('storage_not_configured'), { status: 503 });
  }
  const name = `images/${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const r = await put(name, buffer, { access: 'public', contentType, addRandomSuffix: false });
  return r.url;
}
