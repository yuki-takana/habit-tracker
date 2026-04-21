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

messaging.onBackgroundMessage((payload) => {
    console.log("[SW] Full payload:", JSON.stringify(payload));
    const title = payload.data?.title ?? "UFL Habit Tracker";
    const body = payload.data?.body ?? "";
    const url = payload.data?.url || "/";
    self.registration.showNotification(title, {
        body: body,
        vibrate: [200, 100, 200],
        data: {
            url: url
        },
    });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(url) && "focus" in client) {
            return client.focus();
          }
        }
        return clients.openWindow(url);
      })
  );
});