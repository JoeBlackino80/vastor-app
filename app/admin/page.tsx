'use client'
import { useState, useEffect } from 'react'
import { Package, Users, Lock, Trash2, UserCheck, UserX, BarChart3 } from 'lucide-react'
import Link from 'next/link'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
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

  const handleLogin = () => {
    if (password === 'vastor2024') {
      setIsAuthenticated(true)
    } else {
      alert('Nesprávne heslo')
    }
  }

  const deleteOrder = async (id: string) => {
    if (!confirm('Naozaj chcete zmazať túto objednávku?')) return
    await fetch('/api/delete-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: id })
    })
    fetchData()
  }

  const assignCourier = async (orderId: string, courierId: string) => {
    await fetch('/api/assign-courier', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderId, courier_id: courierId })
    })
    fetchData()
  }

  const approveCourier = async (courierId: string, action: 'approve' | 'reject') => {
    await fetch('/api/approve-courier', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courier_id: courierId, action })
    })
    fetchData()
  }

  const getStatusColor = (status: string) => {
    if (status === 'delivered') return 'bg-green-100 text-green-700'
    if (status === 'assigned') return 'bg-blue-100 text-blue-700'
    return 'bg-yellow-100 text-yellow-700'
  }

  const getCourierStatusColor = (status: string) => {
    if (status === 'available') return 'bg-green-100 text-green-700'
    if (status === 'busy') return 'bg-red-100 text-red-700'
    if (status === 'pending') return 'bg-yellow-100 text-yellow-700'
    return 'bg-gray-100 text-gray-700'
  }

  const pendingCouriers = couriers.filter(c => c.status === 'pending')
  const approvedCouriers = couriers.filter(c => c.status !== 'pending' && c.status !== 'rejected')
  const availableCouriers = couriers.filter(c => c.status === 'available')

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md w-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold">Admin Panel</h1>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Heslo"
            className="w-full px-4 py-3 bg-gray-100 rounded-xl mb-4"
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
          />
          <button onClick={handleLogin} className="w-full py-4 bg-black text-white rounded-xl font-semibold">
            Prihlásiť
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-black text-white p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">VASTOR Admin</h1>
          <Link href="/admin/stats" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-colors">
            <BarChart3 className="w-5 h-5" />
            Štatistiky
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${activeTab === 'orders' ? 'bg-black text-white' : 'bg-white'}`}
          >
            <Package className="w-5 h-5" /> Objednávky ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('couriers')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${activeTab === 'couriers' ? 'bg-black text-white' : 'bg-white'}`}
          >
            <Users className="w-5 h-5" /> Kuriéri ({couriers.length})
            {pendingCouriers.length > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{pendingCouriers.length}</span>}
          </button>
        </div>

        {/* Orders */}
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
                    <td className="px-4 py-3 text-sm">{order.customer_name}</td>
                    <td className="px-4 py-3 text-sm truncate max-w-[150px]">{order.pickup_address}</td>
                    <td className="px-4 py-3 text-sm truncate max-w-[150px]">{order.delivery_address}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>{order.status}</span></td>
                    <td className="px-4 py-3 text-sm font-medium">{order.price} Kč</td>
                    <td className="px-4 py-3 text-sm">
                      {order.status === 'pending' ? (
                        <select onChange={(e) => assignCourier(order.id, e.target.value)} className="text-sm border rounded px-2 py-1">
                          <option value="">Priradiť...</option>
                          {availableCouriers.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                        </select>
                      ) : order.courier_id ? (
                        couriers.find(c => c.id === order.courier_id)?.first_name || '-'
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => deleteOrder(order.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && <p className="p-6 text-center text-gray-500">Žiadne objednávky</p>}
          </div>
        )}

        {/* Couriers */}
        {activeTab === 'couriers' && (
          <div className="space-y-6">
            {/* Pending Approval */}
            {pendingCouriers.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <h3 className="font-bold text-yellow-800 mb-4">Čakajú na schválenie ({pendingCouriers.length})</h3>
                <div className="space-y-3">
                  {pendingCouriers.map((courier) => (
                    <div key={courier.id} className="flex items-center justify-between bg-white rounded-xl p-4">
                      <div>
                        <p className="font-medium">{courier.first_name} {courier.last_name}</p>
                        <p className="text-sm text-gray-500">{courier.email} • {courier.phone}</p>
                        <p className="text-sm text-gray-500">{courier.vehicle_type}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => approveCourier(courier.id, 'approve')} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                          <UserCheck className="w-5 h-5" />
                        </button>
                        <button onClick={() => approveCourier(courier.id, 'reject')} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                          <UserX className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Approved Couriers */}
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
                    <th className="px-4 py-3 text-left text-sm font-medium">Doručenia</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedCouriers.map((courier) => (
                    <tr key={courier.id} className="border-t">
                      <td className="px-4 py-3 text-sm font-medium">{courier.first_name} {courier.last_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{courier.email}</td>
                      <td className="px-4 py-3 text-sm">{courier.phone}</td>
                      <td className="px-4 py-3 text-sm">{courier.vehicle_type}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs ${getCourierStatusColor(courier.status)}`}>{courier.status}</span></td>
                      <td className="px-4 py-3 text-sm">{courier.rating} ⭐</td>
                      <td className="px-4 py-3 text-sm">{courier.total_deliveries || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {approvedCouriers.length === 0 && <p className="p-6 text-center text-gray-500">Žiadni schválení kuriéri</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
