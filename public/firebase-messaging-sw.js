// ── Static asset caching + offline fallback ───────────────────────────────
const CACHE = 'trashgo-v3';
const OFFLINE_URL = '/offline.html';
const APP_SHELL = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/favicon.png',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then(c => c.addAll(APP_SHELL).catch(() => c.add(OFFLINE_URL)))
  );
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  // Static assets + fonts: cache-first
  if (/\.(js|css|woff2?|ttf|png|svg|ico|webp|jpg|jpeg)(\?|$)/.test(url.pathname)) {
    event.respondWith(
      caches.match(req).then(cached => {
        if (cached) return cached;
        return fetch(req).then(res => {
          if (!res.ok || res.status === 206) return res;
          caches.open(CACHE).then(c => c.put(req, res.clone()));
          return res;
        });
      })
    );
    return;
  }

  // Navigation requests: network-first with stale-while-revalidate fallback
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(res => {
          if (res.ok) {
            caches.open(CACHE).then(c => c.put(req, res.clone()));
          }
          return res;
        })
        .catch(() => caches.match(req).then(cached => cached ?? caches.match(OFFLINE_URL)))
    );
    return;
  }
});
// ── Background Sync — queue API POST requests while offline ──────────────────
const SYNC_TAG = 'trashgo-api-sync';
const SYNC_DB_NAME = 'trashgo-bg-sync';
const SYNC_STORE_NAME = 'pending-requests';

function openSyncDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(SYNC_DB_NAME, 1);
    req.onupgradeneeded = (e) => {
      e.target.result.createObjectStore(SYNC_STORE_NAME, { keyPath: 'id', autoIncrement: true });
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = () => reject(req.error);
  });
}

self.addEventListener('sync', (event) => {
  if (event.tag === SYNC_TAG) {
    event.waitUntil(replaySyncQueue());
  }
});

async function replaySyncQueue() {
  const db = await openSyncDb();
  const items = await new Promise((resolve) => {
    const tx = db.transaction(SYNC_STORE_NAME, 'readonly');
    const req = tx.objectStore(SYNC_STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve([]);
  });

  for (const item of items) {
    try {
      const res = await fetch(item.url, {
        method: item.method,
        headers: JSON.parse(item.headers),
        body: item.body,
      });
      if (res.ok) {
        const tx = db.transaction(SYNC_STORE_NAME, 'readwrite');
        tx.objectStore(SYNC_STORE_NAME).delete(item.id);
        self.clients.matchAll({ type: 'window' }).then(clients => {
          clients.forEach(c => c.postMessage({ type: 'SYNC_COMPLETE', url: item.url }));
        });
      }
    } catch {
      // Network still down, keep in queue
    }
  }
}
// ─────────────────────────────────────────────────────────────────────────────

// Firebase Cloud Messaging service worker
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

try {
  const params = new URLSearchParams(self.location.search);
  const raw = params.get('firebaseConfig');
  if (!raw) throw new Error('No firebaseConfig param');

  const config = JSON.parse(decodeURIComponent(raw));
  if (!config.apiKey) throw new Error('Missing apiKey in config');

  firebase.initializeApp(config);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title || 'TrashGo';
    const body = payload.notification?.body || '';
    const data = payload.data || {};
    self.registration.showNotification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-72.png',
      data,
      vibrate: [200, 100, 200],
    });
  });
} catch (e) {
  console.warn('[FCM SW] Init skipped:', e.message);
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const orderId = event.notification.data?.orderId;
  const url = orderId ? `/order/${orderId}` : '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
