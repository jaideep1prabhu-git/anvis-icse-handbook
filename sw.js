const CACHE='anvi-handbook-v1';
const CORE=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET')return;
  const url=new URL(req.url);
  const isPage=req.mode==='navigate';
  if(isPage){
    // network first so updates arrive, fall back to cache when offline
    e.respondWith(fetch(req).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put('index.html',cp));return r;}).catch(()=>caches.match('index.html')));
    return;
  }
  // everything else (icons, Google Fonts): cache first, then network and store
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{
    if(r&&(r.status===200||r.type==='opaque')){const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp));}
    return r;}).catch(()=>hit)));
});
