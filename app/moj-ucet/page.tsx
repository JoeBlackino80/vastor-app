'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Phone, MapPin, Package, LogOut, Building2, FileText, Edit2, Heart } from 'lucide-react'

const SESSION_TIMEOUT = 15 * 60 * 1000

export default function MyAccount() {
  const router = useRouter()
  const [customer, setCustomer] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, delivered: 0, pending: 0, totalSpent: 0 })

  const checkSession = useCallback(() => {
    const lastActivity = localStorage.getItem('customer_last_activity')
    if (!lastActivity) return false
    return (Date.now() - parseInt(lastActivity)) < SESSION_TIMEOUT
  }, [])

  const updateActivity = useCallback(() => {
    localStorage.setItem('customer_last_activity', Date.now().toString())
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('customer')
    if (saved) {
      if (!checkSession()) {
        localStorage.removeItem('customer')
        localStorage.removeItem('customer_last_activity')
        router.push('/prihlasenie')
        return
      }
      const c = JSON.parse(saved)
      setCustomer(c)
      updateActivity()
      if (c.phone) {
        fetch(`/api/customer-orders?phone=${c.phone}`)
          .then(r => r.json())
          .then(orders => {
            if (Array.isArray(orders)) {
              setStats({
                total: orders.length,
                delivered: orders.filter((o: any) => o.status === 'delivered').length,
                pending: orders.filter((o: any) => ['pending','accepted','picked_up'].includes(o.status)).length,
                totalSpent: orders.reduce((sum: number, o: any) => sum + (o.price || 0), 0)
              })
            }
          })
          .catch(() => {})
      }
    }
    setIsLoading(false)
  }, [checkSession, updateActivity, router])

  useEffect(() => {
    if (!customer) return
    const events = ['click', 'keydown', 'scroll', 'touchstart']
    const handleActivity = () => updateActivity()
    events.forEach(e => window.addEventListener(e, handleActivity))
    const interval = setInterval(() => {
      if (!checkSession()) {
        localStorage.removeItem('customer')
        localStorage.removeItem('customer_last_activity')
        router.push('/prihlasenie')
      }
    }, 60000)
    return () => {
      events.forEach(e => window.removeEventListener(e, handleActivity))
      clearInterval(interval)
    }
  }, [customer, checkSession, updateActivity, router])

  const handleLogout = () => {
    localStorage.removeItem('customer')
    localStorage.removeItem('customer_last_activity')
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-black dark:border-white border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md mx-auto p-6">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full mb-4">
            <ArrowLeft className="w-6 h-6 dark:text-white" />
          </button>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <h1 className="text-xl font-bold mb-2 dark:text-white">Nie ste prihlásený</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Pre zobrazenie účtu sa prihláste</p>
            <div className="space-y-3">
              <Link href="/prihlasenie" className="block w-full py-3 bg-black text-white rounded-xl font-semibold">Prihlásiť sa</Link>
              <Link href="/registracia" className="block w-full py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl font-semibold dark:text-white">Registrovať sa</Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const isCompany = customer.account_type === 'company'
  const displayName = isCompany ? customer.company_name : `${customer.first_name} ${customer.last_name}`

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md mx-auto p-6">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full mb-4">
          <ArrowLeft className="w-6 h-6 dark:text-white" />
        </button>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm mb-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                {isCompany ? <Building2 className="w-8 h-8 text-white" /> : <User className="w-8 h-8 text-white" />}
              </div>
              <div>
                <h1 className="text-xl font-bold dark:text-white">{displayName}</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{isCompany ? 'Firemný účet' : 'Osobný účet'}</p>
              </div>
            </div>
            <Link href="/moj-ucet/upravit" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
              <Edit2 className="w-5 h-5 text-gray-400" />
            </Link>
          </div>
          <div className="space-y-4">
            {customer.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">{customer.phone}</span>
              </div>
            )}
            {customer.street && (
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">{customer.street}, {customer.postal_code} {customer.city}</span>
              </div>
            )}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm mb-4">
          <h2 className="font-bold mb-4 dark:text-white">Prehľad</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold dark:text-white">{stats.total}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Celkom objednávok</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{stats.delivered}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Doručených</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Aktívnych</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{stats.totalSpent.toFixed(0)}€</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Celkom</p>
            </div>
          </div>
        </div>
        {isCompany && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm mb-4">
            <h2 className="font-bold mb-4 flex items-center gap-2 dark:text-white">
              <FileText className="w-5 h-5" /> Fakturačné údaje
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">IČO:</span>
                <span className="font-medium dark:text-white">{customer.ico}</span>
              </div>
              {customer.dic && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">DIČ:</span>
                  <span className="font-medium dark:text-white">{customer.dic}</span>
                </div>
              )}
              {customer.ic_dph && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">IČ DPH:</span>
                  <span className="font-medium dark:text-white">{customer.ic_dph}</span>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm mb-4 overflow-hidden">
          <Link href="/moj-ucet/adresy" className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-gray-400" />
              <span className="dark:text-white">Obľúbené adresy</span>
            </div>
            <ArrowLeft className="w-5 h-5 text-gray-300 rotate-180" />
          </Link>
          <Link href="/moje-objednavky" className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-gray-400" />
              <span className="dark:text-white">História objednávok</span>
            </div>
            <ArrowLeft className="w-5 h-5 text-gray-300 rotate-180" />
          </Link>
        </div>
        <div className="space-y-3">
          <Link href="/objednavka" className="flex items-center justify-center gap-2 w-full py-4 bg-black text-white rounded-xl font-semibold">
            <Package className="w-5 h-5" /> Nová objednávka
          </Link>
          <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full py-4 text-red-500 font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl">
            <LogOut className="w-5 h-5" /> Odhlásiť sa
          </button>
        </div>
      </div>
    </div>
  )
}
