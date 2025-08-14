const CACHE_NAME = 'portal-share-brasil-v4';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  // Use a network-first strategy for navigation requests (e.g., loading the app).
  // This ensures users get the latest version of the app shell.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        // If the network fails, fall back to the cached root page.
        return caches.match('/');
      })
    );
    return;
  }

  // Use a cache-first strategy for all other requests (JS, CSS, images, etc.).
  // These assets have unique names (hashes), so we can rely on the cache.
  event.respondWith(
    caches.match(event.request).then((response) => {
      // If we have a response in the cache, return it.
      if (response) {
        return response;
      }

      // Otherwise, fetch from the network, cache it, and then return it.
      return fetch(event.request).then((networkResponse) => {
        // Don't cache opaque or error responses to avoid issues.
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        // Clone the response because it's a stream and can only be consumed once.
        const responseToCache = networkResponse.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
