// Service worker : garde les écrans et bibliothèques en cache pour le travail sans réseau.
// Les données (Supabase) ne passent jamais par ce cache.
const CACHE='portail-eau-v3';
const FILES=['./','./index.html','./saisie-jaugeages.html','./jaugeages.html','./saisie-piezos.html','./piezos.html','./saisie-traitement.html',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.allSettled(FILES.map(f=>c.add(f)))));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))));self.clients.claim();});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.hostname.endsWith('supabase.co'))return;      // données : toujours le réseau
  // réseau d'abord (pour recevoir les mises à jour), cache si pas de réseau
  e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c));return r;})
    .catch(()=>caches.match(e.request,{ignoreSearch:true})));
});
