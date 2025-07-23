// LifeStream Service Worker
// Customer-first: Fast loading, offline support, background sync

const CACHE_NAME = 'lifestream-v2.0.0';
const STATIC_CACHE_NAME = 'lifestream-static-v2.0.0';
const DYNAMIC_CACHE_NAME = 'lifestream-dynamic-v2.0.0';

// Critical files to cache immediately
const STATIC_ASSETS = [
  '/lifestream-app/',
  '/lifestream-app/index.html',
  '/lifestream-app/js/auth/google-auth.js',
  '/lifestream-app/js/storage/drive-storage.js',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.min.js',
  'https://apis.google.com/js/api.js',
  'https://developers.google.com/identity/images/g-logo.png'
];

// Network-first resources (always try network first)
const NETWORK_FIRST = [
  'https://apis.google.com/',
  'https://accounts.google.com/',
  'https://www.googleapis.com/'
];

// Install event - cache critical resources
self.addEventListener('install', event => {
  console.log('🔧 LifeStream Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('📦 Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ Static assets cached successfully');
        return self.skipWaiting(); // Activate immediately
      })
      .catch(error => {
        console.warn('⚠️ Failed to cache some assets:', error);
      })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  console.log('🚀 LifeStream Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName.startsWith('lifestream-')) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activated');
        return self.clients.claim(); // Control all clients immediately
      })
  );
});

// Fetch event - smart caching strategy
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip Chrome extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }
  
  // Network-first for API calls (Google APIs)
  if (NETWORK_FIRST.some(pattern => request.url.includes(pattern))) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }
  
  // Cache-first for static assets
  if (STATIC_ASSETS.some(asset => request.url.includes(asset.split('/').pop()))) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }
  
  // Stale-while-revalidate for everything else
  event.respondWith(staleWhileRevalidateStrategy(request));
});

// Cache-first strategy (for static assets)
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    console.warn('Cache-first failed:', error);
    return new Response('Offline - Content not available', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Network-first strategy (for API calls)
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok && request.url.includes('googleapis.com')) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    console.warn('Network-first trying cache:', error);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response('Network unavailable', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Stale-while-revalidate strategy (for dynamic content)
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => cachedResponse); // Fallback to cache on network error
  
  return cachedResponse || fetchPromise;
}

// Background sync for offline actions
self.addEventListener('sync', event => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync-activities') {
    event.waitUntil(syncActivities());
  }
});

// Sync activities when back online
async function syncActivities() {
  try {
    console.log('📤 Syncing offline activities...');
    
    // Get offline activities from IndexedDB (to be implemented)
    const offlineActivities = await getOfflineActivities();
    
    if (offlineActivities.length > 0) {
      // Sync with Google Drive when back online
      await syncWithGoogleDrive(offlineActivities);
      await clearOfflineActivities();
      
      // Notify user
      self.registration.showNotification('LifeStream Synced', {
        body: `${offlineActivities.length} activities synced to Google Drive`,
        icon: '/lifestream-app/icons/icon-192x192.png',
        badge: '/lifestream-app/icons/badge-72x72.png',
        tag: 'sync-complete'
      });
    }
    
  } catch (error) {
    console.error('❌ Background sync failed:', error);
  }
}

// Placeholder functions for offline sync (to be implemented)
async function getOfflineActivities() {
  // TODO: Implement IndexedDB retrieval
  return [];
}

async function syncWithGoogleDrive(activities) {
  // TODO: Implement Google Drive sync
  console.log('Syncing', activities.length, 'activities');
}

async function clearOfflineActivities() {
  // TODO: Clear synced activities from IndexedDB
}

// Push notification handling (for future features)
self.addEventListener('push', event => {
  console.log('📱 Push notification received:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'New LifeStream update available!',
    icon: '/lifestream-app/icons/icon-192x192.png',
    badge: '/lifestream-app/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open LifeStream',
        icon: '/lifestream-app/icons/action-open.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/lifestream-app/icons/action-close.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('LifeStream', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('🔔 Notification clicked:', event.notification.tag);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/lifestream-app/')
    );
  }
});

// Handle app shortcuts
self.addEventListener('notificationclick', event => {
  if (event.action === 'quick-log') {
    event.waitUntil(
      clients.openWindow('/lifestream-app/#chat')
    );
  }
});

// Error handling
self.addEventListener('error', event => {
  console.error('❌ Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
  console.error('❌ Unhandled promise rejection in SW:', event.reason);
});

console.log('🚀 LifeStream Service Worker loaded successfully');
