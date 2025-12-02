'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { Package, Users, Clock, TrendingUp, RefreshCw } from 'lucide-react'

interface Order {
  id: string
  created_at: string
  customer_name: string
  customer_phone: string
  pickup_address: string
  delivery_address: string
  service_type: string
  status: string
  price: number
}

interface Courier {
  id: string
  created_at: string
  first_name: string
  last_name: string
  email: string
  phone: string
  vehicle_type: string
  status: string
}

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [couriers, setCouriers] = useState<Courier[]>([])
  const [activeTab, setActiveTab] = useState<'orders' | 'couriers'>('orders')
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [ordersRes, couriersRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/couriers'),
      ])
      
      const ordersData = await ordersRes.json()
      const couriersData = await couriersRes.json()
      
      setOrders(ordersData.orders || [])
      setCouriers(couriersData.couriers || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const statusLabels: Record<string, string> = {
    pending: 'Čeká na přiřazení',
    assigned: 'Přiřazeno',
    picked_up: 'Vyzvednuto',
    in_transit: 'Na cestě',
    delivered: 'Doručeno',
    cancelled: 'Zrušeno',
    approved: 'Schváleno',
    rejected: 'Zamítnuto',
    active: 'Aktivní',
    inactive: 'Neaktivní',
  }

  const vehicleLabels: Record<string, string> = {
    bike: 'Kolo',
    scooter: 'Skútr',
    car: 'Auto',
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen pt-28 pb-20 bg-gray-100">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Admin Panel</h1>
              <p className="text-gray-600">Správa objednávek a kurýrů</p>
            </div>
            <button 
              onClick={fetchData}
              className="btn btn-secondary"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Obnovit
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border border-gray-200 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold">{orders.length}</div>
                  <div className="text-sm text-gray-500">Objednávky</div>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold">{couriers.length}</div>
                  <div className="text-sm text-gray-500">Kurýři</div>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold">
                    {orders.filter(o => o.status === 'pending').length}
                  </div>
                  <div className="text-sm text-gray-500">Čekající</div>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold">
                    {orders.reduce((sum, o) => sum + (o.price || 0), 0)} Kč
                  </div>
                  <div className="text-sm text-gray-500">Celkem</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'orders'
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Objednávky
            </button>
            <button
              onClick={() => setActiveTab('couriers')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'couriers'
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Kurýři
            </button>
          </div>

          {/* Content */}
          <div className="bg-white border border-gray-200">
            {activeTab === 'orders' && (
              <div className="overflow-x-auto">
                {orders.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    Zatím žádné objednávky
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left p-4 font-semibold text-sm">ID</th>
                        <th className="text-left p-4 font-semibold text-sm">Zákazník</th>
                        <th className="text-left p-4 font-semibold text-sm">Trasa</th>
                        <th className="text-left p-4 font-semibold text-sm">Služba</th>
                        <th className="text-left p-4 font-semibold text-sm">Status</th>
                        <th className="text-right p-4 font-semibold text-sm">Cena</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-4 font-mono text-sm">{order.id}</td>
                          <td className="p-4">
                            <div className="font-medium">{order.customer_name}</div>
                            <div className="text-sm text-gray-500">{order.customer_phone}</div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm">{order.pickup_address}</div>
                            <div className="text-sm text-gray-500">→ {order.delivery_address}</div>
                          </td>
                          <td className="p-4 capitalize">{order.service_type}</td>
                          <td className="p-4">
                            <span className="px-3 py-1 bg-gray-100 text-sm">
                              {statusLabels[order.status] || order.status}
                            </span>
                          </td>
                          <td className="p-4 text-right font-semibold">{order.price} Kč</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab === 'couriers' && (
              <div className="overflow-x-auto">
                {couriers.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    Zatím žádní registrovaní kurýři
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left p-4 font-semibold text-sm">ID</th>
                        <th className="text-left p-4 font-semibold text-sm">Jméno</th>
                        <th className="text-left p-4 font-semibold text-sm">Kontakt</th>
                        <th className="text-left p-4 font-semibold text-sm">Vozidlo</th>
                        <th className="text-left p-4 font-semibold text-sm">Status</th>
                        <th className="text-left p-4 font-semibold text-sm">Registrace</th>
                      </tr>
                    </thead>
                    <tbody>
                      {couriers.map(courier => (
                        <tr key={courier.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-4 font-mono text-sm">{courier.id}</td>
                          <td className="p-4 font-medium">
                            {courier.first_name} {courier.last_name}
                          </td>
                          <td className="p-4">
                            <div className="text-sm">{courier.email}</div>
                            <div className="text-sm text-gray-500">{courier.phone}</div>
                          </td>
                          <td className="p-4">{vehicleLabels[courier.vehicle_type]}</td>
                          <td className="p-4">
                            <span className={`px-3 py-1 text-sm ${
                              courier.status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800'
                                : courier.status === 'approved' || courier.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100'
                            }`}>
                              {statusLabels[courier.status] || courier.status}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-gray-500">
                            {new Date(courier.created_at).toLocaleDateString('cs-CZ')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
