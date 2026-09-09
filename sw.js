// Service Worker for PWA installability
var CACHE_NAME = 'workbench-v3';
var CACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './favicon.ico',
  './icon-96.png',
  './icon-128.png',
  './icon-144.png',
  './icon-152.png',
  './icon-192.png',
  './icon-256.png',
  './icon-384.png',
  './icon-512.png',
  './icon-1024.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(CACHE_URLS).catch(function() {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(n) { return n !== CACHE_NAME; })
             .map(function(n) { return caches.delete(n); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  // 网络优先：每次优先请求最新内容，成功后更新缓存；离线时才回退缓存
  e.respondWith(
    fetch(e.request).then(function(resp) {
      if(e.request.method==='GET' && resp && resp.ok && new URL(e.request.url).origin===location.origin){
        var copy=resp.clone();
        caches.open(CACHE_NAME).then(function(cache){cache.put(e.request,copy);}).catch(function(){});
      }
      return resp;
    }).catch(function() {
      return caches.match(e.request).then(function(cached){return cached||Response.error();});
    })
  );
});
