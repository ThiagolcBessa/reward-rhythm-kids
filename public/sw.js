// Simple service worker for offline support
const CACHE_NAME = 'reward-rhythm-v1';
const urlsToCache = [
  '/',
  '/auth',
  '/parent',
  '/manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // Fallback for offline pages
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
      })
  );
});