'use client'
import Turnstile from '@/components/Turnstile'
import { useState } from 'react'
import { UserPlus, CheckCircle, Truck, Bike, Car, Eye, EyeOff, Upload, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function CourierRegistration() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // Osobne udaje
    first_name: '',
    last_name: '',
    birth_date: '',
    nationality: 'CZ',
    id_number: '',
    
    // Kontakt
    email: '',
    phone: '',
    
    // Adresa
    street: '',
    city: '',
    postal_code: '',
    
    // Heslo
    password: '',
    password_confirm: '',
    
    // Vozidlo
    vehicle_type: 'bike',
    drivers_license: '',
    vehicle_plate: '',
    
    // Bankove udaje
    iban: '',
    bank_name: '',
    
    // Doplnkove
    experience: 'none',
    availability: 'fulltime',
    
    // Suhlasy
    terms_accepted: false,
    gdpr_accepted: false
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')

  const validateStep = (currentStep: number) => {
    setError('')
    
    if (currentStep === 1) {
      if (!formData.first_name || !formData.last_name) {
        setError('Vyplnte meno a priezvisko')
        return false
      }
      if (!formData.birth_date) {
        setError('Vyplnte datum narodenia')
        return false
      }
      if (!formData.id_number) {
        setError('Vyplnte cislo obcianskeho preukazu')
        return false
      }
    }
    
    if (currentStep === 2) {
      if (!formData.email || !formData.phone) {
        setError('Vyplnte email a telefon')
        return false
      }
      if (!formData.street || !formData.city || !formData.postal_code) {
        setError('Vyplnte kompletnu adresu')
        return false
      }
    }
    
    if (currentStep === 3) {
      if (formData.password.length < 6) {
        setError('Heslo musi mat aspon 6 znakov')
        return false
      }
      if (formData.password !== formData.password_confirm) {
        setError('Hesla sa nezhoduju')
        return false
      }
    }
    
    if (currentStep === 4) {
      if ((formData.vehicle_type === 'scooter' || formData.vehicle_type === 'car') && !formData.drivers_license) {
        setError('Pre skuter/auto je potrebny vodicsky preukaz')
        return false
      }
    }
    
    if (currentStep === 5) {
      if (!formData.iban) {
        setError('Vyplnte IBAN pre vyplaty')
        return false
      }
    }
    
    return true
  }

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    setError('')
    setStep(step - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.terms_accepted || !formData.gdpr_accepted) {
      setError('Musite suhlasit s podmienkami a GDPR')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/courier-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()

      if (data.success) {
        setIsSuccess(true)
      } else {
        setError(data.error || 'Nepodarilo sa odoslat registraciu')
      }
    } catch (err) {
      setError('Chyba pri odosielani')
    }
    setIsSubmitting(false)
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Registracia odoslana!</h1>
          <p className="text-gray-600 mb-6">
            Dakujeme za registraciu. Tvoja ziadost bude preverena a schvalena administratorom do 24 hodin.
            O schvaleni ta budeme informovat emailom.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-left text-sm text-yellow-800">
                <p className="font-medium">Co sa stane dalej?</p>
                <ul className="mt-2 space-y-1">
                  <li>1. Overime tvoje udaje</li>
                  <li>2. Skontrolujeme doklady</li>
                  <li>3. Aktivujeme tvoj ucet</li>
                  <li>4. Mozes zacat dorucat!</li>
                </ul>
              </div>
            </div>
          </div>
          <Link href="/kuryr" className="text-black underline">Spat na prihlasenie</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Registracia kuriera</h1>
              <p className="text-gray-500 text-sm">Pripoj sa k timu voru</p>
            </div>
          </div>
          
          {/* Progress */}
          <div className="flex gap-2">
            {[1,2,3,4,5,6].map((s) => (
              <div key={s} className={`h-2 flex-1 rounded-full ${s <= step ? 'bg-black' : 'bg-gray-200'}`} />
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-2">Krok {step} z 6</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-lg">
          
          {/* Step 1: Osobne udaje */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-bold text-lg mb-4">Osobne udaje</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Meno *</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-100 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Priezvisko *</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-100 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Datum narodenia *</label>
                <input
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-100 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Narodnost</label>
                <select
                  value={formData.nationality}
                  onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-100 rounded-xl"
                >
                  <option value="CZ">Ceska republika</option>
                  <option value="SK">Slovensko</option>
                  <option value="UA">Ukrajina</option>
                  <option value="PL">Polsko</option>
                  <option value="OTHER">Ina</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Cislo obcianskeho preukazu *</label>
                <input
                  type="text"
                  value={formData.id_number}
                  onChange={(e) => setFormData({...formData, id_number: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-100 rounded-xl"
                  placeholder="napr. 123456789"
                  required
                />
              </div>
            </div>
          )}

          {/* Step 2: Kontaktne udaje */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-bold text-lg mb-4">Kontaktne udaje</h2>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-100 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Telefon *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-100 rounded-xl"
                  placeholder="+420..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Ulica a cislo domu *</label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => setFormData({...formData, street: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-100 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Mesto *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-100 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">PSC *</label>
                  <input
                    type="text"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-100 rounded-xl"
                    placeholder="110 00"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Heslo */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-bold text-lg mb-4">Prihlasovanie heslo</h2>
              
              <div>
                <label className="block text-sm font-medium mb-1">Heslo *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-100 rounded-xl pr-12"
                    placeholder="Min. 6 znakov"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Potvrdit heslo *</label>
                <input
                  type="password"
                  value={formData.password_confirm}
                  onChange={(e) => setFormData({...formData, password_confirm: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-100 rounded-xl"
                  required
                />
              </div>
            </div>
          )}

          {/* Step 4: Vozidlo */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="font-bold text-lg mb-4">Dopravny prostriedok</h2>
              
              <div>
                <label className="block text-sm font-medium mb-2">Typ vozidla *</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, vehicle_type: 'bike'})}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 ${formData.vehicle_type === 'bike' ? 'border-black bg-gray-50' : 'border-gray-200'}`}
                  >
                    <Bike className="w-6 h-6" />
                    <span className="text-sm">Bicykel</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, vehicle_type: 'scooter'})}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 ${formData.vehicle_type === 'scooter' ? 'border-black bg-gray-50' : 'border-gray-200'}`}
                  >
                    <Truck className="w-6 h-6" />
                    <span className="text-sm">Skuter</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, vehicle_type: 'car'})}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 ${formData.vehicle_type === 'car' ? 'border-black bg-gray-50' : 'border-gray-200'}`}
                  >
                    <Car className="w-6 h-6" />
                    <span className="text-sm">Auto</span>
                  </button>
                </div>
              </div>

              {(formData.vehicle_type === 'scooter' || formData.vehicle_type === 'car') && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Cislo vodicskeho preukazu *</label>
                    <input
                      type="text"
                      value={formData.drivers_license}
                      onChange={(e) => setFormData({...formData, drivers_license: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-100 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">SPZ vozidla</label>
                    <input
                      type="text"
                      value={formData.vehicle_plate}
                      onChange={(e) => setFormData({...formData, vehicle_plate: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-100 rounded-xl"
                      placeholder="napr. 1A2 3456"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 5: Bankove udaje */}
          {step === 5 && (
            <div className="space-y-4">
              <h2 className="font-bold text-lg mb-4">Bankove udaje</h2>
              <p className="text-sm text-gray-500 mb-4">Pre vyplaty za dorucene zasielky</p>
              
              <div>
                <label className="block text-sm font-medium mb-1">IBAN *</label>
                <input
                  type="text"
                  value={formData.iban}
                  onChange={(e) => setFormData({...formData, iban: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-100 rounded-xl"
                  placeholder="CZ65 0800 0000 1920 0014 5399"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Nazov banky</label>
                <input
                  type="text"
                  value={formData.bank_name}
                  onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-100 rounded-xl"
                  placeholder="napr. Ceska sporitelna"
                />
              </div>
            </div>
          )}

          {/* Step 6: Doplnkove info + Suhlasy */}
          {step === 6 && (
            <div className="space-y-4">
              <h2 className="font-bold text-lg mb-4">Doplnujuce informacie</h2>
              
              <div>
                <label className="block text-sm font-medium mb-1">Skusenosti s kurierskymi sluzbami</label>
                <select
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-100 rounded-xl"
                >
                  <option value="none">Ziadne</option>
                  <option value="less1">Menej ako 1 rok</option>
                  <option value="1to3">1-3 roky</option>
                  <option value="more3">Viac ako 3 roky</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Preferovana dostupnost</label>
                <select
                  value={formData.availability}
                  onChange={(e) => setFormData({...formData, availability: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-100 rounded-xl"
                >
                  <option value="fulltime">Plny uvazok (40+ hod/tyzden)</option>
                  <option value="parttime">Castocny uvazok (20-40 hod/tyzden)</option>
                  <option value="flexible">Flexibilne (menej ako 20 hod/tyzden)</option>
                  <option value="weekends">Len vikendy</option>
                </select>
              </div>

              <div className="border-t pt-4 mt-6">
                <h3 className="font-medium mb-3">Suhlasy</h3>
                
                <label className="flex items-start gap-3 mb-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.terms_accepted}
                    onChange={(e) => setFormData({...formData, terms_accepted: e.target.checked})}
                    className="mt-1 w-5 h-5"
                  />
                  <span className="text-sm">
                    Suhlasim so <a href="#" className="underline">Vseobecnymi obchodnymi podmienkami</a> a <a href="#" className="underline">Pravidlami pre kurierov</a> *
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.gdpr_accepted}
                    onChange={(e) => setFormData({...formData, gdpr_accepted: e.target.checked})}
                    className="mt-1 w-5 h-5"
                  />
                  <span className="text-sm">
                    Suhlasim so spracovanim osobnych udajov podla <a href="#" className="underline">GDPR</a> *
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex-1 py-4 border-2 border-gray-200 rounded-xl font-semibold"
              >
                Spat
              </button>
            )}
            
            {step < 6 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex-1 py-4 bg-black text-white rounded-xl font-semibold"
              >
                Dalej
              </button>
            ) : (
              <Turnstile onVerify={setTurnstileToken} />
              <button
                type="submit"
                disabled={isSubmitting || !turnstileToken}
                className="flex-1 py-4 bg-black text-white rounded-xl font-semibold disabled:opacity-50"
              >
                {isSubmitting ? 'Odosielam...' : 'Odoslat registraciu'}
              </button>
            )}
          </div>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Uz mas ucet? <Link href="/kuryr" className="text-black underline">Prihlasit sa</Link>
        </p>
      </div>
    </div>
  )
}
