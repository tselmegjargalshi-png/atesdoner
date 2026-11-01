// Minimal local server: serves static files and runs /api/* handlers like Vercel does.
// Usage: ADMIN_PASSWORD=test123 node scripts/dev-server.mjs  (then open http://localhost:3000)
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = process.cwd();
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json',
  '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname.startsWith('/api/')) {
    const name = url.pathname.slice(5).replace(/[^a-z]/g, '');
    try {
      const mod = await import(join(root, 'api', `${name}.js`));
      req.query = Object.fromEntries(url.searchParams);
      return mod.default(req, res);
    } catch (e) {
      res.statusCode = 404; return res.end('not found');
    }
  }
  let p = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '');
  let file = join(root, p);
  try {
    const s = await stat(file);
    if (s.isDirectory()) file = join(file, 'index.html');
  } catch {
    file = file + '.html';
  }
  try {
    const body = await readFile(file);
    res.setHeader('Content-Type', types[extname(file)] || 'application/octet-stream');
    res.end(body);
  } catch {
    res.statusCode = 404; res.end('not found');
  }
}).listen(process.env.PORT || 3000, () => console.log('http://localhost:' + (process.env.PORT || 3000)));
