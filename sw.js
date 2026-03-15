// Service Worker — basic shell caching (v1 stub)
var CACHE_NAME = 'ada-fun-v2';
var ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/game-x2-engine.js',
  '/js/game-x2.js',
  '/js/app.js',
  '/manifest.json',
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request);
    })
  );
});
