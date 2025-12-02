'use client'
import { useState, useEffect } from 'react'
import { DollarSign, Package, Star, TrendingUp, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default function CourierDashboard() {
  const [courier, setCourier] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [stats, setStats] = useState({ totalEarnings: 0, totalDeliveries: 0, averageRating: 5, thisWeekEarnings: 0, thisMonthEarnings: 0 })
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedCourier = localStorage.getItem('courier')
    if (savedCourier) {
      const c = JSON.parse(savedCourier)
      setCourier(c)
      fetchDashboardData(c.id)
    } else {
      window.location.href = '/kuryr'
    }
  }, [])

  const fetchDashboardData = async (courierId: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/courier-dashboard?courier_id=${courierId}&month=${selectedMonth.toISOString()}`)
      const data = await res.json()
      setOrders(data.orders || [])
      setStats(data.stats || stats)
    } catch (err) { console.error('Failed to fetch dashboard:', err) }
    setIsLoading(false)
  }

  const changeMonth = (delta: number) => {
    const newDate = new Date(selectedMonth)
    newDate.setMonth(newDate.getMonth() + delta)
    setSelectedMonth(newDate)
    if (courier) fetchDashboardData(courier.id)
  }

  const formatDate = (date: string) => new Date(date).toLocaleDateString('cs-CZ', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const monthName = selectedMonth.toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' })

  if (!courier) return null

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-black text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Link href="/kuryr" className="text-gray-400 hover:text-white">← Spat</Link>
            <h1 className="text-xl font-bold">Dashboard</h1>
            <div></div>
          </div>
          <p className="text-gray-400">Vitaj, {courier.first_name}!</p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-gray-500 mb-2"><DollarSign className="w-4 h-4" /><span className="text-xs">Tento mesiac</span></div>
            <p className="text-2xl font-bold">{stats.thisMonthEarnings.toFixed(0)} Kč</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-gray-500 mb-2"><TrendingUp className="w-4 h-4" /><span className="text-xs">Tento týždeň</span></div>
            <p className="text-2xl font-bold">{stats.thisWeekEarnings.toFixed(0)} Kč</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-gray-500 mb-2"><Package className="w-4 h-4" /><span className="text-xs">Doručení celkom</span></div>
            <p className="text-2xl font-bold">{stats.totalDeliveries}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-gray-500 mb-2"><Star className="w-4 h-4" /><span className="text-xs">Hodnotenie</span></div>
            <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)} ⭐</p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <p className="text-green-100 mb-1">Celkové zárobky</p>
          <p className="text-4xl font-bold">{stats.totalEarnings.toFixed(0)} Kč</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft className="w-5 h-5" /></button>
            <div className="flex items-center gap-2"><Calendar className="w-5 h-5 text-gray-500" /><span className="font-medium capitalize">{monthName}</span></div>
            <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 rounded-full"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b"><h2 className="font-bold">História doručení</h2></div>
          {isLoading ? (<div className="p-8 text-center text-gray-500">Načítavam...</div>
          ) : orders.length === 0 ? (<div className="p-8 text-center text-gray-500">Žiadne doručenia v tomto mesiaci</div>
          ) : (<div className="divide-y">{orders.map((order) => (
            <div key={order.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">Doručené</span>
                    <span className="text-xs text-gray-500">{formatDate(order.completed_at || order.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{order.pickup_address}</p>
                  <p className="text-sm text-gray-600 truncate">→ {order.delivery_address}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">+{order.courier_earnings || Math.round(order.price * 0.7)} Kč</p>
                </div>
              </div>
            </div>
          ))}</div>)}
        </div>
      </div>
    </div>
  )
}
