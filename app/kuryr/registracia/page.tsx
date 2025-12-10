'use client'
import { useState } from 'react'
import { UserPlus, CheckCircle, Truck, Bike, Car, AlertCircle, KeyRound } from 'lucide-react'
import Link from 'next/link'

const SUPABASE_URL = 'https://nkxnkcsvtqbbczhnpokt.supabase.co'

export default function CourierRegistration() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', birth_date: '', nationality: 'SK', id_number: '',
    email: '', phone: '', street: '', city: '', postal_code: '',
    vehicle_type: 'bike', drivers_license: '', vehicle_plate: '',
    iban: '', bank_name: '',
    experience: 'none', availability: 'fulltime',
    terms_accepted: false, gdpr_accepted: false
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')

  const validateStep = (currentStep: number) => {
    setError('')
    if (currentStep === 1) {
      if (!formData.first_name || !formData.last_name) { setError('Vyplňte meno a priezvisko'); return false }
      if (!formData.birth_date) { setError('Vyplňte dátum narodenia'); return false }
      if (!formData.id_number) { setError('Vyplňte číslo OP'); return false }
    }
    if (currentStep === 2) {
      if (!formData.email || !formData.phone) { setError('Vyplňte email a telefón'); return false }
      if (!formData.street || !formData.city || !formData.postal_code) { setError('Vyplňte adresu'); return false }
    }
    if (currentStep === 3) {
      if ((formData.vehicle_type === 'scooter' || formData.vehicle_type === 'car') && !formData.drivers_license) {
        setError('Pre skúter/auto je potrebný vodičský preukaz'); return false
      }
    }
    if (currentStep === 4) {
      if (!formData.iban) { setError('Vyplňte IBAN'); return false }
    }
    return true
  }

  const nextStep = () => { if (validateStep(step)) setStep(step + 1) }
  const prevStep = () => { setError(''); setStep(step - 1) }

  const sendOtp = async () => {
    if (!formData.terms_accepted || !formData.gdpr_accepted) {
      setError('Musíte súhlasiť s podmienkami'); return
    }
    setIsSubmitting(true)
    setError('')
    try {
      const res = await fetch(SUPABASE_URL + '/functions/v1/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email.trim().toLowerCase() })
      })
      const data = await res.json()
      if (data.ok) setOtpSent(true)
      else setError('Nepodarilo sa odoslať kód')
    } catch { setError('Chyba pripojenia') }
    setIsSubmitting(false)
  }

  const verifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otpCode.length !== 6) return
    setIsSubmitting(true)
    setError('')

    try {
      const verifyRes = await fetch(SUPABASE_URL + '/functions/v1/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email.trim().toLowerCase(), code: otpCode.trim() })
      })
      const verifyData = await verifyRes.json()

      if (!verifyData.ok) {
        if (verifyData.reason === 'invalid_code') setError('Nesprávny kód')
        else if (verifyData.reason === 'expired') setError('Kód vypršal')
        else setError('Overenie zlyhalo')
        setIsSubmitting(false)
        return
      }

      const res = await fetch('/api/courier-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (data.success) setIsSuccess(true)
      else setError(data.error || 'Registrácia zlyhala')
    } catch { setError('Chyba pripojenia') }
    setIsSubmitting(false)
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Registrácia odoslaná!</h1>
          <p className="text-gray-600 mb-6">
            Ďakujeme! Tvoja žiadosť bude schválená administrátorom do 24 hodín. O schválení ťa informujeme emailom.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-left">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Čo sa stane ďalej?</p>
                <ul className="mt-2 space-y-1">
                  <li>1. Overíme tvoje údaje</li>
                  <li>2. Skontrolujeme doklady</li>
                  <li>3. Aktivujeme účet</li>
                  <li>4. Môžeš začať doručovať!</li>
                </ul>
              </div>
            </div>
          </div>
          <Link href="/kuryr" className="text-black underline">Späť na prihlásenie</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Registrácia kuriéra</h1>
              <p className="text-gray-500 text-sm">Pripoj sa k tímu VORU</p>
            </div>
          </div>
          <div className="flex gap-2">
            {[1,2,3,4,5].map(s => (
              <div key={s} className={`h-2 flex-1 rounded-full ${s <= step ? 'bg-black' : 'bg-gray-200'}`} />
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-2">Krok {step} z 5</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Step 1: Personal */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-bold text-lg mb-4">Osobné údaje</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Meno *</label>
                  <input type="text" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} className="w-full px-4 py-3 bg-gray-100 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Priezvisko *</label>
                  <input type="text" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} className="w-full px-4 py-3 bg-gray-100 rounded-xl" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Dátum narodenia *</label>
                <input type="date" value={formData.birth_date} onChange={e => setFormData({...formData, birth_date: e.target.value})} className="w-full px-4 py-3 bg-gray-100 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Národnosť</label>
                <select value={formData.nationality} onChange={e => setFormData({...formData, nationality: e.target.value})} className="w-full px-4 py-3 bg-gray-100 rounded-xl">
                  <option value="SK">Slovensko</option>
                  <option value="CZ">Česká republika</option>
                  <option value="UA">Ukrajina</option>
                  <option value="PL">Poľsko</option>
                  <option value="OTHER">Iná</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Číslo OP *</label>
                <input type="text" value={formData.id_number} onChange={e => setFormData({...formData, id_number: e.target.value})} className="w-full px-4 py-3 bg-gray-100 rounded-xl" placeholder="napr. EA123456" />
              </div>
            </div>
          )}

          {/* Step 2: Contact */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-bold text-lg mb-4">Kontaktné údaje</h2>
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 bg-gray-100 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Telefón *</label>
                <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 bg-gray-100 rounded-xl" placeholder="+421..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ulica a číslo *</label>
                <input type="text" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} className="w-full px-4 py-3 bg-gray-100 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Mesto *</label>
                  <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-3 bg-gray-100 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">PSČ *</label>
                  <input type="text" value={formData.postal_code} onChange={e => setFormData({...formData, postal_code: e.target.value})} className="w-full px-4 py-3 bg-gray-100 rounded-xl" />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Vehicle */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-bold text-lg mb-4">Dopravný prostriedok</h2>
              <div>
                <label className="block text-sm font-medium mb-2">Typ vozidla *</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { type: 'bike', icon: Bike, label: 'Bicykel' },
                    { type: 'scooter', icon: Truck, label: 'Skúter' },
                    { type: 'car', icon: Car, label: 'Auto' }
                  ].map(({ type, icon: Icon, label }) => (
                    <button key={type} type="button" onClick={() => setFormData({...formData, vehicle_type: type})}
                      className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 ${formData.vehicle_type === type ? 'border-black bg-gray-50' : 'border-gray-200'}`}>
                      <Icon className="w-6 h-6" /><span className="text-sm">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
              {(formData.vehicle_type === 'scooter' || formData.vehicle_type === 'car') && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Číslo vodičského preukazu *</label>
                    <input type="text" value={formData.drivers_license} onChange={e => setFormData({...formData, drivers_license: e.target.value})} className="w-full px-4 py-3 bg-gray-100 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">ŠPZ vozidla</label>
                    <input type="text" value={formData.vehicle_plate} onChange={e => setFormData({...formData, vehicle_plate: e.target.value})} className="w-full px-4 py-3 bg-gray-100 rounded-xl" />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 4: Bank */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="font-bold text-lg mb-4">Bankové údaje</h2>
              <p className="text-sm text-gray-500 mb-4">Pre výplaty za doručené zásielky</p>
              <div>
                <label className="block text-sm font-medium mb-1">IBAN *</label>
                <input type="text" value={formData.iban} onChange={e => setFormData({...formData, iban: e.target.value})} className="w-full px-4 py-3 bg-gray-100 rounded-xl" placeholder="SK89 1234 5678 9012 3456 7890" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Názov banky</label>
                <input type="text" value={formData.bank_name} onChange={e => setFormData({...formData, bank_name: e.target.value})} className="w-full px-4 py-3 bg-gray-100 rounded-xl" />
              </div>
            </div>
          )}

          {/* Step 5: Final + OTP */}
          {step === 5 && !otpSent && (
            <div className="space-y-4">
              <h2 className="font-bold text-lg mb-4">Doplňujúce info</h2>
              <div>
                <label className="block text-sm font-medium mb-1">Skúsenosti</label>
                <select value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} className="w-full px-4 py-3 bg-gray-100 rounded-xl">
                  <option value="none">Žiadne</option>
                  <option value="less1">Menej ako 1 rok</option>
                  <option value="1to3">1-3 roky</option>
                  <option value="more3">Viac ako 3 roky</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Dostupnosť</label>
                <select value={formData.availability} onChange={e => setFormData({...formData, availability: e.target.value})} className="w-full px-4 py-3 bg-gray-100 rounded-xl">
                  <option value="fulltime">Plný úväzok (40+ hod/týždeň)</option>
                  <option value="parttime">Čiastočný (20-40 hod)</option>
                  <option value="flexible">Flexibilne (menej ako 20 hod)</option>
                  <option value="weekends">Len víkendy</option>
                </select>
              </div>
              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium mb-3">Súhlasy</h3>
                <label className="flex items-start gap-3 mb-3 cursor-pointer">
                  <input type="checkbox" checked={formData.terms_accepted} onChange={e => setFormData({...formData, terms_accepted: e.target.checked})} className="mt-1 w-5 h-5" />
                  <span className="text-sm">Súhlasím s <a href="#" className="underline">VOP</a> a <a href="#" className="underline">Pravidlami pre kuriérov</a> *</span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={formData.gdpr_accepted} onChange={e => setFormData({...formData, gdpr_accepted: e.target.checked})} className="mt-1 w-5 h-5" />
                  <span className="text-sm">Súhlasím so spracovaním osobných údajov podľa <a href="#" className="underline">GDPR</a> *</span>
                </label>
              </div>
            </div>
          )}

          {/* Step 5b: OTP */}
          {step === 5 && otpSent && (
            <form onSubmit={verifyAndRegister} className="space-y-4">
              <h2 className="font-bold text-lg mb-4">Overenie emailu</h2>
              <p className="text-sm text-gray-500 mb-4">
                Poslali sme 6-miestny kód na <span className="font-medium text-black">{formData.email}</span>
              </p>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="000000"
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full pl-12 pr-4 py-4 bg-gray-100 rounded-xl text-center text-2xl tracking-widest"
                  maxLength={6}
                  autoFocus
                />
              </div>
              <button type="submit" disabled={isSubmitting || otpCode.length !== 6} className="w-full py-4 bg-black text-white rounded-xl font-semibold disabled:opacity-50">
                {isSubmitting ? 'Odosielam...' : 'Dokončiť registráciu'}
              </button>
              <button type="button" onClick={() => { setOtpSent(false); setOtpCode(''); setError('') }} className="w-full text-gray-500 text-sm hover:text-black">
                ← Späť
              </button>
            </form>
          )}

          {/* Navigation */}
          {!(step === 5 && otpSent) && (
            <div className="flex gap-3 mt-6">
              {step > 1 && (
                <button type="button" onClick={prevStep} className="flex-1 py-4 border-2 border-gray-200 rounded-xl font-semibold">
                  Späť
                </button>
              )}
              {step < 5 ? (
                <button type="button" onClick={nextStep} className="flex-1 py-4 bg-black text-white rounded-xl font-semibold">
                  Ďalej
                </button>
              ) : (
                <button type="button" onClick={sendOtp} disabled={isSubmitting} className="flex-1 py-4 bg-black text-white rounded-xl font-semibold disabled:opacity-50">
                  {isSubmitting ? 'Posielam...' : 'Overiť email'}
                </button>
              )}
            </div>
          )}
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Už máš účet? <Link href="/kuryr" className="text-black underline">Prihlásiť sa</Link>
        </p>
      </div>
    </div>
  )
}
