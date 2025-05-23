
// public/sw.js

const CACHE_NAME = 'physicslab-v1.3-cache'; // Increment version to force update
const urlsToCache = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  // Add other critical static assets here, e.g., logo, global CSS if not inlined
  // Be careful with caching too many dynamic routes initially,
  // as they might serve stale data if not handled with a network-first strategy.
  '/api/study-materials' // Cache the API response for study materials structure
];

// Install service worker and cache static assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Install event');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Opened cache:', CACHE_NAME);
        // Add core assets that make up the app shell
        // For Next.js, these are often hashed, so dynamic caching during runtime is more effective
        // This initial list is for very basic app shell components
        return cache.addAll(urlsToCache)
          .then(() => console.log('[Service Worker] Core assets cached.'))
          .catch(error => console.error('[Service Worker] Failed to cache core assets:', error));
      })
      .then(() => self.skipWaiting()) // Activate new service worker immediately
  );
});

// Activate service worker and clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activate event');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of all open clients
  );
});

// Fetch event: Serve cached content when offline, or fetch from network
self.addEventListener('fetch', event => {
  // We only want to cache GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // For API calls (like /api/study-materials), try network first, then cache.
  // For other assets, try cache first, then network.
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // If the response is valid, clone it and store it in the cache.
          if (response && response.status === 200 && response.type === 'basic') {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
          }
          return response;
        })
        .catch(() => {
          // If network request fails, try to serve from cache.
          return caches.match(event.request)
            .then(cachedResponse => {
              return cachedResponse || new Response(JSON.stringify({ error: "Offline and data not cached" }), {
                status: 503, // Service Unavailable
                headers: { 'Content-Type': 'application/json' }
              });
            });
        })
    );
  } else {
    // Cache-first strategy for static assets
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          // Cache hit - return response
          if (cachedResponse) {
            return cachedResponse;
          }

          // Not in cache - fetch from network, then cache it
          return fetch(event.request).then(
            response => {
              // Check if we received a valid response
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }

              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
              return response;
            }
          );
        })
    );
  }
});

// Basic message listener (can be expanded for PWA update notifications, etc.)
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
