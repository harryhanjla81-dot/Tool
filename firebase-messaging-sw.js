// Import the Firebase app and messaging scripts.
// These must be available in your public/ directory or served from a CDN.
importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js");

// IMPORTANT: This configuration is public and safe to be in the client.
// It's the same config used to initialize Firebase in your main application.
const firebaseConfig = {
    apiKey: "AIzaSyDRp6dXgiutqrHuwqe5kAnw55AFb_Hu_OU",
    authDomain: "group-chat-542e3.firebaseapp.com",
    databaseURL: "https://group-chat-542e3-default-rtdb.firebaseio.com",
    projectId: "group-chat-542e3",
    storageBucket: "group-chat-542e3.appspot.com",
    messagingSenderId: "401578327447",
    appId: "1:401578327447:web:ec8034db3bd5a5e20998d2"
};

// Initialize the Firebase app in the service worker.
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

/**
 * Handle background messages. When a push notification is received and the
 * PWA is not in the foreground, this is the handler that will be called.
 */
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification.body || 'You have a new update.',
    icon: '/favicon.ico' // You can customize this
  };

  // The service worker's registration is available on `self.registration`.
  // `showNotification` is a standard Service Worker API to display a system notification.
  self.registration.showNotification(notificationTitle, notificationOptions);
});
