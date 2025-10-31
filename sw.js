const CACHE = 'travel-bialka-2025-v2';
const CORE = [
  './',
  './index.html','./login.html','./itinerary.html','./map.html','./checklists.html',
  './bookings.html','./gallery.html','./log.html','./weather.html','./transport.html','./qr.html',
  './style.css','./app.js','./auth.js','./manifest.webmanifest',
  './assets/icons/icon-192.png','./assets/icons/icon-512.png'
];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)));
  self.skipWaiting();
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e=>{
  const url = new URL(e.request.url);
  if (url.origin === location.origin) {
    e.respondWith(caches.match(e.request).then(r=> r || fetch(e.request)));
  } else {
    // network-first for external services (e.g. weather API or QR image)
    e.respondWith(fetch(e.request).then(resp=>{
      const copy = resp.clone();
      caches.open(CACHE).then(c=>c.put(e.request, copy));
      return resp;
    }).catch(()=>caches.match(e.request)));
  }
});