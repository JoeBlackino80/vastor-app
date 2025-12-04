'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Navigation, Mail, Lock, AlertCircle, Package, CheckCircle, LogOut, Coffee } from 'lucide-react'

export default function CourierPage() {
  const [courier, setCourier] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [pinCode, setPinCode] = useState('')
  const [pinError, setPinError] = useState('')
  const [isPaused, setIsPaused] = useState(false)
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
      fetchOrders(c.id)
      goOnline(c.id) // Automaticky online pri načítaní
      startTracking(c.id)
    }
  }, [])

  const fetchOrders = async (courierId: string) => {
    const res = await fetch('/api/courier-orders?courier_id=' + courierId)
    const data = await res.json()
    setOrders(data.orders || [])
  }

  const goOnline = async (courierId: string) => {
    await fetch('/api/courier-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courier_id: courierId, is_online: true, status: 'available' })
    })
  }

  const startTracking = (courierId: string) => {
    if (!navigator.geolocation) return
    
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setCurrentLocation({ lat: latitude, lng: longitude })
        
        await fetch('/api/courier-location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courier_id: courierId, latitude, longitude })
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

  const togglePause = async () => {
    const newPaused = !isPaused
    setIsPaused(newPaused)
    
    await fetch('/api/courier-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courier_id: courier.id,
        is_online: !newPaused,
        status: newPaused ? 'paused' : 'available'
      })
    })
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
        goOnline(data.courier.id) // Automaticky online pri prihlásení
        startTracking(data.courier.id)
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
  }

  const completeDelivery = async () => {
    setPinError('')
    if (!selectedOrder || !courier) return
    
    const res = await fetch('/api/complete-delivery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: selectedOrder.id, courier_id: courier.id, pin: pinCode })
    })
    
    const data = await res.json()
    if (!res.ok) { setPinError(data.error || 'Chyba'); return }
    
    setPinCode('')
    setSelectedOrder(null)
    fetchOrders(courier.id)
    alert('Doručenie dokončené!')
  }

  // Login form
  if (!courier) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-lg">
          <Link href="/" className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
              <Navigation className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">VASTOR Kurýr</h1>
              <p className="text-gray-500 text-sm">Prihlásenie</p>
            </div>
          </Link>

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

  // Dashboard
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className={`p-4 ${isPaused ? 'bg-yellow-500' : 'bg-green-500'} text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Navigation className="w-6 h-6" />
            <div>
              <h1 className="font-bold">VASTOR Kurýr</h1>
              <p className="text-xs opacity-80">{courier.first_name} {courier.last_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={togglePause} className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 ${isPaused ? 'bg-white text-yellow-600' : 'bg-white/20'}`}>
              <Coffee className="w-4 h-4" />
              {isPaused ? 'Pokračovať' : 'Pauza'}
            </button>
            <button onClick={logout} className="p-2 bg-white/20 rounded-lg"><LogOut className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="mt-2 text-sm opacity-90">
          {isPaused ? '☕ Na pauze - neprijímaš objednávky' : '✅ Online - prijímaš objednávky'}
          {currentLocation && !isPaused && (
            <span className="ml-2">📍 {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}</span>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        <h2 className="font-bold text-lg">Aktívne objednávky ({orders.length})</h2>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Žiadne aktívne objednávky</p>
            <p className="text-sm text-gray-400 mt-2">
              {isPaused ? 'Ukonči pauzu pre prijímanie objednávok' : 'Čakám na novú objednávku...'}
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
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
            <p className="font-semibold text-center">Zadaj PIN od príjemcu</p>
            <input type="text" value={pinCode} onChange={(e) => setPinCode(e.target.value)} placeholder="4-miestny PIN" maxLength={4} className="w-full text-center text-3xl font-bold py-4 bg-gray-100 rounded-xl tracking-widest" />
            {pinError && <p className="text-red-500 text-sm text-center">{pinError}</p>}
            <button onClick={completeDelivery} className="w-full py-4 bg-green-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" /> Doručenie dokončené
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
