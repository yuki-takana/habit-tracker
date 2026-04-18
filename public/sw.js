self.addEventListener("push", function (event) {
  if (!event.data) return;

  const data = event.data.json();

  self.registration.showNotification(data.title, {
    body: data.body,
    icon: "/icon.png",
    badge: "/icon.png",
    vibrate: [200, 100, 200],
  });
});