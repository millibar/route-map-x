const cacheName = 'v202401041630';

const precacheResources = [
     './',
     './css/adhoc.css',
     './css/style.css',
     './data/holiday.json',
     './data/stations.json',
     './data/timetable.json',
     './src/day.js',
     './src/dijkstra.js',
     './src/html-map.js',
     './src/html-train.js',
     './src/html-util.js',
     './src/index.js',
     './src/map.js',
     './src/state.js',
     './src/timetable.js',
     './src/UI.js'
];


self.addEventListener('install', (event) => {
     console.log('[Service Worker] install event!');
     event.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(precacheResources)));
});

self.addEventListener('activate', (event) => {
     console.log('[Service Worker] activate event!');
});

// When there's an incoming fetch request, try and respond with a precached resource, otherwise fall back to the network
self.addEventListener('fetch', (event) => {
     console.log('[Service Worker] Fetch intercepted for:', event.request.url);
     event.respondWith(
       caches.match(event.request).then((cachedResponse) => {
         if (cachedResponse) {
           return cachedResponse;
         }
         return fetch(event.request);
       }),
     );
});


//メッセージ受信時の処理
self.addEventListener('message', (event) => {
     switch (event.data['command']) {
          case 'clearCacheAll':
               event.waitUntil(caches.keys().then(names => {
                    for (let name of names) {
                         console.log('[Service Worker] cache is deleted:', name);
                         caches.delete(name);
                    }
               }));
               break;
          case 'getCache':
               console.log('[Service Worker] cache is added:', cacheName);
               event.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(precacheResources)));
               break;
     }
});