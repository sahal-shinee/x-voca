/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyAjymvKw1OcEVIh3uet6OFwp5tBj0XhLx4",
  authDomain: "x-voca.firebaseapp.com",
  projectId: "x-voca",
  storageBucket: "x-voca.firebasestorage.app",
  messagingSenderId: "74861176052",
  appId: "1:74861176052:web:6825086462e8210facaaa1"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background push notifications when tab is inactive or closed
messaging.onBackgroundMessage((payload) => {
  const title = payload?.notification?.title || payload?.data?.title || 'X-VOCA • Xion Regalia';
  const body = payload?.notification?.body || payload?.data?.body || 'Ada pembaruan siaran baru!';
  const targetUrl = payload?.fcmOptions?.link || payload?.data?.url || '/';

  const notificationOptions = {
    body,
    icon: '/images/logo_xion.png',
    badge: '/images/logo_xion.png',
    tag: payload?.data?.type || 'xvoca-stream-alert',
    renotify: true,
    data: {
      url: targetUrl,
    },
  };

  self.registration.showNotification(title, notificationOptions);
});

// Open or focus website URL when user clicks the notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification?.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          if ('navigate' in client && targetUrl !== '/') {
            client.navigate(targetUrl);
          }
          return;
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
