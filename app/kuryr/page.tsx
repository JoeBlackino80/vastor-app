'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { ArrowLeft, Check, Bike, Car, Zap, CreditCard, Clock, TrendingUp } from 'lucide-react'

type VehicleType = 'bike' | 'scooter' | 'car'

export default function CourierPage() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    vehicle_type: 'bike' as VehicleType,
    agree_terms: false,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/couriers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
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
            <h1 className="text-4xl font-extrabold tracking-tight mb-4">Registrace úspěšná</h1>
            <p className="text-lg text-gray-600 mb-8">
              Děkujeme za váš zájem stát se kurýrem VASTOR. Vaši přihlášku nyní zpracováváme 
              a budeme vás kontaktovat do 24 hodin.
            </p>
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
      
      {/* Hero */}
      <section className="pt-32 pb-20 bg-gray-100">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block px-4 py-2 bg-white text-xs text-gray-600 font-semibold uppercase tracking-widest mb-6">
                Pro kurýry
              </span>
              <h1 className="text-5xl font-extrabold tracking-tight mb-6">
                Staňte se kurýrem VASTOR
              </h1>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                Flexibilní práce s nadstandardním ohodnocením. Rozhodněte se sami, kdy a kolik budete pracovat.
              </p>
              
              <div className="bg-black text-white p-6 flex items-center gap-5">
                <div className="w-14 h-14 bg-gray-800 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Denní výplaty</h4>
                  <p className="text-gray-400">Na účet nebo v hotovosti. Peníze máte ten samý den.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 p-10">
              <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-200">
                <h4 className="font-semibold text-gray-600">Vaše výdělky</h4>
                <span className="text-sm text-gray-500 px-3 py-1 bg-gray-100">Tento měsíc</span>
              </div>
              <div className="text-6xl font-black tracking-tight mb-2">58 500 Kč</div>
              <div className="text-gray-600 mb-10">+18% oproti minulému měsíci</div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-100 p-5 text-center">
                  <div className="text-2xl font-extrabold">234</div>
                  <div className="text-xs text-gray-500 mt-1">Doručení</div>
                </div>
                <div className="bg-gray-100 p-5 text-center">
                  <div className="text-2xl font-extrabold">4.9</div>
                  <div className="text-xs text-gray-500 mt-1">Hodnocení</div>
                </div>
                <div className="bg-gray-100 p-5 text-center">
                  <div className="text-2xl font-extrabold">112h</div>
                  <div className="text-xs text-gray-500 mt-1">Odpracováno</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="w-14 h-14 bg-black mx-auto mb-5 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold mb-2">Až 350 Kč/hod</h3>
              <p className="text-gray-600 text-sm">Včetně bonusů a spropitného</p>
            </div>
            <div className="text-center p-6">
              <div className="w-14 h-14 bg-black mx-auto mb-5 flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold mb-2">Flexibilní doba</h3>
              <p className="text-gray-600 text-sm">Pracujte kdy chcete</p>
            </div>
            <div className="text-center p-6">
              <div className="w-14 h-14 bg-black mx-auto mb-5 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold mb-2">Denní výplaty</h3>
              <p className="text-gray-600 text-sm">Účet nebo hotovost</p>
            </div>
            <div className="text-center p-6">
              <div className="w-14 h-14 bg-black mx-auto mb-5 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold mb-2">Bonusy</h3>
              <p className="text-gray-600 text-sm">Za špičkové hodiny a počasí</p>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-xl mx-auto px-6">
          <h2 className="text-3xl font-extrabold tracking-tight mb-3 text-center">Registrace kurýra</h2>
          <p className="text-gray-600 text-center mb-10">Vyplňte formulář a začněte vydělávat</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 mb-8">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white border border-gray-200 p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Jméno *</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Příjmení *</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">Telefon *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input"
                placeholder="+420"
                required
              />
            </div>

            <div>
              <label className="label">Typ vozidla *</label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: 'bike', label: 'Kolo', icon: Bike },
                  { value: 'scooter', label: 'Skútr', icon: Zap },
                  { value: 'car', label: 'Auto', icon: Car },
                ].map(({ value, label, icon: Icon }) => (
                  <label
                    key={value}
                    className={`cursor-pointer p-5 border-2 text-center transition-colors ${
                      formData.vehicle_type === value
                        ? 'border-black bg-gray-50'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="vehicle_type"
                      value={value}
                      checked={formData.vehicle_type === value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <Icon className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-semibold text-sm">{label}</div>
                  </label>
                ))}
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="agree_terms"
                checked={formData.agree_terms}
                onChange={handleChange}
                className="mt-1 w-5 h-5"
                required
              />
              <span className="text-sm text-gray-600">
                Souhlasím s <Link href="#" className="text-black underline">obchodními podmínkami</Link> a 
                <Link href="#" className="text-black underline"> zpracováním osobních údajů</Link>
              </span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full justify-center py-4 text-base disabled:opacity-50"
            >
              {isSubmitting ? 'Odesílám...' : 'Registrovat se'}
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </>
  )
}
