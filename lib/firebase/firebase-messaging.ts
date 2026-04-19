import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGEBUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const getMessagingInstance = () => {
  if (typeof window === "undefined") return null;
  return getMessaging(app);
};

export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    // Guard: SSR or unsupported browser
    if (typeof window === "undefined" || !("Notification" in window)) return null;

    // Guard: service worker not supported
    if (!("serviceWorker" in navigator)) return null;

    const messaging = getMessagingInstance();
    if (!messaging) return null;

    // Step 1 — ask permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    // Step 2 — explicitly register SW first
    // This is what Android Chrome requires — don't let Firebase auto-detect it
    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
      { scope: "/" }
    );

    // Step 3 — wait for SW to be active before getting token
    await navigator.serviceWorker.ready;

    // Step 4 — pass registration explicitly to getToken
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration, // ← this is what was missing
    });

    return token ?? null;

  } catch (err) {
    console.error("[FCM] requestNotificationPermission failed:", err);
    return null;
  }
};

export const onForegroundMessage = (callback: (payload: any) => void) => {
  const messaging = getMessagingInstance();
  if (!messaging) return;
  onMessage(messaging, callback);
};