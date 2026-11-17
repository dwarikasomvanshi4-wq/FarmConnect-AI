importScripts("https://www.gstatic.com/firebasejs/13.4.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/13.4.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyASTO3ZGsxcfVxrwEuBrfFeqU2t2k9Izfs",
  authDomain: "farmconnect-ai-81814.firebaseapp.com",
  projectId: "farmconnect-ai-81814",
  storageBucket: "farmconnect-ai-81814.firebasestorage.app",
  messagingSenderId: "238597556000",
  appId: "1:238597556000:web:678687668f118f5fa53945",
});

const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload) => {
  const notificationTitle =
    payload.notification?.title || "FarmConnect AI";

  const notificationOptions = {
    body:
      payload.notification?.body ||
      "You have received a new order.",
    icon: "/favicon.ico",
    data: payload.data || {},
  };

  self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow("/farmer-dashboard")
  );
});