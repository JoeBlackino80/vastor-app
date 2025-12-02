'use client'
import { useState, useEffect } from 'react'
import { MapPin, Navigation, Play, Package, CheckCircle, LogOut, Eye, EyeOff, BarChart3 } from 'lucide-react'
import Link from 'next/link'

interface Order {
  id: string
  pickup_address: string
  delivery_address: string
  customer_name: string
  customer_phone: string
  status: string
  price: number
}

export default function CourierPanel() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [courier, setCourier] = useState<any>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [watchId, setWatchId] = useState<number | null>(null)

  useEffect(() => {
    const savedCourier = localStorage.getItem('courier')
    if (savedCourier) {
      const c = JSON.parse(savedCourier)
      setCourier(c)
      fetchMyOrders(c.id)
    }
  }, [])

  const login = async () => {
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch('/api/courier-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()

      if (data.courier) {
        setCourier(data.courier)
        localStorage.setItem('courier', JSON.stringify(data.courier))
        fetchMyOrders(data.courier.id)
      } else {
        if (data.message === 'not_found') setError('Kurýr s týmto emailom neexistuje')
        else if (data.message === 'wrong_password') setError('Nesprávne heslo')
        else if (data.message === 'pending_approval') setError('Tvoja registrácia čaká na schválenie administrátorom')
        else if (data.message === 'rejected') setError('Tvoja registrácia bola zamietnutá')
        else setError('Prihlásenie zlyhalo')
      }
    } catch (err) {
      setError('Chyba pri prihlásení')
    }
    setIsLoading(false)
  }

  const logout = () => {
    setCourier(null)
    setOrders([])
    setSelectedOrder(null)
    localStorage.removeItem('courier')
    if (watchId) navigator.geolocation.clearWatch(watchId)
  }

  const fetchMyOrders = async (courierId: string) => {
    const res = await fetch(`/api/courier-orders?courier_id=${courierId}`)
    const data = await res.json()
    setOrders(data.orders || [])
    if (data.orders?.length > 0) setSelectedOrder(data.orders[0])
  }

  const startTracking = () => {
    if (!selectedOrder || !courier) return
    if (!navigator.geolocation) { setStatus('Geolokácia nie je podporovaná'); return }
    
    setIsTracking(true)
    setStatus('Sledovanie aktívne...')
    
    const id = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setCurrentLocation({ lat: latitude, lng: longitude })
        try {
          await fetch('/api/location', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ courier_id: courier.id, order_id: selectedOrder.id, latitude, longitude })
          })
          setStatus('Aktualizované: ' + new Date().toLocaleTimeString())
        } catch (err) {
          setStatus('Chyba pri odosielaní')
        }
      },
      (error) => { setStatus('Chyba GPS'); setIsTracking(false) },
      { enableHighAccuracy: true }
    )
    setWatchId(id)
  }

  const stopTracking = () => {
    if (watchId) navigator.geolocation.clearWatch(watchId)
    setIsTracking(false)
    setStatus('')
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
        alert(`Doručenie dokončené! Zarobil si ${data.earnings} Kč`)
        fetchMyOrders(courier.id)
        setSelectedOrder(null)
      }
    } catch (err) {
      alert('Chyba pri dokončení doručenia')
    }
  }

  if (!courier) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md w-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
              <Navigation className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Kurýr Panel</h1>
              <p className="text-gray-500 text-sm">Prihlás sa do svojho účtu</p>
            </div>
          </div>

          <div className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-3 bg-gray-100 rounded-xl"
              onKeyPress={(e) => e.key === 'Enter' && login()}
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Heslo"
                className="w-full px-4 py-3 bg-gray-100 rounded-xl pr-12"
                onKeyPress={(e) => e.key === 'Enter' && login()}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button
              onClick={login}
              disabled={isLoading}
              className="w-full py-4 bg-black text-white rounded-xl font-semibold disabled:opacity-50"
            >
              {isLoading ? 'Prihlasujem...' : 'Prihlásiť sa'}
            </button>
          </div>

          <p className="text-center text-gray-500 text-sm mt-6">
            Nemáš účet? <Link href="/kuryr/registracia" className="text-black underline">Zaregistruj sa</Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                <Navigation className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold">{courier.first_name} {courier.last_name}</h1>
                <p className="text-gray-500 text-sm">{courier.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/kuryr/dashboard" className="p-2 hover:bg-gray-100 rounded-full" title="Dashboard">
                <BarChart3 className="w-5 h-5" />
              </Link>
              <button onClick={logout} className="p-2 hover:bg-gray-100 rounded-full" title="Odhlásiť">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${courier.status === 'available' ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600">{courier.status === 'available' ? 'Dostupný' : 'Zaneprázdnený'}</span>
            <span className="ml-auto text-sm">{courier.rating} ⭐</span>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" /> Moje objednávky ({orders.length})
          </h2>
          {orders.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Žiadne priradené objednávky</p>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`p-4 rounded-xl cursor-pointer transition-colors ${selectedOrder?.id === order.id ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  <p className="font-medium truncate">{order.pickup_address}</p>
                  <p className="text-sm opacity-70 truncate">→ {order.delivery_address}</p>
                  <div className="flex justify-between mt-2">
                    <span className="text-sm">{order.customer_name}</span>
                    <span className="font-bold">{order.price} Kč</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tracking */}
        {selectedOrder && (
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" /> GPS Sledovanie
            </h2>
            {currentLocation && (
              <div className="bg-gray-100 rounded-xl p-3 mb-4 text-sm">
                📍 {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
              </div>
            )}
            {status && <p className="text-sm text-center mb-4 text-gray-600">{status}</p>}
            {!isTracking ? (
              <button onClick={startTracking} className="w-full py-4 bg-black text-white rounded-xl font-semibold flex items-center justify-center gap-2">
                <Play className="w-5 h-5" /> Spustiť sledovanie
              </button>
            ) : (
              <button onClick={stopTracking} className="w-full py-4 bg-gray-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2">
                <Package className="w-5 h-5" /> Zastaviť sledovanie
              </button>
            )}
          </div>
        )}

        {/* Complete Delivery */}
        {selectedOrder && (
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" /> Dokončiť doručenie
            </h2>
            <p className="text-gray-500 text-sm mb-4">Zárobíš: <strong className="text-green-600">{Math.round(selectedOrder.price * 0.7)} Kč</strong></p>
            <button onClick={completeDelivery} className="w-full py-4 bg-green-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" /> Doručenie dokončené
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
