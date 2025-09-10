// Service worker for offline support and PWA functionality
const CACHE_NAME = 'daily-task-kids-v1';
const urlsToCache = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/parent',
  '/parent/redemptions',
  '/kid',
  '/login'
];

// Patterns for dynamic routes
const DYNAMIC_ROUTES = [
  /^\/kid\/[^/]+$/,           // /kid/:kidId
  /^\/kid\/[^/]+\/rewards$/,  // /kid/:kidId/rewards
  /^\/kid\/[^/]+\/history$/   // /kid/:kidId/history
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Helper function to check if URL matches dynamic routes
const matchesDynamicRoute = (url) => {
  const pathname = new URL(url).pathname;
  return DYNAMIC_ROUTES.some(pattern => pattern.test(pathname));
};

// Fetch event
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          return response;
        }

        // Try to fetch from network
        return fetch(event.request)
          .then((response) => {
            // Cache successful responses for static assets
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseClone);
              });
            }
            return response;
          })
          .catch(() => {
            // Network failed - handle navigation requests
            if (event.request.destination === 'document') {
              // Check if it's a known route or dynamic route pattern
              const url = event.request.url;
              const pathname = new URL(url).pathname;
              
              if (urlsToCache.includes(pathname) || matchesDynamicRoute(url)) {
                // Serve offline page for app routes
                return caches.match('/offline.html');
              }
            }
            
            // For other requests, throw to let browser handle
            throw new Error('Network request failed and no cache available');
          });
      })
  );
});