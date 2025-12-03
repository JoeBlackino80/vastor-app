'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, FileText, ShoppingBag, MapPin, Clock, Crown, CheckCircle, Star } from 'lucide-react'

function OrderForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isReorder = searchParams.get('reorder') === 'true'
  const [customer, setCustomer] = useState<any>(null)
  const [favoriteAddresses, setFavoriteAddresses] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [finalPrice, setFinalPrice] = useState(0)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    pickup_address: '',
    pickup_notes: '',
    delivery_address: '',
    delivery_notes: '',
    package_type: 'document',
    service_type: 'standard'
  })

  useEffect(() => {
    const saved = localStorage.getItem('customer')
    if (saved) {
      const c = JSON.parse(saved)
      setCustomer(c)
      setFormData(prev => ({
        ...prev,
        customer_name: c.account_type === 'company' ? c.company_name : `${c.first_name} ${c.last_name}`,
        customer_email: c.email,
        customer_phone: c.phone || '',
        pickup_address: c.street ? `${c.street}, ${c.postal_code} ${c.city}` : ''
      }))
      // Načítaj obľúbené adresy
      fetchFavoriteAddresses(c.id)
    }

    // Ak je reorder, načítaj údaje
    if (isReorder) {
      const reorderData = localStorage.getItem('reorder')
      if (reorderData) {
        const data = JSON.parse(reorderData)
        setFormData(prev => ({ ...prev, ...data }))
        localStorage.removeItem('reorder')
      }
    }
  }, [isReorder])

  const fetchFavoriteAddresses = async (customerId: string) => {
    try {
      const res = await fetch(`/api/favorite-addresses?customer_id=${customerId}`)
      const data = await res.json()
      setFavoriteAddresses(data.addresses || [])
    } catch (err) {
      console.error(err)
    }
  }

  const prices: Record<string, number> = { standard: 4.90, express: 7.90, premium: 12.90 }
  const price = prices[formData.service_type] || 4.90

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, price })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setFinalPrice(price)
      setIsSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Niečo sa pokazilo')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-lg mx-auto p-6 pt-12">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-sm">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-2 dark:text-white">Objednávka prijatá!</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Kuriér bude priradený čo najskôr.</p>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 mb-6">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Celková cena</p>
              <p className="text-3xl font-bold dark:text-white">{finalPrice.toFixed(2)} €</p>
            </div>
            <Link href="/" className="block w-full py-4 bg-black text-white rounded-xl font-semibold">
              Späť na hlavnú stránku
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto p-6">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full mb-4">
          <ArrowLeft className="w-6 h-6 dark:text-white" />
        </button>
        <h1 className="text-2xl font-bold mb-6 dark:text-white">
          {isReorder ? 'Objednať znova' : 'Nová objednávka'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Kontaktné údaje */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold mb-4 dark:text-white">Kontaktné údaje</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Meno a priezvisko *" value={formData.customer_name} onChange={e => setFormData({...formData, customer_name: e.target.value})} className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-xl" required />
              <input type="email" placeholder="Email *" value={formData.customer_email} onChange={e => setFormData({...formData, customer_email: e.target.value})} className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-xl" required />
              <input type="tel" placeholder="Telefón *" value={formData.customer_phone} onChange={e => setFormData({...formData, customer_phone: e.target.value})} className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-xl" required />
            </div>
          </div>

          {/* Adresy */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold mb-4 dark:text-white">Adresy</h2>
            
            {/* Obľúbené adresy */}
            {favoriteAddresses.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Obľúbené adresy:</p>
                <div className="flex flex-wrap gap-2">
                  {favoriteAddresses.map(addr => (
                    <button key={addr.id} type="button" onClick={() => setFormData({...formData, pickup_address: addr.address})}
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-white">
                      <Star className="w-3 h-3 text-yellow-500" /> {addr.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">Adresa vyzdvihnutia *</label>
                <input type="text" placeholder="Ulica, číslo, mesto" value={formData.pickup_address} onChange={e => setFormData({...formData, pickup_address: e.target.value})} className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-xl" required />
                <input type="text" placeholder="Poznámka (voliteľné)" value={formData.pickup_notes} onChange={e => setFormData({...formData, pickup_notes: e.target.value})} className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-xl mt-2" />
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">Adresa doručenia *</label>
                <input type="text" placeholder="Ulica, číslo, mesto" value={formData.delivery_address} onChange={e => setFormData({...formData, delivery_address: e.target.value})} className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-xl" required />
                <input type="text" placeholder="Poznámka (voliteľné)" value={formData.delivery_notes} onChange={e => setFormData({...formData, delivery_notes: e.target.value})} className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-xl mt-2" />
              </div>
            </div>
          </div>

          {/* Typ zásielky */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold mb-4 dark:text-white">Typ zásielky</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'document', icon: FileText, label: 'Dokument' },
                { id: 'package', icon: Package, label: 'Balík' },
                { id: 'other', icon: ShoppingBag, label: 'Iné' }
              ].map(type => (
                <button key={type.id} type="button" onClick={() => setFormData({...formData, package_type: type.id})}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 ${formData.package_type === type.id ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-700' : 'border-gray-200 dark:border-gray-600'}`}>
                  <type.icon className="w-6 h-6 dark:text-white" />
                  <span className="text-sm dark:text-white">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Typ služby */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold mb-4 dark:text-white">Rýchlosť doručenia</h2>
            <div className="space-y-3">
              {[
                { id: 'standard', icon: Clock, label: 'Štandard', desc: 'Do 120 minút', price: '4,90 €' },
                { id: 'express', icon: MapPin, label: 'Express', desc: 'Do 60 minút', price: '7,90 €' },
                { id: 'premium', icon: Crown, label: 'Premium', desc: 'Do 45 minút', price: '12,90 €' }
              ].map(service => (
                <button key={service.id} type="button" onClick={() => setFormData({...formData, service_type: service.id})}
                  className={`w-full p-4 rounded-xl border-2 flex items-center justify-between ${formData.service_type === service.id ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-700' : 'border-gray-200 dark:border-gray-600'}`}>
                  <div className="flex items-center gap-3">
                    <service.icon className="w-5 h-5 dark:text-white" />
                    <div className="text-left">
                      <p className="font-medium dark:text-white">{service.label}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{service.desc}</p>
                    </div>
                  </div>
                  <p className="font-semibold dark:text-white">{service.price}</p>
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-500 text-center">{error}</p>}

          {/* Submit */}
          <div className="bg-black text-white rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-400">Celková cena</span>
              <span className="text-3xl font-bold">{price.toFixed(2)} €</span>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-white text-black font-semibold rounded-xl disabled:opacity-50">
              {isSubmitting ? 'Odosielam...' : 'Odoslať objednávku'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function OrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center"><p className="dark:text-white">Načítavam...</p></div>}>
      <OrderForm />
    </Suspense>
  )
}
