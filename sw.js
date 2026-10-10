// يعمل مع الإنترنت القوي والضعيف: الملفات الثابتة من الذاكرة المؤقتة، وصفحات المتجر تتطلب اتصالاً بالشبكة.
const CACHE = 'rashfa-store-v19';
const CORE = ['./', './index.html', './admin.html', './manifest.json', './brand-logo.jpg', './icon-192.png', './icon-512.png', './coffee-ad-banner.jpg', './coffee-pattern.jpg'];
self.addEventListener('install', event => { event.waitUntil((async () => { const cache = await caches.open(CACHE); await Promise.all(CORE.map(async url => { try { const r = await fetch(url, {cache:'reload'}); if (r.ok) await cache.put(url, r); } catch (_) {} })); await self.skipWaiting(); })()); });
self.addEventListener('activate', event => { event.waitUntil((async () => { for (const key of await caches.keys()) if (key.startsWith('rashfa-store-') && key !== CACHE) await caches.delete(key); await self.clients.claim(); })()); });
self.addEventListener('fetch', event => {
 const req=event.request, url=new URL(req.url); if(req.method!=='GET'||url.origin!==self.location.origin)return;
 event.respondWith((async()=>{ const cache=await caches.open(CACHE), cached=await cache.match(req,{ignoreSearch:true});
  if(req.mode==='navigate'||req.destination==='document'){
   try { const network=await fetch(req,{cache:'no-cache'}); if(network&&network.ok)cache.put(req,network.clone()).catch(()=>{}); return network; }
   catch(_){ return new Response(`<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>الاتصال بالإنترنت مطلوب</title><body style="font-family:Arial,sans-serif;text-align:center;padding:12vh 8%;background:#fff8ee;color:#493426"><h2>الاتصال بالإنترنت مطلوب</h2><p>متجر د. رشفه ملكيه يحتاج إلى الإنترنت ليعمل ويعرض البيانات الحديثة.</p><p>تحقق من اتصالك ثم أعد المحاولة.</p><button onclick="location.reload()" style="padding:12px 24px;border:0;border-radius:10px;background:#6d4933;color:white;font-size:16px">إعادة المحاولة</button></body></html>`,{status:200,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}}); }
  }
  if(cached){event.waitUntil(fetch(req).then(r=>{if(r.ok)return cache.put(req,r.clone())}).catch(()=>{}));return cached;}
  try{const r=await fetch(req);if(r.ok)cache.put(req,r.clone()).catch(()=>{});return r}catch(_){return Response.error()}
 })());
});
