'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navigation, Mail, Lock, AlertCircle, Package, MapPin, CheckCircle, LogOut, Power } from 'lucide-react'

export default function CourierPage() {
  const router = useRouter()
  const [courier, setCourier] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [isOnline, setIsOnline] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null)
  const watchIdRef = useRef<number | null>(null)
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('courier')
    if (saved) {
      const c = JSON.parse(saved)
      setCourier(c)
      setIsOnline(c.is_online || false)
      fetchOrders(c.id)
    }
  }, [])

  // Auto-start tracking when online
  useEffect(() => {
    if (isOnline && courier) {
      startTracking()
    } else {
      stopTracking()
    }
    return () => stopTracking()
  }, [isOnline, courier])

  const fetchOrders = async (courierId: string) => {
    const res = await fetch('/api/courier-orders?courier_id=' + courierId)
    const data = await res.json()
    setOrders(data.orders || [])
  }

  const startTracking = () => {
    if (!navigator.geolocation || !courier) return
    
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setCurrentLocation({ lat: latitude, lng: longitude })
        
        // Update courier location
        await fetch('/api/courier-location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            courier_id: courier.id,
            latitude,
            longitude
          })
        })
      },
      (error) => console.error('GPS error:', error),
      { enableHighAccuracy: true, maximumAge: 5000 }
    )
  }

  const stopTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
  }

  const toggleOnline = async () => {
    const newStatus = !isOnline
    setIsOnline(newStatus)
    
    await fetch('/api/courier-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courier_id: courier.id,
        is_online: newStatus,
        status: newStatus ? 'available' : 'offline'
      })
    })
    
    // Update local storage
    const updated = { ...courier, is_online: newStatus }
    localStorage.setItem('courier', JSON.stringify(updated))
    setCourier(updated)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/courier-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()

      if (data.courier) {
        localStorage.setItem('courier', JSON.stringify(data.courier))
        setCourier(data.courier)
        fetchOrders(data.courier.id)
      } else {
        if (data.message === 'not_found') setError('Účet neexistuje')
        else if (data.message === 'wrong_password') setError('Nesprávne heslo')
        else if (data.message === 'pending_approval') setError('Čakáte na schválenie')
        else setError('Prihlásenie zlyhalo')
      }
    } catch (err) {
      setError('Chyba pripojenia')
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    if (courier) {
      await fetch('/api/courier-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courier_id: courier.id, is_online: false, status: 'offline' })
      })
    }
    stopTracking()
    localStorage.removeItem('courier')
    setCourier(null)
    setOrders([])
    setIsOnline(false)
  }

  const completeDelivery = async () => {
    if (!selectedOrder || !courier) return
    
    await fetch('/api/complete-delivery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: selectedOrder.id, courier_id: courier.id })
    })
    
    setSelectedOrder(null)
    fetchOrders(courier.id)
    alert('Doručenie dokončené!')
  }

  if (!courier) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
              <Navigation className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">VASTOR Kurýr</h1>
              <p className="text-gray-500 text-sm">Prihlásenie</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full pl-12 pr-4 py-4 bg-gray-100 rounded-xl" required />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Heslo" className="w-full pl-12 pr-4 py-4 bg-gray-100 rounded-xl" required />
            </div>
            {error && <div className="flex items-center gap-2 text-red-500 text-sm"><AlertCircle className="w-4 h-4" />{error}</div>}
            <button type="submit" disabled={isLoading} className="w-full py-4 bg-black text-white rounded-xl font-semibold disabled:opacity-50">
              {isLoading ? 'Prihlasujem...' : 'Prihlásiť sa'}
            </button>
          </form>
          <p className="text-center text-gray-500 text-sm mt-6">
            Nemáš účet? <Link href="/kuryr/registracia" className="text-black underline">Registrovať sa</Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-black text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Navigation className="w-6 h-6" />
            <div>
              <h1 className="font-bold">VASTOR Kurýr</h1>
              <p className="text-xs text-gray-400">{courier.first_name} {courier.last_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/kuryr/dashboard" className="px-3 py-1 bg-white/20 rounded-lg text-sm">Dashboard</Link>
            <button onClick={logout} className="p-2"><LogOut className="w-5 h-5" /></button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Online/Offline Toggle */}
        <div className={`rounded-2xl p-4 shadow-sm ${isOnline ? 'bg-green-500 text-white' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Power className="w-6 h-6" />
              <div>
                <p className="font-bold">{isOnline ? 'Si online' : 'Si offline'}</p>
                <p className={`text-sm ${isOnline ? 'text-green-100' : 'text-gray-500'}`}>
                  {isOnline ? 'Prijímaš objednávky' : 'Neprijímaš objednávky'}
                </p>
              </div>
            </div>
            <button
              onClick={toggleOnline}
              className={`px-6 py-2 rounded-xl font-semibold ${isOnline ? 'bg-white text-green-600' : 'bg-black text-white'}`}
            >
              {isOnline ? 'Vypnúť' : 'Zapnúť'}
            </button>
          </div>
          {isOnline && currentLocation && (
            <p className="text-xs text-green-100 mt-2">
              📍 GPS: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
            </p>
          )}
        </div>

        {/* Orders */}
        <h2 className="font-bold text-lg">Aktívne objednávky ({orders.length})</h2>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Žiadne aktívne objednávky</p>
            <p className="text-sm text-gray-400 mt-2">
              {isOnline ? 'Čakám na novú objednávku...' : 'Zapni sa online pre prijímanie objednávok'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div 
                key={order.id} 
                onClick={() => setSelectedOrder(order)}
                className={`bg-white rounded-2xl p-4 shadow-sm cursor-pointer border-2 ${selectedOrder?.id === order.id ? 'border-black' : 'border-transparent'}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold">{order.customer_name}</p>
                    <p className="text-sm text-gray-500">{order.service_type}</p>
                  </div>
                  <p className="font-bold text-lg">{order.price} Kč</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5" />
                    <p className="text-sm">{order.pickup_address}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5" />
                    <p className="text-sm">{order.delivery_address}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedOrder && (
          <button onClick={completeDelivery} className="w-full py-4 bg-green-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5" /> Doručenie dokončené
          </button>
        )}
      </div>
    </div>
  )
}
