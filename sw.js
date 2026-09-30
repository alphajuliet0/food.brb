// food.brb service worker. Cache cleanup never touches localStorage.
const CACHE='food-brb-live-48';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon.svg','./fonts.css','./data.js'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  if(url.origin!==location.origin)return;
  const nav=e.request.mode==='navigate';
  const req=nav?new Request(e.request,{cache:'no-cache'}):e.request;
  const net=fetch(req).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r;});
  const cached=()=>caches.match(e.request).then(r=>r||caches.match('./index.html'));
  if(nav){
    // Slow or hung network: open from cache after 2.5s; the network copy still refreshes the cache for next launch.
    const slow=new Promise(res=>setTimeout(()=>cached().then(r=>res(r||net)),2500));
    e.respondWith(Promise.race([net.catch(()=>cached()),slow]));
    e.waitUntil(net.catch(()=>{}));
  }else{
    e.respondWith(net.catch(cached));
  }
});
