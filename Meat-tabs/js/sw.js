const cacheName = 'meat-codes-v1';
const filesToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/csv-loader.js',
  '/manifest.json',
  // CSV files
  '/data/Cuts.csv',
  '/data/Grinds.csv',
  '/data/Veal.csv',
  '/data/beef.csv',
  '/data/npchick.csv',
  '/data/nppork.csv',
  '/data/pork.csv',
  '/data/poultry.csv',
  '/data/smoked.csv'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => cache.addAll(filesToCache))
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => k !== cacheName && caches.delete(k)))
    )
  );
});