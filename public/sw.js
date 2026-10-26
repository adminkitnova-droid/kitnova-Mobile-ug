/* KITNOVA offline-first cache: app shell, built assets and images. */
const CACHE_NAME = 'kitnova-app-v4';
const SHELL = ['/', '/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png', '/favicon-96.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL).catch(() => {})));
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('kitnova-') && k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('sync', event => {
  if (event.tag === 'sync-pending-pods') event.waitUntil(notifyClients('TRIGGER_BACKGROUND_SYNC'));
});
self.addEventListener('message', event => {
  if (event.data?.type === 'CHECK_SW_STATUS') event.ports[0]?.postMessage({ status: 'active', version: CACHE_NAME });
  if (event.data?.type === 'FORCE_BACKGROUND_SYNC') event.waitUntil?.(notifyClients('TRIGGER_BACKGROUND_SYNC'));
});
async function notifyClients(type) {
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach(client => client.postMessage({ type, timestamp: Date.now(), source: 'service-worker' }));
}
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || !/^https?:/.test(request.url)) return;
  const url = new URL(request.url);
  const isNavigation = request.mode === 'navigate';
  const isImage = request.destination === 'image' || /\.(png|jpe?g|webp|gif|svg|avif)(\?|$)/i.test(url.pathname);
  const isStatic = url.origin === self.location.origin && (url.pathname.startsWith('/assets/') || /\.(js|css|woff2?|ttf|ico)$/.test(url.pathname));
  if (isNavigation) {
    event.respondWith(fetch(request).then(response => { if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone())); return response; }).catch(async () => (await caches.match(request)) || (await caches.match('/index.html')) || Response.error()));
    return;
  }
  if (isImage || isStatic || url.origin === self.location.origin) {
    event.respondWith(caches.match(request).then(cached => {
      const network = fetch(request).then(response => {
        if (response && (response.ok || response.type === 'opaque')) caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone())).catch(() => {});
        return response;
      }).catch(() => cached || Response.error());
      // Cache-first for images and built assets keeps the home screen fast/offline; refresh cache in background.
      if (cached) { if (isImage || isStatic) network.catch(() => {}); return cached; }
      return network;
    }));
  }
});
