const CACHE_NAME = 'securechat-cache-v2';
const urlsToCache = [
  './',
  './index.html',
  './script.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Navigation requests (i.e., user opens the app / reloads)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // optionally update cache with fresh index.html
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put('./index.html', responseClone));
          return response;
        })
        .catch(() => {
          // network failed — fallback to cache
          return caches.match('./index.html');
        })
    );
    return;
  }

  // Other requests: JS, CSS, images, etc. (cache‐first)
  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request))
  );
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: "window" }).then(clientList => {
      for (let client of clientList) {
        if (client.url.includes("/") && "focus" in client) {
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow("/");
      }
    })
  );
});
