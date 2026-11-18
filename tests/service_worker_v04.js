// Deterministic service-worker shell/offline unit test. This is not an end-to-end OS PWA installation test.
const assert=require('node:assert/strict'),fs=require('fs'),vm=require('node:vm');
const sw=fs.readFileSync(require('node:path').join(__dirname,'../sw.js'),'utf8');
const events={};let online=true;const network=new Map();
const scope='https://simmark.github.io/stackup-studio/';
const resolve=u=>new URL(u,scope).href;
const cacheData=new Map();
const caches={
 open:async name=>{
  if(!cacheData.has(name))cacheData.set(name,new Map());
  const c=cacheData.get(name);
  return {
   addAll:async entries=>{for(const entry of entries){const k=resolve(entry);c.set(k,{ok:true,body:'cached '+entry,url:k,clone(){return {...this}}})}},
   match:async (req)=>c.get(resolve(typeof req==='string'?req:req.url)),
   put:async(req,response)=>{c.set(resolve(typeof req==='string'?req:req.url),response)},
  };
 },
 keys:async()=>[...cacheData.keys()],delete:async name=>cacheData.delete(name)
};
const ctx={caches,URL,Response,console,self:{location:{origin:'https://simmark.github.io'},registration:{scope},clients:{claim:async()=>{}},skipWaiting:async()=>{},addEventListener:(n,cb)=>events[n]=cb},fetch:async req=>{
 if(!online)throw Error('network off');return {ok:true,body:'online',clone(){return {...this}}};
}};
vm.runInNewContext(sw,ctx);
async function run(){let promise=null;events.install({waitUntil:p=>promise=p});await promise;
 assert.equal(cacheData.size,1);
 let active=null;events.activate({waitUntil:p=>active=p});await active;
 online=false;
 const go=async path=>{let reply;events.fetch({request:{method:'GET',url:resolve(path),mode:'navigate'},respondWith:p=>reply=p});return await reply};
 const doc=await go('./index.html'),dep=await go('./via-fence-engine.js'),home=await go('./');
 assert.equal(doc.ok,true);assert.equal(dep.ok,true);assert.equal(home.ok,true);
 const cache=[...cacheData.values()][0];assert.ok(cache.has(resolve('./via-fence-engine.js')));
 console.log('PASS service worker logic: precache, offline navigation, cached engine, same-app cache key');
}
run().catch(e=>{console.error(e);process.exit(1)});
