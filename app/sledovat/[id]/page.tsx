'use client'
import { useState, useEffect } from 'react'
import { MapPin, Package, RefreshCw } from 'lucide-react'
import dynamic from 'next/dynamic'

const Map = dynamic(() => import('./Map'), { ssr: false })

export default function TrackingPage({ params }: { params: { id: string } }) {
  const [location, setLocation] = useState<{latitude: number, longitude: number} | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string>('')

  const fetchLocation = async () => {
    try {
      const res = await fetch(`/api/location?order_id=${params.id}`)
      const data = await res.json()
      if (data.location) {
        setLocation(data.location)
        setLastUpdate(new Date().toLocaleTimeString())
      }
    } catch (err) {
      console.error('Error fetching location:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLocation()
    const interval = setInterval(fetchLocation, 5000)
    return () => clearInterval(interval)
  }, [params.id])

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-black text-white p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Package className="w-6 h-6" />
          <div>
            <h1 className="font-bold">VASTOR Sledovanie</h1>
            <p className="text-sm text-gray-400">Objednavka: {params.id.slice(0,8)}...</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {loading ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Nacitavam polohu kuriera...</p>
          </div>
        ) : location ? (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium">Kurier je na ceste</p>
                  <p className="text-sm text-gray-500">Posledna aktualizacia: {lastUpdate}</p>
                </div>
              </div>
              <button onClick={fetchLocation} className="p-2 hover:bg-gray-100 rounded-full">
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden" style={{height: '400px'}}>
              <Map lat={location.latitude} lng={location.longitude} />
            </div>

            <div className="bg-white rounded-2xl p-4">
              <p className="text-sm text-gray-500">Suradnice</p>
              <p className="font-mono">{location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Kurier este nezacal zdielat polohu</p>
          </div>
        )}
      </div>
    </div>
  )
}
