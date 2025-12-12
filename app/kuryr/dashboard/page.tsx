'use client'
import { useState, useEffect } from 'react'
import { DollarSign, Package, Star, TrendingUp, Calendar, ChevronLeft, ChevronRight, Power, MapPin, Clock, LogOut, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CourierDashboard() {
  const router = useRouter()
  const [courier, setCourier] = useState<any>(null)
  const [isOnline, setIsOnline] = useState(false)
  const [orders, setOrders] = useState<any[]>([])
  const [availableOrders, setAvailableOrders] = useState<any[]>([])
  const [stats, setStats] = useState({ totalEarnings: 0, totalDeliveries: 0, averageRating: 5, thisWeekEarnings: 0, thisMonthEarnings: 0 })
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [isTogglingStatus, setIsTogglingStatus] = useState(false)

  useEffect(() => {
    const savedCourier = localStorage.getItem('courier')
    if (savedCourier) {
      const c = JSON.parse(savedCourier)
      setCourier(c)
      setIsOnline(c.is_online || false)
      fetchDashboardData(c.id)
    } else {
      router.push('/kuryr')
    }
  }, [router])

  const fetchDashboardData = async (courierId: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/courier-dashboard?courier_id=${courierId}&month=${selectedMonth.toISOString()}`)
      const data = await res.json()
      setOrders(data.orders || [])
      setStats(data.stats || stats)
      setAvailableOrders(data.availableOrders || [])
    } catch (err) { 
      console.error('Failed to fetch dashboard:', err) 
    }
    setIsLoading(false)
  }

  const toggleOnlineStatus = async () => {
    if (!courier) return
    setIsTogglingStatus(true)

    try {
      const newStatus = !isOnline
      const res = await fetch('/api/courier-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courier_id: courier.id, is_online: newStatus })
      })

      if (res.ok) {
        setIsOnline(newStatus)
        // Update localStorage
        const updated = { ...courier, is_online: newStatus }
        localStorage.setItem('courier', JSON.stringify(updated))
        setCourier(updated)
      }
    } catch (err) {
      console.error('Failed to toggle status:', err)
    }
    setIsTogglingStatus(false)
  }

  const changeMonth = (delta: number) => {
    const newDate = new Date(selectedMonth)
    newDate.setMonth(newDate.getMonth() + delta)
    setSelectedMonth(newDate)
    if (courier) fetchDashboardData(courier.id)
  }

  const handleLogout = () => {
    localStorage.removeItem('courier')
    router.push('/kuryr')
  }

  const formatDate = (date: string) => new Date(date).toLocaleDateString('sk-SK', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const monthName = selectedMonth.toLocaleDateString('sk-SK', { month: 'long', year: 'numeric' })

  if (!courier) return null

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white">{courier.first_name} {courier.last_name}</p>
                <p className="text-xs text-gray-400">{courier.vehicle === 'bike' ? '🚲 Bicykel' : courier.vehicle === 'motorcycle' ? '🛵 Skúter' : '🚗 Auto'}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-white">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Online/Offline Toggle */}
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={toggleOnlineStatus}
            disabled={isTogglingStatus}
            className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
              isOnline 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-700 text-gray-300'
            } ${isTogglingStatus ? 'opacity-50' : ''}`}
          >
            <Power className={`w-6 h-6 ${isOnline ? 'animate-pulse' : ''}`} />
            {isTogglingStatus ? 'Prepínam...' : isOnline ? 'ONLINE - Prijímam objednávky' : 'OFFLINE - Klikni pre štart'}
          </button>
          {isOnline && (
            <p className="text-center text-green-400 text-sm mt-2">
              🟢 Dostávaš nové objednávky
            </p>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Available Orders (when online) */}
        {isOnline && availableOrders.length > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4">
            <h2 className="font-bold text-yellow-400 mb-3 flex items-center gap-2">
              <Package className="w-5 h-5" /> Dostupné objednávky ({availableOrders.length})
            </h2>
            <div className="space-y-3">
              {availableOrders.slice(0, 3).map(order => (
                <div key={order.id} className="bg-gray-800 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-white font-medium">{order.pickup_address}</p>
                      <p className="text-gray-400 text-sm">→ {order.delivery_address}</p>
                    </div>
                    <span className="text-green-400 font-bold">{(order.price * 0.7).toFixed(2)} €</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 py-2 bg-green-500 text-white rounded-lg font-semibold text-sm">
                      Prijať
                    </button>
                    <button className="py-2 px-4 bg-gray-700 text-gray-300 rounded-lg text-sm">
                      Odmietnuť
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs">Tento mesiac</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.thisMonthEarnings.toFixed(0)} €</p>
          </div>
          <div className="bg-gray-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs">Tento týždeň</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.thisWeekEarnings.toFixed(0)} €</p>
          </div>
          <div className="bg-gray-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Package className="w-4 h-4" />
              <span className="text-xs">Doručení celkom</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalDeliveries}</p>
          </div>
          <div className="bg-gray-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Star className="w-4 h-4" />
              <span className="text-xs">Hodnotenie</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.averageRating.toFixed(1)} ⭐</p>
          </div>
        </div>

        {/* Total Earnings */}
        <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-6 text-white">
          <p className="text-green-100 mb-1">Celkové zárobky</p>
          <p className="text-4xl font-bold">{stats.totalEarnings.toFixed(0)} €</p>
        </div>

        {/* Month Selector */}
        <div className="bg-gray-800 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-700 rounded-full text-gray-400">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-white">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="font-medium capitalize">{monthName}</span>
            </div>
            <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-700 rounded-full text-gray-400">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Delivery History */}
        <div className="bg-gray-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <h2 className="font-bold text-white">História doručení</h2>
          </div>
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="animate-spin w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Žiadne doručenia v tomto mesiaci</div>
          ) : (
            <div className="divide-y divide-gray-700">
              {orders.map((order) => (
                <div key={order.id} className="p-4 hover:bg-gray-700/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400">Doručené</span>
                        <span className="text-xs text-gray-500">{formatDate(order.completed_at || order.created_at)}</span>
                      </div>
                      <p className="text-sm text-gray-400 truncate">{order.pickup_address}</p>
                      <p className="text-sm text-gray-400 truncate">→ {order.delivery_address}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-400">+{order.courier_earnings || Math.round(order.price * 0.7)} €</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
