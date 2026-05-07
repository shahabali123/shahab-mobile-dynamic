const CACHE_NAME = 'shahab-mobile-cache-v2'; // Cache version ko update karein
const urlsToCache = [
    '/',
    '/index.html',
    '/offers.html',
    '/installments.html',
    '/manifest.json', // manifest.json ko cache mein shamil karein
    '/app.js',
    '/products.js',
    '/hero.js',
    '/images/tecno-spark-go-3.webp', 
    // Add other critical assets here (e.g., main CSS, common images)
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => response || fetch(event.request))
    );
});