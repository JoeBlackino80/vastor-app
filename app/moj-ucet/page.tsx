'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Mail, Phone, MapPin, Package, LogOut, Building2, FileText, Edit2, Heart, Lock } from 'lucide-react'

export default function MyAccount() {
  const router = useRouter()
  const [customer, setCustomer] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('customer')
    if (saved) setCustomer(JSON.parse(saved))
    setIsLoading(false)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('customer')
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Načítavam...</p>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto p-6">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-200 rounded-full mb-4">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <h1 className="text-xl font-bold mb-2">Nie ste prihlásený</h1>
            <p className="text-gray-600 mb-6">Pre zobrazenie účtu sa prihláste</p>
            <div className="space-y-3">
              <Link href="/prihlasenie" className="block w-full py-3 bg-black text-white rounded-xl font-semibold">
                Prihlásiť sa
              </Link>
              <Link href="/registracia" className="block w-full py-3 border-2 border-gray-200 rounded-xl font-semibold">
                Registrovať sa
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const isCompany = customer.account_type === 'company'
  const displayName = isCompany ? customer.company_name : `${customer.first_name} ${customer.last_name}`

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto p-6">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-200 rounded-full mb-4">
          <ArrowLeft className="w-6 h-6" />
        </button>

        {/* Profil */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                {isCompany ? <Building2 className="w-8 h-8 text-white" /> : <User className="w-8 h-8 text-white" />}
              </div>
              <div>
                <h1 className="text-xl font-bold">{displayName}</h1>
                <p className="text-gray-500 text-sm">{isCompany ? 'Pre firmu' : 'Pre seba'}</p>
              </div>
            </div>
            <Link href="/moj-ucet/upravit" className="p-2 hover:bg-gray-100 rounded-full">
              <Edit2 className="w-5 h-5 text-gray-400" />
            </Link>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <span className="text-gray-700">{customer.email}</span>
            </div>
            {customer.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{customer.phone}</span>
              </div>
            )}
            {customer.street && (
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{customer.street}, {customer.postal_code} {customer.city}</span>
              </div>
            )}
          </div>
        </div>

        {/* Fakturačné údaje pre firmy */}
        {isCompany && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" /> Fakturačné údaje
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">IČO:</span>
                <span className="font-medium">{customer.ico}</span>
              </div>
              {customer.dic && (
                <div className="flex justify-between">
                  <span className="text-gray-500">DIČ:</span>
                  <span className="font-medium">{customer.dic}</span>
                </div>
              )}
              {customer.ic_dph && (
                <div className="flex justify-between">
                  <span className="text-gray-500">IČ DPH:</span>
                  <span className="font-medium">{customer.ic_dph}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Nastavenia */}
        <div className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden">
          <Link href="/moj-ucet/adresy" className="flex items-center justify-between p-4 hover:bg-gray-50 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-gray-400" />
              <span>Obľúbené adresy</span>
            </div>
            <ArrowLeft className="w-5 h-5 text-gray-300 rotate-180" />
          </Link>
          <Link href="/moje-objednavky" className="flex items-center justify-between p-4 hover:bg-gray-50 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-gray-400" />
              <span>História objednávok</span>
            </div>
            <ArrowLeft className="w-5 h-5 text-gray-300 rotate-180" />
          </Link>
          <Link href="/zmena-hesla" className="flex items-center justify-between p-4 hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-gray-400" />
              <span>Zmeniť heslo</span>
            </div>
            <ArrowLeft className="w-5 h-5 text-gray-300 rotate-180" />
          </Link>
        </div>

        {/* Akcie */}
        <div className="space-y-3">
          <Link href="/objednavka" className="flex items-center justify-center gap-2 w-full py-4 bg-black text-white rounded-xl font-semibold">
            <Package className="w-5 h-5" /> Nová objednávka
          </Link>
          <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full py-4 text-red-500 font-semibold">
            <LogOut className="w-5 h-5" /> Odhlásiť sa
          </button>
        </div>
      </div>
    </div>
  )
}
