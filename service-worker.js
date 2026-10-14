const CACHE_NAME='viper-pwa-v7';
const APP_SHELL=['./','./index.html','./spectator.html','./captain.html','./offline-race.html','./offline-race.js?v=3','./viper-navigation.js?v=19','./viper-navigation.css?v=14','./viper-redesign.css?v=4','./viper-polish.css?v=1','./manifest.json','./viper-app-icon.svg'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('viper-pwa-')&&key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET')return;
 const url=new URL(req.url);
 if(url.origin!==self.location.origin)return;
 // Always try the network first for page navigations so login and routing fixes
 // are not hidden behind a stale cached index.html. Keep a cached fallback offline.
 if(req.mode==='navigate'){
  event.respondWith(fetch(req).then(response=>{
   if(response.ok){const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(req,copy));}
   return response;
  }).catch(()=>caches.match(req).then(cached=>cached||caches.match('./offline-race.html'))));
  return;
 }
 event.respondWith(caches.match(req).then(cached=>{
  if(cached)return cached;
  return fetch(req).then(response=>{
   if(response.ok){const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(req,copy));}
   return response;
  }).catch(()=>new Response('',{status:503,statusText:'Offline'}));
 }));
});
