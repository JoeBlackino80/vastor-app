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
        throw new Error(data.error || 'Neco se pokazilo')
      }

      setFinalPrice(price)
      setIsSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Neco se pokazilo')
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
            <h1 className="text-4xl font-bold text-black mb-4">Objednavka prijata</h1>
            <p className="text-gray-600 mb-8">Dekujeme za vasi objednavku. Kuryr bude prirazen behem nekolika minut.</p>
            <div className="bg-gray-100 rounded-2xl p-6 mb-8">
              <p className="text-gray-500 text-sm mb-2">Celkova cena</p>
              <p className="text-4xl font-bold text-black">{finalPrice} Kc</p>
            </div>
            <a href="/" className="inline-flex items-center justify-center px-8 py-4 bg-black text-white font-semibold rounded-full">Zpet na hlavni stranku</a>
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
          <h1 className="text-4xl font-bold text-black mb-4">Objednat kuryra</h1>
          <p className="text-gray-600 mb-10">Vyplnte udaje a my se postarame o zbytek</p>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-8">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-black mb-4">Kontaktni udaje</h2>
              <div className="space-y-4">
                <input type="text" placeholder="Jmeno a prijmeni" required className="w-full px-6 py-4 bg-gray-100 rounded-xl" value={formData.customer_name} onChange={(e) => setFormData({...formData, customer_name: e.target.value})} />
                <input type="tel" placeholder="Telefon" required className="w-full px-6 py-4 bg-gray-100 rounded-xl" value={formData.customer_phone} onChange={(e) => setFormData({...formData, customer_phone: e.target.value})} />
                <input type="email" placeholder="Email" required className="w-full px-6 py-4 bg-gray-100 rounded-xl" value={formData.customer_email} onChange={(e) => setFormData({...formData, customer_email: e.target.value})} />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-black mb-4">Misto vyzvednuti</h2>
              <div className="space-y-4">
                <input type="text" placeholder="Adresa vyzvednuti" required className="w-full px-6 py-4 bg-gray-100 rounded-xl" value={formData.pickup_address} onChange={(e) => setFormData({...formData, pickup_address: e.target.value})} />
                <input type="text" placeholder="Poznamka" className="w-full px-6 py-4 bg-gray-100 rounded-xl" value={formData.pickup_notes} onChange={(e) => setFormData({...formData, pickup_notes: e.target.value})} />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-black mb-4">Misto doruceni</h2>
              <div className="space-y-4">
                <input type="text" placeholder="Adresa doruceni" required className="w-full px-6 py-4 bg-gray-100 rounded-xl" value={formData.delivery_address} onChange={(e) => setFormData({...formData, delivery_address: e.target.value})} />
                <input type="text" placeholder="Poznamka" className="w-full px-6 py-4 bg-gray-100 rounded-xl" value={formData.delivery_notes} onChange={(e) => setFormData({...formData, delivery_notes: e.target.value})} />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-black mb-4">Typ zasilky</h2>
              <div className="grid grid-cols-2 gap-4">
                <button type="button" onClick={() => setFormData({...formData, package_type: 'document'})} className={`p-4 rounded-xl border-2 text-left ${formData.package_type === 'document' ? 'border-black' : 'border-gray-200'}`}><FileText className="w-6 h-6 mb-2" /><p className="font-medium">Dokument</p><p className="text-sm text-gray-500">+0 Kc</p></button>
                <button type="button" onClick={() => setFormData({...formData, package_type: 'small_package'})} className={`p-4 rounded-xl border-2 text-left ${formData.package_type === 'small_package' ? 'border-black' : 'border-gray-200'}`}><Package className="w-6 h-6 mb-2" /><p className="font-medium">Maly balik</p><p className="text-sm text-gray-500">+20 Kc</p></button>
                <button type="button" onClick={() => setFormData({...formData, package_type: 'medium_package'})} className={`p-4 rounded-xl border-2 text-left ${formData.package_type === 'medium_package' ? 'border-black' : 'border-gray-200'}`}><Box className="w-6 h-6 mb-2" /><p className="font-medium">Stredni balik</p><p className="text-sm text-gray-500">+50 Kc</p></button>
                <button type="button" onClick={() => setFormData({...formData, package_type: 'large_package'})} className={`p-4 rounded-xl border-2 text-left ${formData.package_type === 'large_package' ? 'border-black' : 'border-gray-200'}`}><Truck className="w-6 h-6 mb-2" /><p className="font-medium">Velky balik</p><p className="text-sm text-gray-500">+100 Kc</p></button>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-black mb-4">Typ sluzby</h2>
              <div className="space-y-3">
                <button type="button" onClick={() => setFormData({...formData, service_type: 'standard'})} className={`w-full p-4 rounded-xl border-2 flex items-center justify-between ${formData.service_type === 'standard' ? 'border-black' : 'border-gray-200'}`}><div className="flex items-center gap-4"><Clock className="w-6 h-6" /><div className="text-left"><p className="font-medium">Standard</p><p className="text-sm text-gray-500">Do 90 minut</p></div></div><p className="font-semibold">89 Kc</p></button>
                <button type="button" onClick={() => setFormData({...formData, service_type: 'express'})} className={`w-full p-4 rounded-xl border-2 flex items-center justify-between ${formData.service_type === 'express' ? 'border-black' : 'border-gray-200'}`}><div className="flex items-center gap-4"><Zap className="w-6 h-6" /><div className="text-left"><p className="font-medium">Express</p><p className="text-sm text-gray-500">Do 60 minut</p></div></div><p className="font-semibold">149 Kc</p></button>
                <button type="button" onClick={() => setFormData({...formData, service_type: 'premium'})} className={`w-full p-4 rounded-xl border-2 flex items-center justify-between ${formData.service_type === 'premium' ? 'border-black' : 'border-gray-200'}`}><div className="flex items-center gap-4"><Crown className="w-6 h-6" /><div className="text-left"><p className="font-medium">Premium</p><p className="text-sm text-gray-500">Do 45 minut</p></div></div><p className="font-semibold">249 Kc</p></button>
              </div>
            </div>
            <div className="bg-black text-white rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-400">Celkova cena</span>
                <span className="text-3xl font-bold">{price} Kc</span>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-white text-black font-semibold rounded-xl disabled:opacity-50">{isSubmitting ? 'Odesilam...' : 'Odeslat objednavku'}</button>
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
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Nacitani...</div>}>
      <OrderForm />
    </Suspense>
  )
}
