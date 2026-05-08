
// BioMedLink Core - Basic Service Worker for PWA Installability
const CACHE_NAME = 'biomedlink-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass-through fetch for the prototype
  event.respondWith(fetch(event.request));
});
