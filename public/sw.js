
const CACHE_NAME = 'physicslab-v1';
const urlsToCache = [
  '/',
  // Add other critical paths/assets you want to pre-cache
  // For example:
  // '/offline.html', // A custom offline fallback page
  // '/styles/globals.css', // if you had specific critical CSS not inlined
  // '/img/logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // Pre-cache essential assets. Be mindful of what you add here.
        // For a Next.js app, a lot of assets are dynamically named.
        // A more sophisticated approach would use a build tool (like next-pwa)
        // to generate this list. For now, we'll keep it minimal.
        return cache.addAll(urlsToCache.filter(url => !url.startsWith('/_next/static/'))); // Avoid caching dev chunks
      })
      .catch(err => {
        console.error('Failed to open cache: ', err);
      })
  );
});

self.addEventListener('fetch', (event) => {
  // We only want to cache GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  // For navigation requests, try network first, then cache, then fallback.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // If we get a valid response, cache it and return it.
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
          }
          return response;
        })
        .catch(() => {
          // If network fails, try to get from cache.
          return caches.match(event.request)
            .then(response => {
              return response || caches.match('/'); // Fallback to homepage or an offline.html
            });
        })
    );
    return;
  }

  // For other requests (assets like CSS, JS, images), use cache-first strategy.
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Not in cache - fetch from network, cache, and return
        return fetch(event.request).then(
          (networkResponse) => {
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              // Don't cache opaque responses or errors
              return networkResponse;
            }

            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            return networkResponse;
          }
        ).catch(() => {
          // If fetch fails (e.g., offline, and not in cache)
          // You might want to return a placeholder for images, etc.
          // For now, it will just fail.
        });
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
