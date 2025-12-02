'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { ArrowLeft, Check, Package, FileText, Box, Truck } from 'lucide-react'
import { calculatePrice, PRICES } from '@/lib/validations'

type ServiceType = 'standard' | 'express' | 'premium'
type PackageType = 'document' | 'small_package' | 'medium_package' | 'large_package'

export default function OrderPage() {
  const searchParams = useSearchParams()
  const initialService = (searchParams.get('service') as ServiceType) || 'express'

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    pickup_address: '',
    pickup_notes: '',
    delivery_address: '',
    delivery_notes: '',
    package_type: 'document' as PackageType,
    service_type: initialService,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const price = calculatePrice(formData.service_type, formData.package_type)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

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

      setIsSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Něco se pokazilo')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen pt-32 pb-20">
          <div className="max-w-xl mx-auto px-6 text-center">
            <div className="w-20 h-20 bg-black mx-auto mb-8 flex items-center justify-center">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-4">Objednávka přijata</h1>
            <p className="text-lg text-gray-600 mb-8">
              Děkujeme za vaši objednávku. Kurýr bude přiřazen během několika minut. 
              Informace o stavu doručení obdržíte emailem.
            </p>
            <div className="bg-gray-100 p-6 mb-8">
              <div className="text-sm text-gray-500 mb-1">Celková cena</div>
              <div className="text-3xl font-extrabold">{price} Kč</div>
            </div>
            <Link href="/" className="btn btn-primary">
              Zpět na hlavní stránku
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-6">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Zpět
          </Link>

          <h1 className="text-4xl font-extrabold tracking-tight mb-3">Objednat kurýra</h1>
          <p className="text-lg text-gray-600 mb-10">Vyplňte údaje a kurýr bude přiřazen během několika minut.</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 mb-8">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Contact info */}
            <div>
              <h2 className="text-xl font-bold mb-6">Kontaktní údaje</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Jméno a příjmení *</label>
                  <input
                    type="text"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Telefon *</label>
                  <input
                    type="tel"
                    name="customer_phone"
                    value={formData.customer_phone}
                    onChange={handleChange}
                    className="input"
                    placeholder="+420"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Email *</label>
                  <input
                    type="email"
                    name="customer_email"
                    value={formData.customer_email}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Pickup */}
            <div>
              <h2 className="text-xl font-bold mb-6">Místo vyzvednutí</h2>
              <div className="space-y-4">
                <div>
                  <label className="label">Adresa vyzvednutí *</label>
                  <input
                    type="text"
                    name="pickup_address"
                    value={formData.pickup_address}
                    onChange={handleChange}
                    className="input"
                    placeholder="Ulice, číslo, město"
                    required
                  />
                </div>
                <div>
                  <label className="label">Poznámka pro kurýra</label>
                  <textarea
                    name="pickup_notes"
                    value={formData.pickup_notes}
                    onChange={handleChange}
                    className="input min-h-[100px]"
                    placeholder="např. 2. patro, zvonek Novák"
                  />
                </div>
              </div>
            </div>

            {/* Delivery */}
            <div>
              <h2 className="text-xl font-bold mb-6">Místo doručení</h2>
              <div className="space-y-4">
                <div>
                  <label className="label">Adresa doručení *</label>
                  <input
                    type="text"
                    name="delivery_address"
                    value={formData.delivery_address}
                    onChange={handleChange}
                    className="input"
                    placeholder="Ulice, číslo, město"
                    required
                  />
                </div>
                <div>
                  <label className="label">Poznámka pro kurýra</label>
                  <textarea
                    name="delivery_notes"
                    value={formData.delivery_notes}
                    onChange={handleChange}
                    className="input min-h-[100px]"
                    placeholder="např. recepce, předat osobně"
                  />
                </div>
              </div>
            </div>

            {/* Package type */}
            <div>
              <h2 className="text-xl font-bold mb-6">Typ zásilky</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { value: 'document', label: 'Dokument', icon: FileText, extra: '+0 Kč' },
                  { value: 'small_package', label: 'Malý balík', icon: Package, extra: '+20 Kč' },
                  { value: 'medium_package', label: 'Střední balík', icon: Box, extra: '+50 Kč' },
                  { value: 'large_package', label: 'Velký balík', icon: Truck, extra: '+100 Kč' },
                ].map(({ value, label, icon: Icon, extra }) => (
                  <label
                    key={value}
                    className={`cursor-pointer p-5 border-2 transition-colors ${
                      formData.package_type === value
                        ? 'border-black bg-gray-50'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="package_type"
                      value={value}
                      checked={formData.package_type === value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <Icon className="w-6 h-6 mb-3" />
                    <div className="font-semibold text-sm">{label}</div>
                    <div className="text-xs text-gray-500 mt-1">{extra}</div>
                  </label>
                ))}
              </div>
            </div>

            {/* Service type */}
            <div>
              <h2 className="text-xl font-bold mb-6">Typ služby</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { value: 'standard', label: 'Standard', time: 'Do 90 minut', price: '89 Kč' },
                  { value: 'express', label: 'Express', time: 'Do 60 minut', price: '149 Kč' },
                  { value: 'premium', label: 'Premium', time: 'Do 45 minut', price: '249 Kč' },
                ].map(({ value, label, time, price }) => (
                  <label
                    key={value}
                    className={`cursor-pointer p-5 border-2 transition-colors ${
                      formData.service_type === value
                        ? 'border-black bg-gray-50'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="service_type"
                      value={value}
                      checked={formData.service_type === value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="font-bold text-lg mb-1">{label}</div>
                    <div className="text-sm text-gray-500">{time}</div>
                    <div className="text-xl font-extrabold mt-3">{price}</div>
                  </label>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-black text-white p-8">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-400">Služba</span>
                <span className="font-semibold">{PRICES.service[formData.service_type]} Kč</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-400">Příplatek za zásilku</span>
                <span className="font-semibold">{PRICES.package[formData.package_type]} Kč</span>
              </div>
              <div className="border-t border-gray-700 pt-4 flex justify-between items-center">
                <span className="text-lg font-semibold">Celkem</span>
                <span className="text-3xl font-extrabold">{price} Kč</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full justify-center py-4 text-base disabled:opacity-50"
            >
              {isSubmitting ? 'Odesílám...' : 'Odeslat objednávku'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  )
}
