const CACHE_PREFIX = "ygame-pwa";
const CACHE_NAME = `${CACHE_PREFIX}-v2`;
const scopeUrl = new URL(self.registration.scope);
const basePath = scopeUrl.pathname.endsWith("/") ? scopeUrl.pathname : `${scopeUrl.pathname}/`;
const appShellUrl = new URL(basePath, self.location.origin).href;
let dynamicManifest = null;
const appShell = [
  appShellUrl,
  new URL(`${basePath}manifest.webmanifest`, self.location.origin).href,
  new URL(`${basePath}favicon.ico`, self.location.origin).href,
  new URL(`${basePath}pwa/icon-192.png`, self.location.origin).href,
  new URL(`${basePath}pwa/icon-512.png`, self.location.origin).href
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => Promise.allSettled(appShell.map((url) => cache.add(url))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type !== "update-pwa-manifest" || !event.data.manifest) return;

  dynamicManifest = event.data.manifest;
  event.ports[0]?.postMessage({ updated: true });
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const requestUrl = new URL(request.url);
  if (requestUrl.origin !== self.location.origin) return;

  if (requestUrl.pathname === `${basePath}manifest.webmanifest` && dynamicManifest) {
    event.respondWith(new Response(JSON.stringify(dynamicManifest), {
      headers: {
        "Content-Type": "application/manifest+json",
        "Cache-Control": "no-store"
      }
    }));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (!response.ok) return response;

          const responseForCache = response.clone();
          return caches.open(CACHE_NAME)
            .then((cache) => cache.put(appShellUrl, responseForCache))
            .then(() => response);
        })
        .catch(() => caches.match(appShellUrl))
    );
    return;
  }

  const isStaticAsset = requestUrl.pathname.startsWith(`${basePath}static/`)
    || requestUrl.pathname.startsWith(`${basePath}pwa/`)
    || requestUrl.pathname === `${basePath}favicon.ico`
    || requestUrl.pathname === `${basePath}manifest.webmanifest`;

  if (!isStaticAsset) return;

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(request).then((response) => {
        if (!response.ok) return response;

        const responseForCache = response.clone();
        return caches.open(CACHE_NAME)
          .then((cache) => cache.put(request, responseForCache))
          .then(() => response);
      });
    })
  );
});
