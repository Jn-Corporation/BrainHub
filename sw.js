const CACHE_NAME = 'brainhub-cache-v4'; // Version upgraded for nested structure

// Core system assets and explicit relative paths based on your folder structure
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.svg',
  './icon-512.svg',
  './icon-maskable.svg',
  
  // Study Navigation Entry Points
  './study/english/home.html',
  './study/study-maths/home.html',
  
  // Class 9 English Prose Chapters
  './study/english/class 9/Prose/the_fun_they_had.html',
  './study/english/class 9/Prose/the_sound_of_music.html',
  
  // Third Party CDN Assets
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'
];

// Install Event - Pre-cache everything including nested study materials
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Pre-caching complete nested study ecosystem');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up old cache versions safely
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache version:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Advanced Adaptive Caching Engine
self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith('http')) return;

  const requestUrl = new URL(event.request.url);

  // Check if requested file belongs to our static library or CDNs
  const isStaticShell = STATIC_ASSETS.some(asset => event.request.url.includes(asset.replace('./', ''))) || 
                        requestUrl.hostname.includes('cdnjs.cloudflare.com') || 
                        requestUrl.hostname.includes('fonts.googleapis.com') || 
                        requestUrl.hostname.includes('fonts.gstatic.com');

  if (isStaticShell) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          // Serve from cache instantly, fetch background update quietly
          fetch(event.request).then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
            }
          }).catch(() => {/* Handle network drop silently */});
          
          return cachedResponse;
        }

        // Fallback for newly added files in directory
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse.status === 200 || networkResponse.type === 'opaque') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Network-First strategy with smart offline routing fallback
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;

          // If the user is inside study folder offline, serve index.html dashboard instead of a black screen
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html') || caches.match('./');
          }
        });
      })
  );
});