'use client'
import { useState } from 'react'
import { MapPin, Navigation, Play } from 'lucide-react'

export default function CourierPanel() {
  const [orderId, setOrderId] = useState('')
  const [courierId, setCourierId] = useState('')
  const [isTracking, setIsTracking] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null)
  const [status, setStatus] = useState('')

  const startTracking = () => {
    if (!orderId || !courierId) { setStatus('Zadaj Order ID a Courier ID'); return }
    if (!navigator.geolocation) { setStatus('Geolokacia nie je podporovana'); return }
    setIsTracking(true)
    setStatus('Sledovanie aktivne...')
    navigator.geolocation.watchPosition(async (position) => {
      const { latitude, longitude } = position.coords
      setCurrentLocation({ lat: latitude, lng: longitude })
      try {
        await fetch('/api/location', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ courier_id: courierId, order_id: orderId, latitude, longitude }) })
        setStatus('Aktualizovane: ' + new Date().toLocaleTimeString())
      } catch (err) { setStatus('Chyba pri odosielani') }
    }, (error) => { setStatus('Chyba GPS'); setIsTracking(false) }, { enableHighAccuracy: true })
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-md mx-auto bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center"><Navigation className="w-6 h-6 text-white" /></div>
          <div><h1 className="text-xl font-bold">Kuryr Panel</h1><p className="text-gray-500 text-sm">Zdielanie polohy</p></div>
        </div>
        <div className="space-y-4 mb-6">
          <input type="text" value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="Order ID" className="w-full px-4 py-3 bg-gray-100 rounded-xl" disabled={isTracking} />
          <input type="text" value={courierId} onChange={(e) => setCourierId(e.target.value)} placeholder="Courier ID" className="w-full px-4 py-3 bg-gray-100 rounded-xl" disabled={isTracking} />
        </div>
        {currentLocation && <div className="bg-gray-100 rounded-xl p-4 mb-4"><MapPin className="w-4 h-4 inline" /> Lat: {currentLocation.lat.toFixed(6)}, Lng: {currentLocation.lng.toFixed(6)}</div>}
        {status && <p className="text-center text-sm mb-4">{status}</p>}
        <button onClick={startTracking} className="w-full py-4 bg-black text-white rounded-xl font-semibold flex items-center justify-center gap-2"><Play className="w-5 h-5" /> Spustit sledovanie</button>
      </div>
    </div>
  )
}
