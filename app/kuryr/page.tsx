'use client'
import { useState, useEffect } from 'react'
import { MapPin, Navigation, Play, Package, CheckCircle, X, Clock, Euro, Bell } from 'lucide-react'
import Link from 'next/link'

export default function CourierPanel() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [courier, setCourier] = useState<any>(null)
  const [error, setError] = useState('')
  const [offers, setOffers] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [watchId, setWatchId] = useState<number | null>(null)

  // Polling pre nové ponuky
  useEffect(() => {
    if (!courier) return
    
    const fetchOffers = async () => {
      const res = await fetch(`/api/courier-offers?courier_id=${courier.id}`)
      const data = await res.json()
      setOffers(data.offers || [])
    }

    const fetchOrders = async () => {
      const res = await fetch(`/api/courier-orders?courier_id=${courier.id}`)
      const data = await res.json()
      setOrders(data.orders || [])
    }

    fetchOffers()
    fetchOrders()

    // Poll každé 3 sekundy
    const interval = setInterval(() => {
      fetchOffers()
      fetchOrders()
    }, 3000)

    return () => clearInterval(interval)
  }, [courier])

  const login = async () => {
    setError('')
    const res = await fetch(`/api/courier-login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`)
    const data = await res.json()

    if (data.courier) {
      setCourier(data.courier)
      // Začni zdieľať polohu
      startLocationSharing(data.courier.id)
    } else if (data.message === 'pending_approval') {
      setError('Tvoja registrácia čaká na schválenie')
    } else if (data.message === 'rejected') {
      setError('Tvoja registrácia bola zamietnutá')
    } else if (data.message === 'wrong_password') {
      setError('Nesprávne heslo')
    } else {
      setError('Kurýr nenájdený')
    }
  }

  const startLocationSharing = (courierId: string) => {
    if (!navigator.geolocation) return

    const id = navigator.geolocation.watchPosition(
      async (pos) => {
        await fetch('/api/location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            courier_id: courierId,
            order_id: selectedOrder?.id || 'idle',
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          })
        })
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 10000 }
    )
    setWatchId(id)
    setIsTracking(true)
  }

  const respondToOffer = async (orderId: string, action: 'accept' | 'reject') => {
    await fetch('/api/respond-offer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderId, courier_id: courier.id, action })
    })

    // Refresh
    setOffers(offers.filter(o => o.id !== orderId))
    if (action === 'accept') {
      const res = await fetch(`/api/courier-orders?courier_id=${courier.id}`)
      const data = await res.json()
      setOrders(data.orders || [])
    }
  }

  const completeDelivery = async () => {
    if (!selectedOrder) return
    await fetch('/api/complete-delivery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: selectedOrder.id, courier_id: courier.id })
    })
    setSelectedOrder(null)
    setOrders(orders.filter(o => o.id !== selectedOrder.id))
  }

  // Login screen
  if (!courier) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 shadow-lg w-full max-w-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
              <Navigation className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">VASTOR Kurýr</h1>
              <p className="text-gray-500 text-sm">Prihlásenie</p>
            </div>
          </div>

          <div className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-3 bg-gray-100 rounded-xl"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Heslo"
              className="w-full px-4 py-3 bg-gray-100 rounded-xl"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              onClick={login}
              className="w-full py-4 bg-black text-white rounded-xl font-semibold"
            >
              Prihlásiť sa
            </button>
          </div>

          <p className="text-center text-gray-500 text-sm mt-6">
            Nemáš účet? <Link href="/kuryr/registracia" className="text-black underline">Registrovať sa</Link>
          </p>
        </div>
      </div>
    )
  }

  // Main panel
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-black text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold">{courier.first_name} {courier.last_name}</p>
            <p className="text-sm text-gray-400">{isTracking ? '🟢 Online' : '🔴 Offline'}</p>
          </div>
          <Link href="/kuryr/dashboard" className="px-4 py-2 bg-white/10 rounded-lg text-sm">
            Dashboard
          </Link>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Nové ponuky - Bolt/Uber štýl */}
        {offers.map((offer) => (
          <div key={offer.id} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
            <div className="bg-green-500 text-white p-4">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                <span className="font-bold">NOVÁ OBJEDNÁVKA!</span>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Euro className="w-5 h-5 text-green-600" />
                  <span className="text-2xl font-bold">{offer.price} Kč</span>
                </div>
                {offer.offer_distance && (
                  <div className="flex items-center gap-1 text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span>{offer.offer_distance.toFixed(1)} km</span>
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5"></div>
                  <div>
                    <p className="text-xs text-gray-500">VYZDVIHNUTIE</p>
                    <p className="font-medium">{offer.pickup_address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5"></div>
                  <div>
                    <p className="text-xs text-gray-500">DORUČENIE</p>
                    <p className="font-medium">{offer.delivery_address}</p>
                  </div>
                </div>
              </div>

              {/* Countdown */}
              <div className="flex items-center gap-2 text-orange-500 mb-4">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Zostáva 30 sekúnd</span>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => respondToOffer(offer.id, 'reject')}
                  className="flex-1 py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" /> Odmietnuť
                </button>
                <button
                  onClick={() => respondToOffer(offer.id, 'accept')}
                  className="flex-1 py-4 bg-green-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" /> Prijať
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Aktívne objednávky */}
        {orders.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="font-bold mb-3 flex items-center gap-2">
              <Package className="w-5 h-5" /> Aktívne objednávky
            </h2>
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedOrder?.id === order.id ? 'border-black bg-gray-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold">{order.price} Kč</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{order.pickup_address}</p>
                  <p className="text-sm">→ {order.delivery_address}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dokončiť doručenie */}
        {selectedOrder && (
          <button
            onClick={completeDelivery}
            className="w-full py-4 bg-green-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" /> Doručenie dokončené
          </button>
        )}

        {/* Prázdny stav */}
        {offers.length === 0 && orders.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <Navigation className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Čakám na objednávky...</p>
            <p className="text-sm text-gray-400 mt-2">Nové objednávky sa zobrazia automaticky</p>
          </div>
        )}
      </div>
    </div>
  )
}
