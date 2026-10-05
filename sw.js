// food.brb service worker. Cache cleanup never touches localStorage.
const CACHE='food-brb-live-64';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon.svg','./fonts.css','./sg.css','./data.js'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  if(url.origin!==location.origin)return;
  const nav=e.request.mode==='navigate';
  const req=nav?new Request(e.request,{cache:'no-cache'}):e.request;
  const net=()=>fetch(req).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r;});
  const cached=()=>caches.match(e.request).then(r=>r||caches.match('./index.html'));
  if(nav){
    // Slow or hung network: open from cache after 0.8s; the network copy still refreshes the cache for next launch.
    const n=net();
    const slow=new Promise(res=>setTimeout(()=>cached().then(r=>res(r||n)),800));
    e.respondWith(Promise.race([n.catch(()=>cached()),slow]));
    e.waitUntil(n.catch(()=>{}));
  }else{
    // Static assets: serve the saved copy instantly, refresh in the background.
    e.respondWith(caches.match(e.request).then(r=>{const n=net().catch(()=>r);e.waitUntil(n.then(()=>{}));return r||n;}));
  }
});
