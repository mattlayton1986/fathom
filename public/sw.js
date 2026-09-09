const CACHE_NAME = 'fathom-static-v1';

const BASE_PATH = new URL(self.registration.scope)
  .pathname
  .replace(/\/$/, '');

const APP_SHELL_PATH = `${BASE_PATH}/`;

const STATIC_ASSETS = [
  APP_SHELL_PATH,
  `${BASE_PATH}/manifest.webmanifest`,
  `${BASE_PATH}/favicon.ico`,
  `${BASE_PATH}/icons/fathom-192.png`,
  `${BASE_PATH}/icons/fathom-512.png`,
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
    event.request.mode === 'navigate' && url.pathname === APP_SHELL_PATH;

  const isStaticAssetRequest = url.pathname.startsWith(`${BASE_PATH}/_next/static`);

  if (!isAppShellRequest && !isStaticAssetRequest) return;

  if (isAppShellRequest) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          _saveResponse(APP_SHELL_PATH, response, event);
          return response;
        })
        .catch(async () => {
          return (await caches.match(APP_SHELL_PATH)) ?? Response.error();
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