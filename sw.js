const CACHE='travel-v1';
const CORE=[
  './','./index.html','./login.html','./itinerary.html','./map.html',
  './checklists.html','./bookings.html','./gallery.html','./log.html','./weather.html',
  './style.css','./app.js','./auth.js','./manifest.webmanifest'
];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)));
  self.skipWaiting();
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch',e=>{
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});