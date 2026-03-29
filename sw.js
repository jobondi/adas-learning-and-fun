// Service Worker — network-first for HTML/JS, cache-first for fonts/images
var CACHE_NAME = 'ada-fun-v6';
var ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/game-x2-engine.js',
  '/js/game-x2.js',
  '/js/game-blink-engine.js',
  '/js/game-blink.js',
  '/js/app.js',
  '/manifest.json',
];

self.addEventListener('install', function (event) {
  // Activate immediately without waiting for existing clients to close
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', function (event) {
  // Clear old caches when a new service worker activates
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (key) { return key !== CACHE_NAME; })
          .map(function (key) { return caches.delete(key); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (event) {
  var url = new URL(event.request.url);

  // Network-first for same-origin app files (HTML, CSS, JS)
  // This ensures updates are picked up immediately
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(event.request).then(function (response) {
        // Update cache with fresh response
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(event.request, clone);
        });
        return response;
      }).catch(function () {
        // Offline fallback: serve from cache
        return caches.match(event.request);
      })
    );
    return;
  }

  // Cache-first for external resources (Google Fonts, etc.)
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      return cached || fetch(event.request).then(function (response) {
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(event.request, clone);
        });
        return response;
      });
    })
  );
});
