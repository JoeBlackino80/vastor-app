'use client'
import { useState, useEffect } from 'react'
import { Package, Users, Trash2, BarChart3 } from 'lucide-react'
import Link from 'next/link'

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState('orders')
  const [orders, setOrders] = useState<any[]>([])
  const [couriers, setCouriers] = useState<any[]>([])

  useEffect(() => {
    if (isAuthenticated) {
      fetchData()
    }
  }, [isAuthenticated])

  const fetchData = async () => {
    const [ordersRes, couriersRes] = await Promise.all([
      fetch('/api/orders'),
      fetch('/api/couriers')
    ])
    const ordersData = await ordersRes.json()
    const couriersData = await couriersRes.json()
    setOrders(ordersData.orders || [])
    setCouriers(couriersData.couriers || [])
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'vastor2024') {
      setIsAuthenticated(true)
    }
  }

  const assignCourier = async (orderId: string, courierId: string) => {
    await fetch('/api/assign-courier', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderId, courier_id: courierId })
    })
    fetchData()
  }

  const deleteOrder = async (orderId: string) => {
    if (!confirm('Naozaj chceš zmazať túto objednávku?')) return
    await fetch('/api/delete-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderId })
    })
    fetchData()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'assigned': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="bg-white rounded-2xl p-8 w-full max-w-md shadow-lg">
          <h1 className="text-2xl font-bold mb-6">VASTOR Admin</h1>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Heslo" className="w-full px-4 py-3 bg-gray-100 rounded-xl mb-4" />
          <button type="submit" className="w-full py-3 bg-black text-white rounded-xl font-semibold">Prihlásiť</button>
        </form>
      </div>
    )
  }

  const availableCouriers = couriers.filter(c => c.status === 'available' || c.status === 'busy')

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">VASTOR Admin</h1>
          <Link href="/admin/stats" className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm">
            <BarChart3 className="w-5 h-5" /> Štatistiky
          </Link>
        </div>

        <div className="flex gap-2 mb-6">
          <button onClick={() => setActiveTab('orders')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium ${activeTab === 'orders' ? 'bg-black text-white' : 'bg-white'}`}>
            <Package className="w-5 h-5" /> Objednávky ({orders.length})
          </button>
          <button onClick={() => setActiveTab('couriers')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium ${activeTab === 'couriers' ? 'bg-black text-white' : 'bg-white'}`}>
            <Users className="w-5 h-5" /> Kuriéri ({couriers.length})
          </button>
        </div>

        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Zákazník</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Odkiaľ</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Kam</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Cena</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Kuriér</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Akcie</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t">
                    <td className="px-4 py-3 text-sm font-medium">{order.customer_name}</td>
                    <td className="px-4 py-3 text-sm">{order.pickup_address}</td>
                    <td className="px-4 py-3 text-sm">{order.delivery_address}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>{order.status}</span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">{order.price} Kč</td>
                    <td className="px-4 py-3 text-sm">
                      {order.courier_id ? (
                        couriers.find(c => c.id === order.courier_id)?.first_name || 'Priradený'
                      ) : (
                        <select 
                          onChange={(e) => e.target.value && assignCourier(order.id, e.target.value)}
                          className="px-2 py-1 border rounded text-sm"
                          defaultValue=""
                        >
                          <option value="">Priradiť...</option>
                          {availableCouriers.map(c => (
                            <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => deleteOrder(order.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && <p className="p-6 text-center text-gray-500">Žiadne objednávky</p>}
          </div>
        )}

        {activeTab === 'couriers' && (
          <div className="bg-white rounded-xl overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Meno</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Telefón</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Vozidlo</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Hodnotenie</th>
                </tr>
              </thead>
              <tbody>
                {couriers.map((courier) => (
                  <tr key={courier.id} className="border-t">
                    <td className="px-4 py-3 text-sm font-medium">{courier.first_name} {courier.last_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{courier.email}</td>
                    <td className="px-4 py-3 text-sm">{courier.phone}</td>
                    <td className="px-4 py-3 text-sm">{courier.vehicle_type}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${courier.status === 'available' ? 'bg-green-100 text-green-800' : courier.status === 'busy' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {courier.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{courier.rating} ⭐</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {couriers.length === 0 && <p className="p-6 text-center text-gray-500">Žiadni kuriéri</p>}
          </div>
        )}
      </div>
    </div>
  )
}
