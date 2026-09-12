// Service Worker for HGN Skills Overview Page
const CACHE_NAME = 'hgn-skills-cache-v1';

globalThis.addEventListener('install', () => {
  globalThis.skipWaiting();
});

globalThis.addEventListener('activate', event => {
  event.waitUntil(globalThis.clients.claim());
});

globalThis.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request));
});
