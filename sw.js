/* SIMONLATION Stackup Studio 0.4.3. Scoped PWA shell, no CDN or analytics. */
const CACHE='simonlation-stackup-v0.4.3-workbench-v3';
const FILES=[
  './assets/sl/fonts.css?v=sl3',
  './assets/sl/tokens.css?v=sl3',
  './assets/sl/app.css?v=sl3',
  './assets/sl/workbench.css?v=sl3',
  './workbench.css?v=sl3',
  './icons/icon.svg',
  './assets/sl/brand/logo-dark.svg',
  './assets/sl/brand/logo-light.svg',
  './assets/sl/fonts/ibm-plex-mono-latin-400-normal.woff2',
  './assets/sl/fonts/ibm-plex-mono-latin-500-normal.woff2',
  './assets/sl/fonts/ibm-plex-mono-latin-ext-400-normal.woff2',
  './assets/sl/fonts/ibm-plex-mono-latin-ext-500-normal.woff2',
  './assets/sl/fonts/ibm-plex-sans-greek-400-normal.woff2',
  './assets/sl/fonts/ibm-plex-sans-greek-500-normal.woff2',
  './assets/sl/fonts/ibm-plex-sans-greek-600-normal.woff2',
  './assets/sl/fonts/ibm-plex-sans-latin-400-italic.woff2',
  './assets/sl/fonts/ibm-plex-sans-latin-400-normal.woff2',
  './assets/sl/fonts/ibm-plex-sans-latin-500-normal.woff2',
  './assets/sl/fonts/ibm-plex-sans-latin-600-normal.woff2',
  './assets/sl/fonts/ibm-plex-sans-latin-ext-400-normal.woff2',
  './assets/sl/fonts/ibm-plex-sans-latin-ext-500-normal.woff2',
  './assets/sl/fonts/ibm-plex-sans-latin-ext-600-normal.woff2',
  './assets/sl/fonts/source-serif-4-latin-ext-wght-italic.woff2',
  './assets/sl/fonts/source-serif-4-latin-ext-wght-normal.woff2',
  './assets/sl/fonts/source-serif-4-latin-wght-italic.woff2',
  './assets/sl/fonts/source-serif-4-latin-wght-normal.woff2',
  './','./index.html','./app.js','./impedance-engine.js','./impedance-ui.js','./via-fence-engine.js','./styles.css','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
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
