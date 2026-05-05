const CACHE_NAME = 'shahab-mobile-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/offers.html',
    '/installments.html',
    '/app.js',
    '/products.js',
    '/hero.js',
    '/favicon.jpg', // Assuming favicon.jpg is in the root
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