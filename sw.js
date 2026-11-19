/* SIMONLATION Stackup Studio 0.4.3. Scoped PWA shell, no CDN or analytics. */
const CACHE='simonlation-stackup-v0.4.3';
const FILES=['./','./index.html','./app.js','./impedance-engine.js','./impedance-ui.js','./via-fence-engine.js','./styles.css','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install', event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 for(const name of await caches.keys())if(name.startsWith('simonlation-stackup-')&&name!==CACHE)await caches.delete(name);
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url);
 if(req.method!=='GET'||url.origin!==self.location.origin||!url.pathname.startsWith(new URL(self.registration.scope).pathname))return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  const shell=url.pathname.endsWith('/')||url.pathname.endsWith('/index.html');
  if(!shell){const hit=await cache.match(req,{ignoreSearch:true});if(hit)return hit;}
  try{const fresh=await fetch(req);if(fresh.ok)cache.put(req,fresh.clone()).catch(()=>{});return fresh;}
  catch{
   const hit=await cache.match(req,{ignoreSearch:true});if(hit)return hit;
   if(shell){const fallback=await cache.match('./index.html');if(fallback)return fallback;}
   return new Response('Offline: resource not cached',{status:503,headers:{'Content-Type':'text/plain'}});
  }
 })());
});
