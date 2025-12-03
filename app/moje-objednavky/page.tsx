'use client'
import { useState } from 'react'
import Link from 'next/link'
import BackButton from '@/components/BackButton'
import { Package, MapPin, Eye, Search } from 'lucide-react'

export default function MyOrdersPage() {
  const [email, setEmail] = useState('')
  const [orders, setOrders] = useState<any[]>([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)

  const searchOrders = async () => {
    if (!email) return
    setLoading(true)
    const res = await fetch('/api/customer-orders?email=' + email)
    const data = await res.json()
    setOrders(data.orders || [])
    setSearched(true)
    setLoading(false)
  }

  const getStatusColor = (status: string) => {
    if (status === 'delivered') return 'bg-green-100 text-green-800'
    if (status === 'assigned') return 'bg-blue-100 text-blue-800'
    return 'bg-yellow-100 text-yellow-800'
  }

  const getStatusText = (status: string) => {
    if (status === 'delivered') return 'Doručené'
    if (status === 'assigned') return 'Na ceste'
    return 'Čaká na kuriéra'
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white p-4 flex items-center gap-4 border-b">
        <BackButton />
        <Link href="/" className="text-2xl font-bold">VASTOR</Link>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Moje objednávky</h1>

        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <p className="text-gray-600 mb-4">Zadaj email pre zobrazenie objednávok:</p>
          <div className="flex gap-2">
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="vas@email.sk" 
              className="flex-1 px-4 py-3 bg-gray-100 rounded-xl"
              onKeyDown={(e) => e.key === 'Enter' && searchOrders()}
            />
            <button onClick={searchOrders} disabled={loading} className="px-6 py-3 bg-black text-white rounded-xl font-medium disabled:opacity-50">
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>

        {searched && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Žiadne objednávky pre tento email</p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold">{order.customer_name}</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <p className="font-bold">{order.price} Kč</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <p>{order.pickup_address}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-green-500 mt-0.5" />
                      <p>{order.delivery_address}</p>
                    </div>
                  </div>
                  {order.status === 'assigned' && (
                    <Link href={'/sledovat/' + order.id} className="flex items-center gap-1 text-blue-600 text-sm font-medium mt-3">
                      <Eye className="w-4 h-4" /> Sledovať kuriéra
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
