self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {}
  event.waitUntil(self.registration.showNotification(data.title || 'VASTOR', { body: data.body || 'Nova notifikacia', icon: '/icon-192.png', vibrate: [200, 100, 200], data: data.data }))
})
self.addEventListener('notificationclick', function(event) {
  event.notification.close()
  event.waitUntil(clients.openWindow('/kuryr'))
})
