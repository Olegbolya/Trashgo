import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getMessaging, getToken, type Messaging } from 'firebase/messaging';

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _messaging: Messaging | null = null;

function getFirebaseConfig() {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };
}

function ensureApp(): FirebaseApp | null {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  if (!apiKey) return null;
  if (!_app) _app = initializeApp(getFirebaseConfig());
  return _app;
}

export function getFirebaseAuth(): Auth | null {
  const app = ensureApp();
  if (!app) return null;
  if (!_auth) _auth = getAuth(app);
  return _auth;
}

export const isFirebaseEnabled = () => !!import.meta.env.VITE_FIREBASE_API_KEY;

export async function getFcmToken(): Promise<string | null> {
  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
  if (!vapidKey) return null;
  const app = ensureApp();
  if (!app) return null;

  try {
    if (!('serviceWorker' in navigator) || !('Notification' in window)) return null;
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    // Register Firebase service worker with config in URL so it can init Firebase
    const configParam = encodeURIComponent(JSON.stringify(getFirebaseConfig()));
    const swReg = await navigator.serviceWorker.register(
      `/firebase-messaging-sw.js?firebaseConfig=${configParam}`,
      { scope: '/' }
    );
    await navigator.serviceWorker.ready;

    if (!_messaging) _messaging = getMessaging(app);
    const token = await getToken(_messaging, { vapidKey, serviceWorkerRegistration: swReg });
    return token || null;
  } catch (e) {
    console.warn('[FCM] Failed to get token:', e);
    return null;
  }
}
