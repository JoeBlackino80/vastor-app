'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { MapPin, RefreshCw, Navigation } from 'lucide-react'
import { Loader } from '@googlemaps/js-api-loader'

export default function TrackingPage() {
  const params = useParams()
  const orderId = params.id as string
  const [location, setLocation] = useState<any>(null)
  const [order, setOrder] = useState<any>(null)
  const [lastUpdate, setLastUpdate] = useState('')
  const [marker, setMarker] = useState<google.maps.Marker | null>(null)

  const fetchLocation = useCallback(async () => {
    const res = await fetch('/api/location?order_id=' + orderId)
    const data = await res.json()
    if (data.location) {
      setLocation(data.location)
      setLastUpdate(new Date(data.location.updated_at).toLocaleTimeString())
      if (marker) marker.setPosition({ lat: data.location.latitude, lng: data.location.longitude })
    }
  }, [orderId, marker])

  useEffect(() => {
    const fetchOrder = async () => {
      const res = await fetch('/api/orders')
      const data = await res.json()
      setOrder(data.orders?.find((o: any) => o.id === orderId))
    }
    fetchOrder()
    fetchLocation()
    const interval = setInterval(fetchLocation, 5000)
    return () => clearInterval(interval)
  }, [fetchLocation, orderId])

  useEffect(() => {
    if (!location) return
    const loader = new Loader({ apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '', version: 'weekly' })
    loader.load().then(() => {
      const mapDiv = document.getElementById('map')
      if (!mapDiv) return
      const map = new google.maps.Map(mapDiv, { center: { lat: location.latitude, lng: location.longitude }, zoom: 15, disableDefaultUI: true, zoomControl: true })
      const m = new google.maps.Marker({ position: { lat: location.latitude, lng: location.longitude }, map, icon: { path: google.maps.SymbolPath.CIRCLE, scale: 12, fillColor: '#000', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 3 } })
      setMarker(m)
      if (order?.delivery_address) {
        new google.maps.DirectionsService().route({ origin: { lat: location.latitude, lng: location.longitude }, destination: order.delivery_address, travelMode: google.maps.TravelMode.DRIVING }, (result, status) => {
          if (status === 'OK' && result) new google.maps.DirectionsRenderer({ map, suppressMarkers: true, polylineOptions: { strokeColor: '#000', strokeWeight: 4 } }).setDirections(result)
        })
      }
    })
  }, [location?.latitude, order?.delivery_address])

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-black text-white p-4"><div className="flex items-center gap-3"><Navigation className="w-6 h-6" /><div><h1 className="font-bold">Sledovanie zasielky</h1><p className="text-xs text-gray-400">ID: {orderId.slice(0,8)}...</p></div></div></div>
      <div className="p-4 space-y-4">
        {location ? (<>
          <div className="bg-white rounded-2xl p-4 shadow-sm"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center"><MapPin className="w-5 h-5 text-green-600" /></div><div><p className="font-medium">Kurier je na ceste</p><p className="text-sm text-gray-500">Aktualizovane: {lastUpdate}</p></div></div><button onClick={fetchLocation} className="p-2 hover:bg-gray-100 rounded-full"><RefreshCw className="w-5 h-5" /></button></div></div>
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm" style={{height:'400px'}}><div id="map" style={{width:'100%',height:'100%'}} /></div>
          {order && <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3"><div className="flex items-start gap-3"><div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5" /><div><p className="text-xs text-gray-500">VYZDVIHNUTIE</p><p className="text-sm font-medium">{order.pickup_address}</p></div></div><div className="flex items-start gap-3"><div className="w-3 h-3 bg-green-500 rounded-full mt-1.5" /><div><p className="text-xs text-gray-500">DORUCENIE</p><p className="text-sm font-medium">{order.delivery_address}</p></div></div></div>}
        </>) : (<div className="bg-white rounded-2xl p-8 text-center shadow-sm"><MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">Kurier este nezacal zdielat polohu</p></div>)}
      </div>
    </div>
  )
}
