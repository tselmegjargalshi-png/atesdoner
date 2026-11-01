import { readMenu, writeMenu, storageConfigured } from './_lib/store.js';
import { isAuthed, json, readBody, sameOrigin } from './_lib/auth.js';
import { sanitizeMenu } from './_lib/validate.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const admin = 'admin' in (req.query || {});
      if (admin && !isAuthed(req)) return json(res, 401, { error: 'unauthorized' });
      const { menu, source } = await readMenu();
      if (admin) {
        return json(res, 200, { menu, source, storage: storageConfigured() }, { 'Cache-Control': 'no-store' });
      }
      // Public menu: hide invisible categories and products.
      const pub = {
        ...menu,
        categories: menu.categories
          .filter((c) => c.visible !== false)
          .map((c) => ({ ...c, items: c.items.filter((p) => p.visible !== false) }))
          .filter((c) => c.items.length),
      };
      return json(res, 200, pub, {
        'Cache-Control': 'public, max-age=0, s-maxage=15, stale-while-revalidate=120',
      });
    }

    if (req.method === 'PUT') {
      if (!isAuthed(req) || !sameOrigin(req)) return json(res, 401, { error: 'unauthorized' });
      const body = await readBody(req, 2_000_000);
      const clean = sanitizeMenu(body.menu || body);
      await writeMenu(clean);
      return json(res, 200, { ok: true, menu: clean }, { 'Cache-Control': 'no-store' });
    }

    res.setHeader('Allow', 'GET, PUT');
    return json(res, 405, { error: 'method_not_allowed' });
  } catch (e) {
    console.error(e);
    return json(res, e.status || 500, { error: e.message || 'server_error' });
  }
}
