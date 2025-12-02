'use client'
import { useState, useEffect } from 'react'
import { Package, Users, Lock, RefreshCw, Trash2 } from 'lucide-react'

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState('orders')
  const [orders, setOrders] = useState<any[]>([])
  const [couriers, setCouriers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handleLogin = () => {
    if (password === 'vastor2024') setIsLoggedIn(true)
  }

  const fetchData = async () => {
    setLoading(true)
    const [ordersRes, couriersRes] = await Promise.all([
      fetch('/api/orders'),
      fetch('/api/couriers')
    ])
    const ordersData = await ordersRes.json()
    const couriersData = await couriersRes.json()
    setOrders(ordersData.orders || [])
    setCouriers(couriersData.couriers || [])
    setLoading(false)
  }

  useEffect(() => { if (isLoggedIn) fetchData() }, [isLoggedIn])

  const assignCourier = async (orderId: string, courierId: string) => {
    const res = await fetch('/api/assign-courier', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderId, courier_id: courierId })
    })
    if (res.ok) fetchData()
  }

  const deleteOrder = async (orderId: string) => {
    if (!confirm('Naozaj chces zmazat tuto objednavku?')) return
    
    const res = await fetch('/api/delete-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderId })
    })
    if (res.ok) fetchData()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'assigned': return 'bg-blue-100 text-blue-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCourierStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800'
      case 'busy': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-sm w-full">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6"><Lock className="w-8 h-8 text-white" /></div>
          <h1 className="text-2xl font-bold text-center mb-6">Admin Panel</h1>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Heslo" className="w-full px-4 py-3 bg-gray-100 rounded-xl mb-4" onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
          <button onClick={handleLogin} className="w-full py-3 bg-black text-white rounded-xl font-semibold">Prihlasit</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Obnovit
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <button onClick={() => setActiveTab('orders')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium ${activeTab === 'orders' ? 'bg-black text-white' : 'bg-white'}`}>
            <Package className="w-5 h-5" /> Objednavky ({orders.length})
          </button>
          <button onClick={() => setActiveTab('couriers')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium ${activeTab === 'couriers' ? 'bg-black text-white' : 'bg-white'}`}>
            <Users className="w-5 h-5" /> Kurieri ({couriers.length})
          </button>
        </div>

        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Zakaznik</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Vyzdvihnutie</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Dorucenie</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Cena</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Kurier</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Akcie</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t">
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium">{order.customer_name}</div>
                      <div className="text-gray-500 text-xs">{order.customer_phone}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{order.pickup_address?.substring(0, 25)}...</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{order.delivery_address?.substring(0, 25)}...</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>{order.status}</span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">{order.price} Kc</td>
                    <td className="px-4 py-3 text-sm">
                      {order.status === 'delivered' ? (
                        <span className="text-green-600 text-xs">Dorucene</span>
                      ) : (
                        <select
                          value={order.courier_id || ''}
                          onChange={(e) => assignCourier(order.id, e.target.value)}
                          className="px-2 py-1 bg-gray-100 rounded text-sm"
                        >
                          <option value="">-- Vyber --</option>
                          {couriers.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.first_name} ({c.status})
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button 
                        onClick={() => deleteOrder(order.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Zmazat objednavku"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && <p className="p-6 text-center text-gray-500">Ziadne objednavky</p>}
          </div>
        )}

        {activeTab === 'couriers' && (
          <div className="bg-white rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium">Meno</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Telefon</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Vozidlo</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Hodnotenie</th>
                </tr>
              </thead>
              <tbody>
                {couriers.map((courier) => (
                  <tr key={courier.id} className="border-t">
                    <td className="px-6 py-4 text-sm font-medium">{courier.first_name} {courier.last_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{courier.email}</td>
                    <td className="px-6 py-4 text-sm">{courier.phone}</td>
                    <td className="px-6 py-4 text-sm">{courier.vehicle_type}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCourierStatusColor(courier.status)}`}>{courier.status}</span>
                    </td>
                    <td className="px-6 py-4 text-sm">{courier.rating} ⭐</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {couriers.length === 0 && <p className="p-6 text-center text-gray-500">Ziadni kurieri</p>}
          </div>
        )}
      </div>
    </div>
  )
}
