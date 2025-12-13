'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, Package, Users, Bike, CreditCard, Settings, LogOut, 
  TrendingUp, Clock, CheckCircle, AlertCircle, MapPin, Menu, X
} from 'lucide-react'

export default function AdminDashboard() {
  const router = useRouter()
  const [admin, setAdmin] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [pendingCouriers, setPendingCouriers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('admin')
    if (!saved) {
      router.push('/admin')
      return
    }
    setAdmin(JSON.parse(saved))
    fetchDashboardData()
  }, [router])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const res = await fetch('/api/admin/dashboard', {
        headers: { 'Authorization': 'Bearer ' + token }
      })
      if (res.ok) {
        const data = await res.json()
        setStats(data.stats)
        setRecentOrders(data.recentOrders || [])
        setPendingCouriers(data.pendingCouriers || [])
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err)
    }
    setIsLoading(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('admin')
    localStorage.removeItem('admin_token')
    router.push('/admin')
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Prehľad', href: '/admin/dashboard', active: true },
    { icon: Package, label: 'Objednávky', href: '/admin/dashboard/orders' },
    { icon: Bike, label: 'Kuriéri', href: '/admin/dashboard/couriers' },
    { icon: Users, label: 'Zákazníci', href: '/admin/dashboard/customers' },
    { icon: CreditCard, label: 'Financie', href: '/admin/dashboard/finance' },
    { icon: MapPin, label: 'Live mapa', href: '/admin/dashboard/map' },
    { icon: Settings, label: 'Nastavenia', href: '/admin/dashboard/settings' },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Načítavam...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      {/* Mobile menu button */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 text-white rounded-lg"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-800 transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">V</span>
            </div>
            <div>
              <h1 className="text-white font-bold">VORU Admin</h1>
              <p className="text-slate-400 text-xs">{admin?.email}</p>
            </div>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ' + (item.active ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:bg-slate-700 hover:text-white')}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white w-full rounded-xl hover:bg-slate-700 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Odhlásiť sa
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Prehľad</h1>
          <p className="text-slate-500">Vitaj späť, {admin?.name || admin?.email}</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-green-500 text-sm font-medium flex items-center gap-1">
                <TrendingUp className="w-4 h-4" /> +12%
              </span>
            </div>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">{stats?.todayOrders || 0}</p>
            <p className="text-slate-500 text-sm">Dnešné objednávky</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">{stats?.todayRevenue || 0} €</p>
            <p className="text-slate-500 text-sm">Dnešné tržby</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                <Bike className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">{stats?.onlineCouriers || 0}</p>
            <p className="text-slate-500 text-sm">Kuriéri online</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">{stats?.pendingOrders || 0}</p>
            <p className="text-slate-500 text-sm">Čaká na kuriéra</p>
          </div>
        </div>

        {/* Two columns */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent orders */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Posledné objednávky</h2>
              <Link href="/admin/dashboard/orders" className="text-amber-500 text-sm hover:underline">
                Všetky
              </Link>
            </div>
            <div className="space-y-4">
              {recentOrders.length === 0 ? (
                <p className="text-slate-500 text-center py-8">Žiadne objednávky</p>
              ) : (
                recentOrders.slice(0, 5).map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700 last:border-0">
                    <div>
                      <p className="font-medium text-slate-800 dark:text-white">{order.customer_name}</p>
                      <p className="text-sm text-slate-500">{order.pickup_address?.slice(0, 30)}...</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-800 dark:text-white">{order.price} €</p>
                      <span className={'text-xs px-2 py-1 rounded-full ' + (order.status === 'delivered' ? 'bg-green-100 text-green-600' : order.status === 'assigned' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600')}>
                        {order.status === 'delivered' ? 'Doručené' : order.status === 'assigned' ? 'Priradené' : 'Čaká'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pending couriers */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Čakajú na schválenie</h2>
              <Link href="/admin/dashboard/couriers" className="text-amber-500 text-sm hover:underline">
                Všetci kuriéri
              </Link>
            </div>
            <div className="space-y-4">
              {pendingCouriers.length === 0 ? (
                <p className="text-slate-500 text-center py-8">Žiadne žiadosti</p>
              ) : (
                pendingCouriers.slice(0, 5).map((courier: any) => (
                  <div key={courier.id} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700 last:border-0">
                    <div>
                      <p className="font-medium text-slate-800 dark:text-white">{courier.first_name} {courier.last_name}</p>
                      <p className="text-sm text-slate-500">{courier.phone}</p>
                    </div>
                    <Link 
                      href={'/admin/dashboard/couriers/' + courier.id}
                      className="px-4 py-2 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600"
                    >
                      Skontrolovať
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
