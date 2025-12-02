'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import { Users, Package, Clock, DollarSign, RefreshCw } from 'lucide-react'

const ADMIN_PASSWORD = 'vastor2024'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [orders, setOrders] = useState<any[]>([])
  const [couriers, setCouriers] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('orders')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      setError('')
      localStorage.setItem('adminAuth', 'true')
    } else {
      setError('Nespravne heslo')
    }
  }

  useEffect(() => {
    if (localStorage.getItem('adminAuth') === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [ordersRes, couriersRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/couriers')
      ])
      const ordersData = await ordersRes.json()
      const couriersData = await couriersRes.json()
      setOrders(ordersData.orders || [])
      setCouriers(couriersData.couriers || [])
    } catch (err) {
      console.error('Error fetching data:', err)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchData()
    }
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold text-center mb-6">Admin pristup</h1>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <form onSubmit={handleLogin}>
            <input type="password" placeholder="Zadajte heslo" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border rounded-xl mb-4" />
            <button type="submit" className="w-full py-3 bg-black text-white rounded-xl font-semibold">Prihlasit</button>
          </form>
        </div>
      </div>
    )
  }

  const totalRevenue = orders.reduce((sum, order) => sum + (order.price || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <button onClick={fetchData} disabled={isLoading} className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg">
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Obnovit
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl"><div className="flex items-center gap-4"><Package className="w-8 h-8" /><div><p className="text-gray-500 text-sm">Objednavky</p><p className="text-2xl font-bold">{orders.length}</p></div></div></div>
            <div className="bg-white p-6 rounded-xl"><div className="flex items-center gap-4"><Users className="w-8 h-8" /><div><p className="text-gray-500 text-sm">Kurieri</p><p className="text-2xl font-bold">{couriers.length}</p></div></div></div>
            <div className="bg-white p-6 rounded-xl"><div className="flex items-center gap-4"><Clock className="w-8 h-8" /><div><p className="text-gray-500 text-sm">Cakajuce</p><p className="text-2xl font-bold">{orders.filter(o => o.status === 'pending').length}</p></div></div></div>
            <div className="bg-white p-6 rounded-xl"><div className="flex items-center gap-4"><DollarSign className="w-8 h-8" /><div><p className="text-gray-500 text-sm">Trzby</p><p className="text-2xl font-bold">{totalRevenue} Kc</p></div></div></div>
          </div>
          <div className="flex gap-4 mb-6">
            <button onClick={() => setActiveTab('orders')} className={`px-6 py-2 rounded-lg font-medium ${activeTab === 'orders' ? 'bg-black text-white' : 'bg-white'}`}>Objednavky</button>
            <button onClick={() => setActiveTab('couriers')} className={`px-6 py-2 rounded-lg font-medium ${activeTab === 'couriers' ? 'bg-black text-white' : 'bg-white'}`}>Kurieri</button>
          </div>
          {activeTab === 'orders' && (
            <div className="bg-white rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-sm font-medium">ID</th><th className="px-6 py-3 text-left text-sm font-medium">Zakaznik</th><th className="px-6 py-3 text-left text-sm font-medium">Sluzba</th><th className="px-6 py-3 text-left text-sm font-medium">Status</th><th className="px-6 py-3 text-left text-sm font-medium">Cena</th></tr></thead>
                <tbody>{orders.map((order) => (<tr key={order.id} className="border-t"><td className="px-6 py-4 text-sm">{order.id?.slice(0,8)}</td><td className="px-6 py-4 text-sm">{order.customer_name}</td><td className="px-6 py-4 text-sm">{order.service_type}</td><td className="px-6 py-4 text-sm"><span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">{order.status}</span></td><td className="px-6 py-4 text-sm font-medium">{order.price} Kc</td></tr>))}</tbody>
              </table>
              {orders.length === 0 && <p className="p-6 text-center text-gray-500">Ziadne objednavky</p>}
            </div>
          )}
          {activeTab === 'couriers' && (
            <div className="bg-white rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-sm font-medium">Meno</th><th className="px-6 py-3 text-left text-sm font-medium">Email</th><th className="px-6 py-3 text-left text-sm font-medium">Telefon</th><th className="px-6 py-3 text-left text-sm font-medium">Vozidlo</th><th className="px-6 py-3 text-left text-sm font-medium">Status</th></tr></thead>
                <tbody>{couriers.map((courier) => (<tr key={courier.id} className="border-t"><td className="px-6 py-4 text-sm">{courier.first_name} {courier.last_name}</td><td className="px-6 py-4 text-sm">{courier.email}</td><td className="px-6 py-4 text-sm">{courier.phone}</td><td className="px-6 py-4 text-sm">{courier.vehicle_type}</td><td className="px-6 py-4 text-sm"><span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">{courier.status}</span></td></tr>))}</tbody>
              </table>
              {couriers.length === 0 && <p className="p-6 text-center text-gray-500">Ziadni kurieri</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
