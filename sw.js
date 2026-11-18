const CACHE = 'simonlation-stackup-standalone-v0.3.0';
const FILES = ['./','./index.html','./app.js','./impedance-engine.js','./impedance-ui.js','./styles.css','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install', event => {event.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{for(const k of await caches.keys())if(k.startsWith('simonlation-stackup-standalone-')&&k!==CACHE)await caches.delete(k);await self.clients.claim();})());});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
  event.respondWith((async()=>{try{const response=await fetch(event.request);if(response.ok){const cache=await caches.open(CACHE);cache.put(event.request,response.clone());}return response;}catch{const match=await caches.match(event.request,{ignoreSearch:true});return match||new Response('Offline. File not cached.',{status:503,headers:{'Content-Type':'text/plain'}});}})());
});
