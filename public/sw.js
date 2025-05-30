// public/sw.js

const CACHE_NAME = 'physicslab-v1.5-cache'; // Increment version to force update after changes
const PDF_CACHE_NAME = 'pdf-cache-v1'; // Dedicated cache for PDF files

const urlsToCache = [ // List of core assets to cache on install
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
      .then(async cache => {
        console.log('[Service Worker] Caching app shell');
        // Use cache.add() for each URL to handle potential individual fetch failures
        await Promise.all(urlsToCache.map(url => cache.add(url).catch(e => console.warn(`[Service Worker] Failed to cache ${url}:`, e))));
        console.log('[Service Worker] Core assets cache attempt finished.');
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
          // Delete old caches, excluding the current main cache and PDF cache
          if (cache !== CACHE_NAME && cache !== PDF_CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of all open clients
  );
});

// Fetch event: Serve cached content when offline, or fetch from network
self.addEventListener('fetch', async event => {
  // We only want to cache GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Prevent caching for chrome-extension:// or other non-http/s requests
  if (!event.request.url.startsWith('http')) {
      console.log(`[Service Worker] Skipping fetch for non-http/s request: ${event.request.url}`);
      // Allow the browser to handle these requests normally
      return; 
  }

  // Strategy: Cache-then-Network for Chapter Detail API calls
  // Strategy: Network-first for other API calls, with cache fallback.
  // Strategy: Cache-first for other assets (like static files, pages), with network fallback and caching of new assets.

  // Handle API requests
  if (event.request.url.includes('/api/')) {
      // Use a more specific check for chapter detail URLs pattern: /api/study-materials/{gradeId}/{chapterId}
      const chapterDetailUrlMatch = event.request.url.match(/\/api\/study-materials\/[^/]+\/[^/]+$/);
      const cache = await caches.open(CACHE_NAME);

      if (chapterDetailUrlMatch) {
          // Strategy: Cache-then-Network for chapter details
          console.log(`[Service Worker] Fetching Chapter API (Cache then Network): ${event.request.url}`);
          event.respondWith(
              cache.match(event.request).then(cachedResponse => {
                  const networkFetch = fetch(event.request).then(response => {
                      // If the response is valid, clone it and store it in the cache.
                      if (response && response.status === 200 && response.type === 'basic') {
                          const responseToCache = response.clone();
                          cache.put(event.request, responseToCache);
                      }
                      return response;
                  }).catch(() => {
                      console.log(`[Service Worker] Network failed for ${event.request.url}.`);
                       // Network failed. If no cached response, return a fallback.
                       if (!cachedResponse) {
                            return new Response(JSON.stringify({ error: "Offline and data not cached" }), {
                               status: 503, // Service Unavailable
                               headers: { 'Content-Type': 'application/json' }
                           });
                       }
                       // If network fails but we have a cached response, the cached response is returned below.
                  });

                  // Return cached response immediately if available, otherwise wait for network.
                  return cachedResponse || networkFetch;
              })
          );
      } else {
          // Strategy: Network-first for other /api/ calls (like /api/study-materials list)
          console.log(`[Service Worker] Fetching Other API (Network First): ${event.request.url}`);
          event.respondWith(
              fetch(event.request)
              .then(response => {
                  if (response && response.status === 200 && response.type === 'basic') {
                      const responseToCache = response.clone();
                      cache.put(event.request, responseToCache);
                  }
                  return response;
              })
              .catch(async () => {
                  console.log(`[Service Worker] Network failed for ${event.request.url}. Trying cache...`);
                  const cachedResponse = await cache.match(event.request);
                  if (cachedResponse) {
                      console.log(`[Service Worker] Found in cache fallback: ${event.request.url}`);
                      return cachedResponse;
                  } else {
                      return new Response(JSON.stringify({ error: "Offline and data not cached" }), {
                          status: 503,
                          headers: { 'Content-Type': 'application/json' }
                      });
                  }
              })
          );
      }
      return; // Stop further processing in the fetch event for this matched URL pattern
  }

    // Strategy: Cache-first for other requests (static assets, pages, etc.)
    console.log(`[Service Worker] Fetching asset (Cache First): ${event.request.url}`);
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                // Cache hit - return response
                if (cachedResponse) {
                    console.log(`[Service Worker] Found in cache: ${event.request.url}`);
                    return cachedResponse;
                }

                // Not in cache - fetch from network, then cache it
                return fetch(event.request).then(
                    response => {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, response.clone()); // Cache the network response
                            });
                        return response;
                    }
                ).catch(error => {
                    console.error(`[Service Worker] Network failed for asset ${event.request.url}:`, error);
                     // If network fails and it wasn't in cache, return a fallback (e.g., an offline page)
                     // For simplicity, we'll just re-throw or return an empty response here.
                     // A more robust implementation might return a custom offline page.
                     return new Response("Offline - Asset not cached", { status: 503 });
                });
            })
        );
});


// Basic message listener (can be expanded for PWA update notifications, etc.)
self.addEventListener('message', event => {
  // Message to skip waiting and activate the new service worker immediately
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // Message listener for caching multiple PDFs
  if (event.data && event.data.type === 'CACHE_PDFS' && Array.isArray(event.data.payload?.urls)) {
      const pdfUrlsToCache = event.data.payload.urls;
      console.log(`[Service Worker] Received message to cache ${pdfUrlsToCache.length} PDFs.`);

      // Optional: Reply to the client immediately that we're starting
      if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({ type: 'PDF_CACHE_START', total: pdfUrlsToCache.length });
      }

      event.waitUntil(
          caches.open(PDF_CACHE_NAME).then(cache => {
              const cachingPromises = pdfUrlsToCache.map(async ({ url, fileName }, index) => {
                  if (!url || !url.startsWith('http')) {
                      console.warn(`[Service Worker] Skipping invalid PDF URL: ${url}`);
                      return; // Skip invalid URLs
                  }
                  try {
                      console.log(`[Service Worker] Attempting to cache PDF ${index + 1}/${pdfUrlsToCache.length}: ${fileName || url}`);
                      const response = await fetch(url, { mode: 'cors' }); // Use cors mode for external links
                      if (!response.ok) {
                           // Consider if this is a fatal error or just skipping one file
                          console.warn(`[Service Worker] Failed to fetch PDF ${fileName || url} (Status: ${response.status}).`);
                          // Optionally send a message back about this specific failure
                          return;
                      }
                       // Optional: Check content type if needed
                      await cache.put(url, response); // Cache the response
                      console.log(`[Service Worker] Successfully cached PDF: ${fileName || url}`);
                       // Optionally send a message back about this specific success
                  } catch (error) {
                      console.error(`[Service Worker] Error caching PDF ${fileName || url}:`, error);
                       // Optionally send a message back about this specific error
                  }
              });
              return Promise.all(cachingPromises);
          })
          .then(() => console.log('[Service Worker] All PDF caching requests processed.'))
          .catch(error => console.error('[Service Worker] Error during PDF caching batch:', error));
      );
  }
});
