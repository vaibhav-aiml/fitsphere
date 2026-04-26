self.addEventListener('push', function(event) {
  let data = {};
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = {
        title: 'FitSphere',
        body: event.data.text(),
        icon: '/icon-192.png',
        badge: '/badge-72.png'
      };
    }
  }
  
  const options = {
    body: data.body || 'Time to crush your workout! 💪',
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/badge-72.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/dashboard'
    },
    actions: [
      {
        action: 'open',
        title: 'Open App'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'FitSphere', options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(function(clientList) {
          for (let i = 0; i < clientList.length; i++) {
            const client = clientList[i];
            if (client.url === '/' || client.url.includes('/dashboard')) {
              return client.focus();
            }
          }
          return clients.openWindow('/dashboard');
        })
    );
  }
});