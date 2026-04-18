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
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/UFLLogo.png", 
    badge: "/UFLLogo.png",
  });
});