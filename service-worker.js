var cacheName = 'tiempo-v0.0.091';

var filesToCache = [
  './',
  './index.html',
  './js/main.js',
  './img/icon.png',
  './img/icon-128x128.png',
  './img/icon-144x144.png',
  './img/icon-192x192.png',
  './img/icon-48x48.png',
  './img/icon-512x512.png',
  './img/icon-96x96.png',
  './img/weather/11_g.png',
  './img/weather/11n_g.png',
  './img/weather/12_g.png',
  './img/weather/12n_g.png',
  './img/weather/13_g.png',
  './img/weather/13n_g.png',
  './img/weather/14_g.png',
  './img/weather/14n_g.png',
  './img/weather/15_g.png',
  './img/weather/15n_g.png',
  './img/weather/16_g.png',
  './img/weather/16n_g.png',
  './img/weather/17_g.png',
  './img/weather/17n_g.png',
  './img/weather/23_g.png',
  './img/weather/23n_g.png',
  './img/weather/24_g.png',
  './img/weather/24n_g.png',
  './img/weather/25_g.png',
  './img/weather/25n_g.png',
  './img/weather/26_g.png',
  './img/weather/26n_g.png',
  './img/weather/33_g.png',
  './img/weather/33n_g.png',
  './img/weather/34_g.png',
  './img/weather/34n_g.png',
  './img/weather/35_g.png',
  './img/weather/35n_g.png',
  './img/weather/36_g.png',
  './img/weather/36n_g.png',
  './img/weather/43_g.png',
  './img/weather/43n_g.png',
  './img/weather/44_g.png',
  './img/weather/44n_g.png',
  './img/weather/45_g.png',
  './img/weather/45n_g.png',
  './img/weather/46_g.png',
  './img/weather/46n_g.png',
  './img/weather/51_g.png',
  './img/weather/51n_g.png',
  './img/weather/52_g.png',
  './img/weather/52n_g.png',
  './img/weather/53_g.png',
  './img/weather/53n_g.png',
  './img/weather/54_g.png',
  './img/weather/54n_g.png',
  './img/weather/61_g.png',
  './img/weather/61n_g.png',
  './img/weather/62_g.png',
  './img/weather/62n_g.png',
  './img/weather/63_g.png',
  './img/weather/63n_g.png',
  './img/weather/64_g.png',
  './img/weather/64n_g.png',
  './img/weather/71_g.png',
  './img/weather/71n_g.png',
  './img/weather/72_g.png',
  './img/weather/72n_g.png',
  './img/weather/73_g.png',
  './img/weather/73n_g.png',
  './img/weather/74_g.png',
  './img/weather/74n_g.png',
  './img/weather/82n_g.png',
  './img/weather/82_g.png',
  './img/weather/82.png'
];

self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install_');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activate_');
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key.startsWith('tiempo-')){
          if (key !== cacheName) {
            console.log('[ServiceWorker] Removing old cache', key);
            return caches.delete(key);
          }
        }
      }));
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});
