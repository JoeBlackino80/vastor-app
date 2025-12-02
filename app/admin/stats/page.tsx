'use client'
import { useState, useEffect } from 'react'
import { Package, Users, DollarSign, TrendingUp, Star, Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AdminStats() {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => { fetchStats() }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin-stats')
      const data = await res.json()
      setStats(data)
    } catch (err) { console.error('Failed to fetch stats:', err) }
    setIsLoading(false)
  }

  if (isLoading) return <div className="min-h-screen bg-gray-100 flex items-center justify-center"><p>Načítavam...</p></div>
  if (!stats) return null

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-black text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <Link href="/admin" className="text-gray-400 hover:text-white"><ArrowLeft className="w-5 h-5" /></Link>
            <h1 className="text-2xl font-bold">Štatistiky</h1>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><Package className="w-5 h-5 text-blue-600" /></div><span className="text-gray-500 text-sm">Celkom objednávok</span></div>
            <p className="text-3xl font-bold">{stats.totalOrders}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center"><DollarSign className="w-5 h-5 text-green-600" /></div><span className="text-gray-500 text-sm">Celkové tržby</span></div>
            <p className="text-3xl font-bold">{stats.totalRevenue?.toLocaleString() || 0} Kč</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center"><Users className="w-5 h-5 text-purple-600" /></div><span className="text-gray-500 text-sm">Kuriérov</span></div>
            <p className="text-3xl font-bold">{stats.activeCouriers}/{stats.totalCouriers}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center"><Star className="w-5 h-5 text-yellow-600" /></div><span className="text-gray-500 text-sm">Priemerné hodnotenie</span></div>
            <p className="text-3xl font-bold">{stats.averageRating?.toFixed(1) || 5} ⭐</p>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-2 mb-2"><Clock className="w-5 h-5 opacity-80" /><span className="opacity-80">Dnes</span></div>
            <p className="text-4xl font-bold">{stats.todayOrders}</p>
            <p className="text-sm opacity-80 mt-1">objednávok</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-5 h-5 opacity-80" /><span className="opacity-80">Tento týždeň</span></div>
            <p className="text-4xl font-bold">{stats.thisWeekOrders}</p>
            <p className="text-sm opacity-80 mt-1">objednávok</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-5 h-5 opacity-80" /><span className="opacity-80">Tento mesiac</span></div>
            <p className="text-4xl font-bold">{stats.thisMonthOrders}</p>
            <p className="text-sm opacity-80 mt-1">objednávok</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold mb-4">Top kuriéri</h2>
          {stats.topCouriers?.length === 0 ? (<p className="text-gray-500 text-center py-4">Žiadni kuriéri</p>) : (
            <div className="space-y-3">{stats.topCouriers?.map((courier: any, index: number) => (
              <div key={courier.id} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'}`}>{index + 1}</div>
                <div className="flex-1"><p className="font-medium">{courier.name}</p><p className="text-xs text-gray-500">{courier.deliveries} doručení</p></div>
                <p className="font-medium">{courier.rating?.toFixed(1)} ⭐</p>
              </div>
            ))}</div>
          )}
        </div>
      </div>
    </div>
  )
}
