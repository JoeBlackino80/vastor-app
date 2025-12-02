'use client'
import { useState } from 'react'
import { Package, Search, MapPin, Clock, CheckCircle, Truck, Eye } from 'lucide-react'
import Link from 'next/link'

export default function MyOrdersPage() {
  const [email, setEmail] = useState('')
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const searchOrders = async () => {
    if (!email) return
    setIsLoading(true)
    try {
      const res = await fetch('/api/customer-orders?email=' + encodeURIComponent(email))
      const data = await res.json()
      setOrders(data.orders || [])
      setSearched(true)
    } catch (err) { console.error(err) }
    setIsLoading(false)
  }

  const getStatusIcon = (status: string) => {
    if (status === 'delivered') return <CheckCircle className="w-5 h-5 text-green-500" />
    if (status === 'assigned') return <Truck className="w-5 h-5 text-blue-500" />
    return <Clock className="w-5 h-5 text-yellow-500" />
  }

  const getStatusText = (status: string) => {
    if (status === 'delivered') return 'Dorucene'
    if (status === 'assigned') return 'Kurier na ceste'
    return 'Caka na kuriera'
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-black text-white p-6">
        <div className="max-w-2xl mx-auto">
          <Link href="/" className="text-gray-400 hover:text-white text-sm">← Spat</Link>
          <h1 className="text-2xl font-bold mt-2">Moje objednavky</h1>
        </div>
      </div>
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Search className="w-5 h-5 text-gray-400" />
            <h2 className="font-bold">Najdi svoje objednavky</h2>
          </div>
          <div className="flex gap-3">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Zadaj svoj email" className="flex-1 px-4 py-3 bg-gray-100 rounded-xl" onKeyPress={(e) => e.key === 'Enter' && searchOrders()} />
            <button onClick={searchOrders} disabled={isLoading} className="px-6 py-3 bg-black text-white rounded-xl font-semibold disabled:opacity-50">{isLoading ? '...' : 'Hladat'}</button>
          </div>
        </div>
        {searched && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Ziadne objednavky pre tento email</p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(order.status)}
                      <span className="text-sm font-medium">{getStatusText(order.status)}</span>
                    </div>
                    <p className="font-bold">{order.price} Kc</p>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <p className="text-sm">{order.pickup_address}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-green-500 mt-0.5" />
                      <p className="text-sm">{order.delivery_address}</p>
                    </div>
                  </div>
                  {order.status === 'assigned' && (
                    <Link href={'/sledovat/' + order.id} className="flex items-center gap-1 text-blue-600 text-sm font-medium">
                      <Eye className="w-4 h-4" /> Sledovat kuriera
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
