'use client'
import { useState, useEffect } from 'react'
import { MapPin, Navigation, Play, Package, CheckCircle, LogIn } from 'lucide-react'

export default function CourierPanel() {
  const [email, setEmail] = useState('')
  const [courier, setCourier] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [watchId, setWatchId] = useState<number | null>(null)
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchMyOrders = async (courierId: string) => {
    const res = await fetch(`/api/courier-orders?courier_id=${courierId}`)
    const data = await res.json()
    setOrders(data.orders || [])
  }

  const login = async () => {
    if (!email) { setStatus('Zadaj email'); return }
    setLoading(true)
    setStatus('')
    
    try {
      const res = await fetch(`/api/courier-login?email=${encodeURIComponent(email)}`)
      const data = await res.json()
      
      if (data.courier) {
        setCourier(data.courier)
        fetchMyOrders(data.courier.id)
      } else {
        setStatus('Kurier s tymto emailom neexistuje')
      }
    } catch (err) {
      setStatus('Chyba pri prihlaseni')
    }
    setLoading(false)
  }

  const selectOrder = (order: any) => {
    setSelectedOrder(order)
    setStatus('')
  }

  const startTracking = () => {
    if (!selectedOrder || !courier) { setStatus('Vyber objednavku'); return }
    if (!navigator.geolocation) { setStatus('Geolokacia nie je podporovana'); return }
    
    setIsTracking(true)
    setStatus('Sledovanie aktivne...')
    
    const id = navigator.geolocation.watchPosition(async (position) => {
      const { latitude, longitude } = position.coords
      setCurrentLocation({ lat: latitude, lng: longitude })
      try {
        await fetch('/api/location', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ courier_id: courier.id, order_id: selectedOrder.id, latitude, longitude }) 
        })
        setStatus('Aktualizovane: ' + new Date().toLocaleTimeString())
      } catch (err) { setStatus('Chyba pri odosielani') }
    }, () => { setStatus('Chyba GPS'); setIsTracking(false) }, { enableHighAccuracy: true })
    
    setWatchId(id)
  }

  const stopTracking = () => {
    if (watchId !== null) navigator.geolocation.clearWatch(watchId)
    setWatchId(null)
    setIsTracking(false)
    setStatus('Sledovanie zastavene')
  }

  const completeDelivery = async () => {
    if (!selectedOrder || !courier) return
    try {
      const res = await fetch('/api/complete-delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: selectedOrder.id, courier_id: courier.id })
      })
      const data = await res.json()
      if (data.success) {
        stopTracking()
        setStatus('Dorucenie dokoncene!')
        setSelectedOrder(null)
        fetchMyOrders(courier.id)
      } else {
        setStatus('Chyba: ' + (data.error || 'Nepodarilo sa'))
      }
    } catch (err) { setStatus('Chyba pri dokoncovani') }
  }

  if (!courier) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-md mx-auto bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center"><Navigation className="w-6 h-6 text-white" /></div>
            <div><h1 className="text-xl font-bold">Kuryr Panel</h1><p className="text-gray-500 text-sm">Prihlasenie</p></div>
          </div>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="Tvoj email" 
            className="w-full px-4 py-3 bg-gray-100 rounded-xl mb-4" 
            onKeyDown={(e) => e.key === 'Enter' && login()} 
          />
          {status && <p className="text-center text-sm mb-4 text-red-500">{status}</p>}
          <button onClick={login} disabled={loading} className="w-full py-4 bg-black text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
            <LogIn className="w-5 h-5" /> {loading ? 'Nacitavam...' : 'Prihlasit sa'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center"><Navigation className="w-6 h-6 text-white" /></div>
              <div>
                <h1 className="text-xl font-bold">{courier.first_name} {courier.last_name}</h1>
                <p className="text-gray-500 text-sm">{courier.vehicle_type} • {courier.rating} ⭐</p>
              </div>
            </div>
            <button onClick={() => fetchMyOrders(courier.id)} className="p-2 bg-gray-100 rounded-xl"><Package className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Moje objednavky */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="font-bold mb-4">Moje objednavky ({orders.length})</h2>
          {orders.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Ziadne priradene objednavky</p>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <button 
                  key={order.id} 
                  onClick={() => selectOrder(order)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${selectedOrder?.id === order.id ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium">{order.customer_name}</p>
                    <span className={`px-2 py-1 rounded-full text-xs ${order.status === 'assigned' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>{order.status}</span>
                  </div>
                  <p className="text-sm text-gray-500">📍 {order.pickup_address?.substring(0, 30)}...</p>
                  <p className="text-sm text-gray-500">🏠 {order.delivery_address?.substring(0, 30)}...</p>
                  <p className="text-sm font-medium mt-2">{order.price} Kc</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tracking panel */}
        {selectedOrder && (
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="font-bold mb-4">Sledovanie polohy</h2>
            {currentLocation && (
              <div className="bg-gray-100 rounded-xl p-4 mb-4">
                <MapPin className="w-4 h-4 inline" /> Lat: {currentLocation.lat.toFixed(6)}, Lng: {currentLocation.lng.toFixed(6)}
              </div>
            )}
            {status && <p className="text-center text-sm mb-4">{status}</p>}
            {!isTracking ? (
              <button onClick={startTracking} className="w-full py-4 bg-black text-white rounded-xl font-semibold flex items-center justify-center gap-2">
                <Play className="w-5 h-5" /> Spustit sledovanie
              </button>
            ) : (
              <button onClick={stopTracking} className="w-full py-4 bg-gray-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2">
                <Package className="w-5 h-5" /> Zastavit sledovanie
              </button>
            )}
          </div>
        )}

        {/* Complete delivery */}
        {selectedOrder && (
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="font-bold mb-4 flex items-center gap-2"><CheckCircle className="w-5 h-5" /> Dokoncit dorucenie</h2>
            <button onClick={completeDelivery} className="w-full py-4 bg-green-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" /> Dorucenie dokoncene
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
