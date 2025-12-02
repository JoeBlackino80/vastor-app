self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {}
  const title = data.title || 'VASTOR'
  const options = {
    body: data.body || 'Nova objednavka!',
    icon: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/kuryr' }
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', function(event) {
  event.notification.close()
  event.waitUntil(clients.openWindow(event.notification.data.url || '/kuryr'))
})
