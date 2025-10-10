/* Service Worker for Smarter Dog Grooming Salon */

const CACHE_VERSION = 'v2.1.0';
const CACHE_NAME = `smarterdog-${CACHE_VERSION}`;

// Assets to cache immediately
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/faqs.html',
  '/privacy.html',
  '/terms.html',
  '/cookies.html',
  '/offline.html',
  '/logo.png',
  '/logo-desktop.webp',
  '/logo-tablet.webp',
  '/logo-mobile.webp',
  '/manifest.json',
  '/robots.txt',
  '/sitemap.xml',
  '/security.txt'
];

// Cache strategies
const CACHE_STRATEGIES = {
  images: 'cache-first',
  pages: 'network-first',
  api: 'network-only'
};

/* Install Event - Precache assets */
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[ServiceWorker] Precaching assets');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
      .catch(err => console.error('[ServiceWorker] Install error:', err))
  );
});

/* Activate Event - Clean old caches */
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activating...');

  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => {
              console.log('[ServiceWorker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

/* Fetch Event - Serve from cache with network fallback */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip external requests so the browser handles them normally.
  // This prevents CSP violations for third-party services like Google Fonts.
  if (url.origin !== location.origin) {
    return;
  }

  // API requests - network only
  if (url.pathname.includes('/api/') || url.hostname.includes('formspree.io')) {
    event.respondWith(
      fetch(request)
        .catch(() => new Response(
          JSON.stringify({ error: 'Offline - request queued' }),
          { headers: { 'Content-Type': 'application/json' } }
        ))
    );
    return;
  }

  // Images - cache first, network fallback
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request)
        .then(cached => {
          return cached || fetch(request).then(response => {
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(request, responseClone);
              });
            }
            return response;
          });
        })
        .catch(() => {
          // Return offline image if available
          return caches.match('/logo.png');
        })
    );
    return;
  }

  // HTML pages - network first, cache fallback
  if (request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request)
            .then(cached => cached || caches.match('/offline.html'));
        })
    );
    return;
  }

  // CSS/JS - cache first, network fallback with update
  if (request.destination === 'script' || request.destination === 'style') {
    event.respondWith(
      caches.match(request)
        .then(cached => {
          const fetchPromise = fetch(request).then(response => {
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(request, responseClone);
              });
            }
            return response;
          });
          return cached || fetchPromise;
        })
    );
    return;
  }

  // Default - network first, cache fallback
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

/* Background Sync for form submissions */
self.addEventListener('sync', event => {
  if (event.tag === 'sync-forms') {
    event.waitUntil(syncForms());
  }
});

async function syncForms() {
  const cache = await caches.open('form-submissions');
  const requests = await cache.keys();

  return Promise.all(
    requests.map(async request => {
      try {
        const response = await fetch(request.clone());
        if (response.status === 200) {
          await cache.delete(request);
          console.log('[ServiceWorker] Form synced successfully');
        }
      } catch (err) {
        console.log('[ServiceWorker] Form sync failed, will retry');
      }
    })
  );
}

/* Push Notifications (future enhancement) */
self.addEventListener('push', event => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/logo.png',
    badge: '/logo.png',
    vibrate: [200, 100, 200],
    data: data.url
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.notification.data) {
    event.waitUntil(
      clients.openWindow(event.notification.data)
    );
  }
});

console.log('[ServiceWorker] Loaded successfully');
