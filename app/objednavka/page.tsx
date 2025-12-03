'use client'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import BackButton from '@/components/BackButton'
import { Package, FileText, Zap, Crown, CheckCircle } from 'lucide-react'

function OrderForm() {
  const searchParams = useSearchParams()
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
    package_type: 'small',
    service_type: 'standard'
  })

  const getPrice = () => {
    let base = formData.service_type === 'express' ? 149 : formData.service_type === 'premium' ? 249 : 89
    if (formData.package_type === 'medium') base += 20
    if (formData.package_type === 'large') base += 50
    return base
  }

  const price = getPrice()

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
      <div className="min-h-screen bg-white">
        <div className="p-4">
          <Link href="/" className="text-2xl font-bold">VASTOR</Link>
        </div>
        <div className="pt-20 pb-20 px-6">
          <div className="max-w-lg mx-auto text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Objednávka prijatá!</h1>
            <p className="text-gray-600 mb-8">Kuriér bude priradený čoskoro. Sledujte email pre tracking link.</p>
            <div className="bg-gray-100 rounded-2xl p-6 mb-8">
              <p className="text-gray-500 text-sm mb-2">Celková cena</p>
              <p className="text-4xl font-bold">{finalPrice} Kč</p>
            </div>
            <Link href="/" className="inline-block px-8 py-4 bg-black text-white rounded-full font-medium">
              Späť na úvod
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="p-4 flex items-center gap-4 border-b">
        <BackButton />
        <Link href="/" className="text-2xl font-bold">VASTOR</Link>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-8">Nová objednávka</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Kontakt */}
          <div className="space-y-4">
            <h2 className="font-bold text-lg">Kontaktné údaje</h2>
            <input type="text" placeholder="Meno a priezvisko" value={formData.customer_name} onChange={(e) => setFormData({...formData, customer_name: e.target.value})} className="w-full px-4 py-3 bg-gray-100 rounded-xl" required />
            <input type="email" placeholder="Email" value={formData.customer_email} onChange={(e) => setFormData({...formData, customer_email: e.target.value})} className="w-full px-4 py-3 bg-gray-100 rounded-xl" required />
            <input type="tel" placeholder="Telefón" value={formData.customer_phone} onChange={(e) => setFormData({...formData, customer_phone: e.target.value})} className="w-full px-4 py-3 bg-gray-100 rounded-xl" required />
          </div>

          {/* Adresy */}
          <div className="space-y-4">
            <h2 className="font-bold text-lg">Vyzdvihnutie</h2>
            <input type="text" placeholder="Adresa vyzdvihnutia" value={formData.pickup_address} onChange={(e) => setFormData({...formData, pickup_address: e.target.value})} className="w-full px-4 py-3 bg-gray-100 rounded-xl" required />
            <input type="text" placeholder="Poznámka (voliteľné)" value={formData.pickup_notes} onChange={(e) => setFormData({...formData, pickup_notes: e.target.value})} className="w-full px-4 py-3 bg-gray-100 rounded-xl" />
          </div>

          <div className="space-y-4">
            <h2 className="font-bold text-lg">Doručenie</h2>
            <input type="text" placeholder="Adresa doručenia" value={formData.delivery_address} onChange={(e) => setFormData({...formData, delivery_address: e.target.value})} className="w-full px-4 py-3 bg-gray-100 rounded-xl" required />
            <input type="text" placeholder="Poznámka (voliteľné)" value={formData.delivery_notes} onChange={(e) => setFormData({...formData, delivery_notes: e.target.value})} className="w-full px-4 py-3 bg-gray-100 rounded-xl" />
          </div>

          {/* Balík */}
          <div className="space-y-4">
            <h2 className="font-bold text-lg">Veľkosť balíka</h2>
            <div className="grid grid-cols-3 gap-3">
              {[{id:'small',name:'Malý',desc:'Do 5kg'},{id:'medium',name:'Stredný',desc:'5-15kg'},{id:'large',name:'Veľký',desc:'15-30kg'}].map(p => (
                <button key={p.id} type="button" onClick={() => setFormData({...formData, package_type: p.id})} className={`p-4 rounded-xl border-2 text-center ${formData.package_type === p.id ? 'border-black bg-gray-50' : 'border-gray-200'}`}>
                  <Package className="w-6 h-6 mx-auto mb-2" />
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Služba */}
          <div className="space-y-4">
            <h2 className="font-bold text-lg">Typ služby</h2>
            <div className="space-y-3">
              <button type="button" onClick={() => setFormData({...formData, service_type: 'standard'})} className={`w-full p-4 rounded-xl border-2 flex justify-between items-center ${formData.service_type === 'standard' ? 'border-black bg-gray-50' : 'border-gray-200'}`}>
                <div className="flex items-center gap-3"><FileText className="w-6 h-6" /><div className="text-left"><p className="font-medium">Štandard</p><p className="text-sm text-gray-500">Do konca dňa</p></div></div>
                <p className="font-semibold">89 Kč</p>
              </button>
              <button type="button" onClick={() => setFormData({...formData, service_type: 'express'})} className={`w-full p-4 rounded-xl border-2 flex justify-between items-center ${formData.service_type === 'express' ? 'border-black bg-gray-50' : 'border-gray-200'}`}>
                <div className="flex items-center gap-3"><Zap className="w-6 h-6" /><div className="text-left"><p className="font-medium">Express</p><p className="text-sm text-gray-500">Do 2 hodín</p></div></div>
                <p className="font-semibold">149 Kč</p>
              </button>
              <button type="button" onClick={() => setFormData({...formData, service_type: 'premium'})} className={`w-full p-4 rounded-xl border-2 flex justify-between items-center ${formData.service_type === 'premium' ? 'border-black bg-gray-50' : 'border-gray-200'}`}>
                <div className="flex items-center gap-3"><Crown className="w-6 h-6" /><div className="text-left"><p className="font-medium">Premium</p><p className="text-sm text-gray-500">Do 45 minút</p></div></div>
                <p className="font-semibold">249 Kč</p>
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-center">{error}</p>}

          {/* Submit */}
          <div className="bg-black text-white rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-400">Celková cena</span>
              <span className="text-3xl font-bold">{price} Kč</span>
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Načítavam...</div>}>
      <OrderForm />
    </Suspense>
  )
}
