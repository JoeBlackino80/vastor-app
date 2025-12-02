'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { Package, FileText, Box, Truck, Clock, Zap, Crown, CheckCircle } from 'lucide-react'
import { calculatePrice } from '@/lib/validations'

function OrderForm() {
  const searchParams = useSearchParams()
  const preselectedService = searchParams.get('service') || 'express'
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    pickup_address: '',
    pickup_notes: '',
    delivery_address: '',
    delivery_notes: '',
    package_type: 'document',
    service_type: preselectedService,
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [finalPrice, setFinalPrice] = useState(0)

  const price = calculatePrice(formData.service_type, formData.package_type)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, price }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Něco se pokazilo')
      }

      setFinalPrice(price)
      setIsSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Něco se pokazilo')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-32 pb-20 px-6">
          <div className="max-w-lg mx-auto text-center">
            <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center mx-auto mb-8">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-black mb-4">Objednávka přijata</h1>
            <p className="text-gray-600 mb-8">
              Děkujeme za vaši objednávku. Kurýr bude přiřazen během několika minut.
              Informace o stavu doručení obdržíte emailem.
            </p>
            <div className="bg-gray-100 rounded-2xl p-6 mb-8">
              <p className="text-gray-500 text-sm mb-2">Celková cena</p>
              <p className="text-4xl font-bold text-bl
cat > app/objednavka/page.tsx << 'EOF'
'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { Package, FileText, Box, Truck, Clock, Zap, Crown, CheckCircle } from 'lucide-react'
import { calculatePrice } from '@/lib/validations'

function OrderForm() {
  const searchParams = useSearchParams()
  const preselectedService = searchParams.get('service') || 'express'
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    pickup_address: '',
    pickup_notes: '',
    delivery_address: '',
    delivery_notes: '',
    package_type: 'document',
    service_type: preselectedService,
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [finalPrice, setFinalPrice] = useState(0)

  const price = calculatePrice(formData.service_type, formData.package_type)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, price }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Něco se pokazilo')
      }

      setFinalPrice(price)
      setIsSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Něco se pokazilo')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-32 pb-20 px-6">
          <div className="max-w-lg mx-auto text-center">
            <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center mx-auto mb-8">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-black mb-4">Objednávka přijata</h1>
            <p className="text-gray-600 mb-8">
              Děkujeme za vaši objednávku. Kurýr bude přiřazen během několika minut.
              Informace o stavu doručení obdržíte emailem.
            </p>
            <div className="bg-gray-100 rounded-2xl p-6 mb-8">
              <p className="text-gray-500 text-sm mb-2">Celková cena</p>
              <p className="text-4xl font-bold text-black">{finalPrice} Kč</p>
            </div>
            <a href="/" className="inline-flex items-center justify-center px-8 py-4 bg-black text-white font-semibold rounded-full hover:bg-gray-800 transition-colors">
              Zpět na hlavní stránku
            </a>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-black mb-4">Objednat kurýra</h1>
          <p className="text-gray-600 mb-10">Vyplňte údaje a my se postaráme o zbytek</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-8">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-black mb-4">Kontaktní údaje</h2>
              <div className="space-y-4">
                <input type="text" placeholder="Jméno a příjmení" required className="w-full px-6 py-4 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-black" value={formData.customer_name} onChange={(e) => setFormData({...formData, customer_name: e.target.value})} />
                <input type="tel" placeholder="Telefon" required className="w-full px-6 py-4 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-black" value={formData.customer_phone} onChange={(e) => setFormData({...formData, customer_phone: e.target.value})} />
                <input type="email" placeholder="Email" required className="w-full px-6 py-4 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-black" value={formData.customer_email} onChange={(e) => setFormData({...formData, customer_email: e.target.value})} />
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-black mb-4">Místo vyzvednutí</h2>
              <div className="space-y-4">
                <input type="text" placeholder="Adresa vyzvednutí" required className="w-full px-6 py-4 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-black" value={formData.pickup_address} onChange={(e) => setFormData({...formData, pickup_address: e.target.value})} />
                <input type="text" placeholder="Poznámka (volitelné)" className="w-full px-6 py-4 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-black" value={formData.pickup_notes} onChange={(e) => setFormData({...formData, pickup_notes: e.target.value})} />
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-black mb-4">Místo doručení</h2>
              <div className="space-y-4">
                <input type="text" placeholder="Adresa doručení" required className="w-full px-6 py-4 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-black" value={formData.delivery_address} onChange={(e) => setFormData({...formData, delivery_address: e.target.value})} />
                <input type="text" placeholder="Poznámka (volitelné)" className="w-full px-6 py-4 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-black" value={formData.delivery_notes} onChange={(e) => setFormData({...formData, delivery_notes: e.target.value})} />
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-black mb-4">Typ zásilky</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'document', label: 'Dokument', icon: FileText, extra: '+0 Kč' },
                  { id: 'small_package', label: 'Malý balík', icon: Package, extra: '+20 Kč' },
                  { id: 'medium_package', label: 'Střední balík', icon: Box, extra: '+50 Kč' },
                  { id: 'large_package', label: 'Velký balík', icon: Truck, extra: '+100 Kč' },
                ].map((type) => (
                  <button key={type.id} type="button" onClick={() => setFormData({...formData, package_type: type.id})} className={`p-4 rounded-xl border-2 transition-all text-left ${formData.package_type === type.id ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <type.icon className="w-6 h-6 mb-2" />
                    <p className="font-medium">{type.label}</p>
                    <p className="text-sm text-gray-500">{type.extra}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-black mb-4">Typ služby</h2>
              <div className="space-y-3">
                {[
                  { id: 'standard', label: 'Standard', time: 'Do 90 minut', price: '89 Kč', icon: Clock },
                  { id: 'express', label: 'Express', time: 'Do 60 minut', price: '149 Kč', icon: Zap },
                  { id: 'premium', label: 'Premium', time: 'Do 45 minut', price: '249 Kč', icon: Crown },
                ].map((service) => (
                  <button key={service.id} type="button" onClick={() => setFormData({...formData, service_type: service.id})} className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${formData.service_type === service.id ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="flex items-center gap-4">
                      <service.icon className="w-6 h-6" />
                      <div className="text-left">
                        <p className="font-medium">{service.label}</p>
                        <p className="text-sm text-gray-500">{service.time}</p>
                      </div>
                    </div>
                    <p className="font-semibold">{service.price}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-black text-white rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-400">Celková cena</span>
                <span className="text-3xl font-bold">{price} Kč</span>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50">
                {isSubmitting ? 'Odesílám...' : 'Odeslat objednávku'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default function OrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Načítání...</div>}>
      <OrderForm />
    </Suspense>
  )
}
