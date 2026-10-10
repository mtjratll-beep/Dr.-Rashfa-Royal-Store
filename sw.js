// Cache-first for local assets: instant repeat visits and faster app startup.
const CACHE = 'rashfa-store-v12';
const CORE = ['./', './index.html', './admin.html', './manifest.json', './brand-logo.jpg', './coffee-ad-banner.jpg'];
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.all(CORE.map(async url => {
      try { const r = await fetch(url); if (r.ok) await cache.put(url, r); } catch (_) {}
    }));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key.startsWith('rashfa-store-') && key !== CACHE) await caches.delete(key);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req);
    if (cached) return cached;
    try {
      const response = await fetch(req);
      if (response.ok && (req.destination !== 'document' || req.url.includes('coffee-pattern.jpg'))) cache.put(req, response.clone()).catch(() => {});
      return response;
    } catch (_) {
      return (await cache.match('./index.html')) || Response.error();
    }
  })());
});
