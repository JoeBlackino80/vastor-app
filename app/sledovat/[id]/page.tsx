'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { MapPin, RefreshCw, Navigation } from 'lucide-react'

export default function TrackingPage() {
  const params = useParams()
  const orderId = params.id as string
  const [location, setLocation] = useState<any>(null)
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState('')

  const fetchData = async () => {
    try {
      // Fetch location
      const locRes = await fetch('/api/location?order_id=' + orderId)
      const locData = await locRes.json()
      if (locData.location) {
        setLocation(locData.location)
        setLastUpdate(new Date(locData.location.updated_at).toLocaleTimeString())
      }

      // Fetch order details
      const orderRes = await fetch('/api/orders')
      const orderData = await orderRes.json()
      const foundOrder = orderData.orders?.find((o: any) => o.id === orderId)
      if (foundOrder) setOrder(foundOrder)
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [orderId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Načítavam...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-black text-white p-4">
        <div className="flex items-center gap-3">
          <Navigation className="w-6 h-6" />
          <div>
            <h1 className="font-bold">Sledovanie zásielky</h1>
            <p className="text-xs text-gray-400">ID: {orderId?.slice(0, 8)}...</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {order && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="font-bold mb-2">{order.customer_name}</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full mt-1" />
                <p>{order.pickup_address}</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full mt-1" />
                <p>{order.delivery_address}</p>
              </div>
            </div>
          </div>
        )}

        {location ? (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Kuriér je na ceste</p>
                  <p className="text-sm text-gray-500">Posledná aktualizácia: {lastUpdate}</p>
                </div>
              </div>
              <button onClick={fetchData} className="p-2 hover:bg-gray-100 rounded-full">
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden shadow-sm" style={{height: '400px'}}>
              <iframe
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.longitude-0.01},${location.latitude-0.01},${location.longitude+0.01},${location.latitude+0.01}&layer=mapnik&marker=${location.latitude},${location.longitude}`}
                style={{ width: '100%', height: '100%', border: 0 }}
                loading="lazy"
              />
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-sm text-gray-500">Súradnice</p>
              <p className="font-mono">{location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Kuriér ešte nezačal zdieľať polohu</p>
          </div>
        )}
      </div>
    </div>
  )
}
