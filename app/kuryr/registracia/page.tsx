'use client'
import { useState } from 'react'
import Link from 'next/link'
import { UserPlus, CheckCircle, Truck, Bike, Car, AlertCircle, KeyRound, Phone } from 'lucide-react'
import Turnstile from '@/components/Turnstile'

const SUPABASE_URL = 'https://nkxnkcsvtqbbczhnpokt.supabase.co'

export default function CourierRegistration() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', birth_date: '', nationality: 'SK', id_number: '',
    email: '', phone: '',
    street: '', city: '', postal_code: '',
    vehicle_type: 'bike', drivers_license: '', vehicle_plate: '',
    iban: '', bank_name: '',
    terms_accepted: false, gdpr_accepted: false
  })
  
  const [emailCode, setEmailCode] = useState('')
  const [smsCode, setSmsCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')

  const validateStep = (s: number) => {
    setError('')
    if (s === 1) {
      if (!formData.first_name || !formData.last_name) { setError('Vyplňte meno a priezvisko'); return false }
      if (!formData.birth_date) { setError('Vyplňte dátum narodenia'); return false }
    }
    if (s === 2) {
      if (!formData.email || !formData.phone) { setError('Vyplňte email a telefón'); return false }
      if (!formData.street || !formData.city) { setError('Vyplňte adresu'); return false }
    }
    if (s === 3) {
      if ((formData.vehicle_type === 'scooter' || formData.vehicle_type === 'car') && !formData.drivers_license) {
        setError('Pre skúter/auto je potrebný vodičák'); return false
      }
    }
    if (s === 4) {
      if (!formData.iban) { setError('Vyplňte IBAN'); return false }
      if (!formData.terms_accepted || !formData.gdpr_accepted) { setError('Musíte súhlasiť s podmienkami'); return false }
    }
    return true
  }

  const nextStep = () => { if (validateStep(step)) setStep(step + 1) }
  const prevStep = () => { setError(''); setStep(step - 1) }

  const sendEmailOtp = async () => {
    if (!validateStep(4) || !turnstileToken) return
    setIsSubmitting(true)
    setError('')
    try {
      const checkRes = await fetch('/api/check-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email.trim().toLowerCase(), type: 'courier' })
      })
      const checkData = await checkRes.json()
      if (checkData.exists) { setError('Email už je registrovaný'); setIsSubmitting(false); return }

      const res = await fetch(SUPABASE_URL + '/functions/v1/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email.trim().toLowerCase() })
      })
      if ((await res.json()).ok) setStep(5)
      else setError('Nepodarilo sa odoslať kód')
    } catch { setError('Chyba pripojenia') }
    setIsSubmitting(false)
  }

  const verifyEmailAndSendSms = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    try {
      const res = await fetch(SUPABASE_URL + '/functions/v1/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email.trim().toLowerCase(), code: emailCode.trim() })
      })
      const data = await res.json()
      if (!data.ok) { setError(data.reason === 'invalid_code' ? 'Nesprávny kód' : 'Kód vypršal'); setIsSubmitting(false); return }

      const smsRes = await fetch(SUPABASE_URL + '/functions/v1/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone })
      })
      if ((await smsRes.json()).ok) setStep(6)
      else setError('Nepodarilo sa odoslať SMS')
    } catch { setError('Chyba pripojenia') }
    setIsSubmitting(false)
  }

  const verifySmsAndRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    try {
      const res = await fetch(SUPABASE_URL + '/functions/v1/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.phone, code: smsCode.trim() })
      })
      if (!(await res.json()).ok) { setError('Nesprávny SMS kód'); setIsSubmitting(false); return }

      const regRes = await fetch('/api/courier-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if ((await regRes.json()).success) setIsSuccess(true)
      else setError('Registrácia zlyhala')
    } catch { setError('Chyba pripojenia') }
    setIsSubmitting(false)
  }

  const maskPhone = (p: string) => p ? p.slice(0, 4) + '***' + p.slice(-3) : ''

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Registrácia odoslaná!</h1>
          <p className="text-gray-600 mb-4">Vaša žiadosť bude preverená do 24 hodín.</p>
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
              <p className="text-gray-500 text-sm">Krok {step} z 6</p>
            </div>
          </div>
          <div className="flex gap-1">
            {[1,2,3,4,5,6].map(s => (
              <div key={s} className={`h-1 flex-1 rounded-full ${s < step ? 'bg-green-500' : s === step ? 'bg-black' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          {error && <div className="mb-4 p-3 bg-red-50 rounded-xl text-red-600 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-bold">Osobné údaje</h2>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Meno *" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} className="px-4 py-3 bg-gray-100 rounded-xl" />
                <input placeholder="Priezvisko *" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} className="px-4 py-3 bg-gray-100 rounded-xl" />
              </div>
              <input type="date" value={formData.birth_date} onChange={e => setFormData({...formData, birth_date: e.target.value})} className="w-full px-4 py-3 bg-gray-100 rounded-xl" />
              <input placeholder="Číslo OP" value={formData.id_number} onChange={e => setFormData({...formData, id_number: e.target.value})} className="w-full px-4 py-3 bg-gray-100 rounded-xl" />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-bold">Kontakt a adresa</h2>
              <input type="email" placeholder="Email *" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 bg-gray-100 rounded-xl" />
              <input type="tel" placeholder="Telefón * (+421...)" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 bg-gray-100 rounded-xl" />
              <input placeholder="Ulica *" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} className="w-full px-4 py-3 bg-gray-100 rounded-xl" />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Mesto *" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="px-4 py-3 bg-gray-100 rounded-xl" />
                <input placeholder="PSČ" value={formData.postal_code} onChange={e => setFormData({...formData, postal_code: e.target.value})} className="px-4 py-3 bg-gray-100 rounded-xl" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-bold">Vozidlo</h2>
              <div className="grid grid-cols-3 gap-3">
                {[{t:'bike',n:'Bicykel',i:Bike},{t:'scooter',n:'Skúter',i:Truck},{t:'car',n:'Auto',i:Car}].map(v => (
                  <button key={v.t} type="button" onClick={() => setFormData({...formData, vehicle_type: v.t})} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 ${formData.vehicle_type === v.t ? 'border-black bg-gray-50' : 'border-gray-200'}`}>
                    <v.i className="w-6 h-6" /><span className="text-sm">{v.n}</span>
                  </button>
                ))}
              </div>
              {(formData.vehicle_type === 'scooter' || formData.vehicle_type === 'car') && (
                <input placeholder="Vodičák *" value={formData.drivers_license} onChange={e => setFormData({...formData, drivers_license: e.target.value})} className="w-full px-4 py-3 bg-gray-100 rounded-xl" />
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="font-bold">Banka a súhlasy</h2>
              <input placeholder="IBAN *" value={formData.iban} onChange={e => setFormData({...formData, iban: e.target.value})} className="w-full px-4 py-3 bg-gray-100 rounded-xl" />
              <label className="flex items-start gap-3"><input type="checkbox" checked={formData.terms_accepted} onChange={e => setFormData({...formData, terms_accepted: e.target.checked})} className="mt-1 w-5 h-5" /><span className="text-sm">Súhlasím s VOP *</span></label>
              <label className="flex items-start gap-3"><input type="checkbox" checked={formData.gdpr_accepted} onChange={e => setFormData({...formData, gdpr_accepted: e.target.checked})} className="mt-1 w-5 h-5" /><span className="text-sm">Súhlasím s GDPR *</span></label>
              <Turnstile onVerify={setTurnstileToken} />
            </div>
          )}

          {step === 5 && (
            <form onSubmit={verifyEmailAndSendSms} className="space-y-4">
              <h2 className="font-bold">📧 Overenie e-mailu</h2>
              <p className="text-sm text-gray-500">Kód sme poslali na {formData.email}</p>
              <input type="text" placeholder="000000" value={emailCode} onChange={e => setEmailCode(e.target.value.replace(/\D/g,'').slice(0,6))} className="w-full px-4 py-4 bg-gray-100 rounded-xl text-center text-2xl tracking-widest" maxLength={6} autoFocus />
              <button type="submit" disabled={isSubmitting || emailCode.length !== 6} className="w-full py-4 bg-black text-white rounded-xl font-semibold disabled:opacity-50">{isSubmitting ? 'Overujem...' : 'Overiť'}</button>
            </form>
          )}

          {step === 6 && (
            <form onSubmit={verifySmsAndRegister} className="space-y-4">
              <h2 className="font-bold">📱 Overenie telefónu</h2>
              <p className="text-sm text-gray-500">SMS sme poslali na {maskPhone(formData.phone)}</p>
              <input type="text" placeholder="000000" value={smsCode} onChange={e => setSmsCode(e.target.value.replace(/\D/g,'').slice(0,6))} className="w-full px-4 py-4 bg-gray-100 rounded-xl text-center text-2xl tracking-widest" maxLength={6} autoFocus />
              <button type="submit" disabled={isSubmitting || smsCode.length !== 6} className="w-full py-4 bg-black text-white rounded-xl font-semibold disabled:opacity-50">{isSubmitting ? 'Registrujem...' : 'Dokončiť'}</button>
            </form>
          )}

          {step <= 4 && (
            <div className="flex gap-3 mt-6">
              {step > 1 && <button type="button" onClick={prevStep} className="flex-1 py-4 border-2 border-gray-200 rounded-xl font-semibold">Späť</button>}
              {step < 4 ? (
                <button type="button" onClick={nextStep} className="flex-1 py-4 bg-black text-white rounded-xl font-semibold">Ďalej</button>
              ) : (
                <button type="button" onClick={sendEmailOtp} disabled={isSubmitting || !turnstileToken} className="flex-1 py-4 bg-black text-white rounded-xl font-semibold disabled:opacity-50">{isSubmitting ? 'Posielam...' : 'Overiť email'}</button>
              )}
            </div>
          )}
        </div>
        <p className="text-center text-gray-500 text-sm mt-6">Už máš účet? <Link href="/kuryr" className="text-black underline">Prihlásiť sa</Link></p>
      </div>
    </div>
  )
}
