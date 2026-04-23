importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyCRxir01RkeSWVA6GMJvVzkU1gVAiEfnF4",
    authDomain: "todo-live-8ab83.firebaseapp.com",
    projectId: "todo-live-8ab83",
    messagingSenderId: "30547534734",
    appId: "1:30547534734:web:6689f6b42a28badb097adf",
});

const messaging = firebase.messaging();

// ─── Why no onBackgroundMessage handler? ────────────────────────────────────
//
// We send `webpush.notification` from the server (firebase-admin.ts).
// When a FCM message contains a `notification` block, the BROWSER auto-displays
// it natively — no SW code needed. If we ALSO call showNotification() here,
// the user gets TWO identical toasts for every push.
//
// onBackgroundMessage is only needed for pure data-only payloads (no notification
// block). Since we always send webpush.notification, we suppress this handler.
//
// The click routing below is all we need on the SW side.
// ────────────────────────────────────────────────────────────────────────────

messaging.onBackgroundMessage((_payload) => {
    // Intentionally left empty.
    // Auto-display is handled by the browser via webpush.notification.
    // Logging only:
    console.log("[SW] Background message received (auto-displayed by browser).");
});

// ── Route user to the correct page when they tap the notification ─────────
self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    const url = event.notification.data?.url || "/todos";

    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                // Focus existing tab if it matches the target path
                if (
                    new URL(client.url).pathname === new URL(url, self.location.origin).pathname
                    && "focus" in client
                ) {
                    return client.focus();
                }
            }
            return clients.openWindow(url);
        })
    );
});