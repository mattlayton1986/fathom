const CACHE_NAME = 'fathom-static-v1';

const STATIC_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/icons/fathom-192.png',
  '/icons/fathom-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );

  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (
    event.request.method !== 'GET' ||
    url.origin !== self.location.origin
  ) return;

  const isAppShellRequest =
    event.request.mode === 'navigate' && url.pathname === '/';

  const isStaticAssetRequest = url.pathname.startsWith('/_next/static');

  if (!isAppShellRequest && !isStaticAssetRequest) return;

  if (isAppShellRequest) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          _saveResponse('/', response, event);
          return response;
        })
        .catch(async () => {
          return (await caches.match('/')) ?? Response.error();
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then((response) => {
        _saveResponse(event.request, response, event);
        return response;
      });
    })
  );
});

function _saveResponse(request, response, event) {
  if (!response.ok) return;

  const responseCopy = response.clone();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.put(request, responseCopy);
    })
  );
}