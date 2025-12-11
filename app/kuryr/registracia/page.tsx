'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { UserPlus, CheckCircle, Truck, Bike, Car, AlertCircle, Phone, Lock, RefreshCw } from 'lucide-react'

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
  
  const [smsCode, setSmsCode] = useState('')
  const [pin, setPin] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(0)

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const validateStep = (s: number) => {
    setError('')
    if (s === 1) {
      if (!formData.first_name || !formData.last_name) { setError('Vyplňte meno a priezvisko'); return false }
      if (!formData.birth_date) { setError('Vyplňte dátum narodenia'); return false }
    }
    if (s === 2) {
      if (!formData.phone) { setError('Vyplňte telefón'); return false }
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

  const sendSmsOtp = async (isResend = false) => {
    if (!isResend && !validateStep(4)) return
    setIsSubmitting(true)
    setError('')
    
    try {
      if (!isResend) {
        const checkRes = await fetch('/api/check-account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: formData.phone, type: 'courier' })
        })
        const checkData = await checkRes.json()
        if (checkData.exists) { 
          setError('Telefón už je registrovaný'); 
          setIsSubmitting(false); 
          return 
        }
      }

      const res = await fetch(SUPABASE_URL + '/functions/v1/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone })
      })
      
      if ((await res.json()).ok) {
        setSmsCode('')
        setResendTimer(60)
        if (!isResend) setStep(5)
      } else {
        setError('Nepodarilo sa odoslať SMS')
      }
    } catch { 
      setError('Chyba pripojenia') 
    }
    setIsSubmitting(false)
  }

  const verifySmsOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    
    try {
      const res = await fetch(SUPABASE_URL + '/functions/v1/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.phone, code: smsCode.trim() })
      })
      const data = await res.json()
      
      if (!data.ok) { 
        setError(data.reason === 'expired' ? 'Kód vypršal' : 'Nesprávny kód'); 
        setIsSubmitting(false); 
        return 
      }

      setStep(6)
    } catch { 
      setError('Chyba pripojenia') 
    }
    setIsSubmitting(false)
  }

  const completeRegistration = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (pin.length !== 4) {
      setError('PIN musí mať 4 číslice')
      return
    }
    if (pin !== pinConfirm) {
      setError('PIN kódy sa nezhodujú')
      return
    }

    setIsSubmitting(true)
    
    try {
      // Register courier
      const regRes = await fetch('/api/courier-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const regData = await regRes.json()
      
      if (!regData.success) {
        setError(regData.error || 'Registrácia zlyhala')
        setIsSubmitting(false)
        return
      }

      // Set PIN
      const pinRes = await fetch('/api/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set',
          type: 'courier',
          phone: formData.phone,
          pin: pin
        })
      })
      
      if (!pinRes.ok) throw new Error('Chyba pri nastavení PIN')

      localStorage.setItem('courier_phone', formData.phone)
      setIsSuccess(true)
    } catch (err: any) { 
      setError(err.message || 'Chyba pripojenia') 
    }
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
          <p className="text-gray-600 mb-4">Vaša žiadosť bude preverená do 24 hodín. Po schválení sa môžete prihlásiť pomocou telefónu a PIN.</p>
          <Link href="/kuryr" className="text-black underline">Späť na prihlásenie</Link>
        </div>
      </div>
    )
  }

  const totalSteps = 6

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
              <p className="text-gray-500 text-sm">Krok {step} z {totalSteps}</p>
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
              <p className="text-sm text-gray-500">Telefón použijete na prihlásenie</p>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="tel" placeholder="Telefón * (+421...)" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-xl" />
              </div>
              <input type="email" placeholder="Email (voliteľný)" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 bg-gray-100 rounded-xl" />
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
            </div>
          )}

          {step === 5 && (
            <form onSubmit={verifySmsOtp} className="space-y-4">
              <h2 className="font-bold">📱 Overenie telefónu</h2>
              <p className="text-sm text-gray-500">SMS sme poslali na {maskPhone(formData.phone)}</p>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" placeholder="000000" value={smsCode} onChange={e => setSmsCode(e.target.value.replace(/\D/g,'').slice(0,6))} className="w-full pl-12 pr-4 py-4 bg-gray-100 rounded-xl text-center text-2xl tracking-widest" maxLength={6} autoFocus />
              </div>
              <button type="submit" disabled={isSubmitting || smsCode.length !== 6} className="w-full py-4 bg-black text-white rounded-xl font-semibold disabled:opacity-50">{isSubmitting ? 'Overujem...' : 'Overiť SMS'}</button>
              <button type="button" onClick={() => sendSmsOtp(true)} disabled={resendTimer > 0 || isSubmitting}
                className="w-full py-3 text-gray-600 flex items-center justify-center gap-2 disabled:opacity-50">
                <RefreshCw className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
                {resendTimer > 0 ? `Znova odoslať (${resendTimer}s)` : 'Odoslať SMS znova'}
              </button>
            </form>
          )}

          {step === 6 && (
            <form onSubmit={completeRegistration} className="space-y-4">
              <h2 className="font-bold">🔐 Nastavte si PIN</h2>
              <p className="text-sm text-gray-500">4-miestny PIN pre rýchle prihlásenie</p>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="password" 
                  inputMode="numeric"
                  placeholder="PIN" 
                  value={pin} 
                  onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} 
                  className="w-full pl-12 pr-4 py-4 bg-gray-100 rounded-xl text-center text-2xl tracking-widest" 
                  maxLength={4} 
                  autoFocus 
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="password"
                  inputMode="numeric" 
                  placeholder="Potvrďte PIN" 
                  value={pinConfirm} 
                  onChange={e => setPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 4))} 
                  className="w-full pl-12 pr-4 py-4 bg-gray-100 rounded-xl text-center text-2xl tracking-widest" 
                  maxLength={4} 
                />
              </div>
              <button type="submit" disabled={isSubmitting || pin.length !== 4 || pinConfirm.length !== 4} className="w-full py-4 bg-black text-white rounded-xl font-semibold disabled:opacity-50">
                {isSubmitting ? 'Registrujem...' : 'Dokončiť registráciu'}
              </button>
            </form>
          )}

          {step <= 4 && (
            <div className="flex gap-3 mt-6">
              {step > 1 && <button type="button" onClick={prevStep} className="flex-1 py-4 border-2 border-gray-200 rounded-xl font-semibold">Späť</button>}
              {step < 4 ? (
                <button type="button" onClick={nextStep} className="flex-1 py-4 bg-black text-white rounded-xl font-semibold">Ďalej</button>
              ) : (
                <button type="button" onClick={() => sendSmsOtp()} disabled={isSubmitting} className="flex-1 py-4 bg-black text-white rounded-xl font-semibold disabled:opacity-50">{isSubmitting ? 'Posielam...' : 'Overiť telefón'}</button>
              )}
            </div>
          )}
        </div>
        <p className="text-center text-gray-500 text-sm mt-6">Už máš účet? <Link href="/kuryr" className="text-black underline">Prihlásiť sa</Link></p>
      </div>
    </div>
  )
}
