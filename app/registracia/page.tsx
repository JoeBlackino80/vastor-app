'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Building2, Mail, Phone, CheckCircle, AlertCircle, KeyRound } from 'lucide-react'
import Turnstile from '@/components/Turnstile'

const SUPABASE_URL = 'https://nkxnkcsvtqbbczhnpokt.supabase.co'

export default function CustomerRegistration() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [accountType, setAccountType] = useState<'individual' | 'company'>('individual')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')
  const [success, setSuccess] = useState(false)
  
  const [emailCode, setEmailCode] = useState('')
  const [smsCode, setSmsCode] = useState('')
  
  const [formData, setFormData] = useState({
    email: '', phone: '',
    street: '', city: '', postal_code: '', country: 'Slovensko',
    first_name: '', last_name: '',
    company_name: '', ico: '', dic: '', ic_dph: ''
  })

  // Step 3: Send email OTP
  const sendEmailOtp = async () => {
    if (!formData.email || !turnstileToken) return
    setIsSubmitting(true)
    setError('')

    try {
      // Check if email already exists
      const checkRes = await fetch('/api/check-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email.trim().toLowerCase(), type: 'customer' })
      })
      const checkData = await checkRes.json()

      if (checkData.exists) {
        setError('Email už je registrovaný. Chcete sa prihlásiť?')
        setIsSubmitting(false)
        return
      }

      const res = await fetch(SUPABASE_URL + '/functions/v1/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email.trim().toLowerCase() })
      })
      const data = await res.json()

      if (data.ok) {
        setStep(4)
      } else {
        setError('Nepodarilo sa odoslať kód')
      }
    } catch {
      setError('Chyba pripojenia')
    }
    setIsSubmitting(false)
  }

  // Step 4: Verify email and send SMS
  const verifyEmailAndSendSms = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailCode) return
    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch(SUPABASE_URL + '/functions/v1/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email.trim().toLowerCase(), code: emailCode.trim() })
      })
      const data = await res.json()

      if (!data.ok) {
        if (data.reason === 'invalid_code') setError('Nesprávny kód')
        else if (data.reason === 'expired') { setError('Kód vypršal'); setStep(3) }
        else setError('Overenie zlyhalo')
        setIsSubmitting(false)
        return
      }

      // Send SMS
      const smsRes = await fetch(SUPABASE_URL + '/functions/v1/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone })
      })
      const smsData = await smsRes.json()

      if (smsData.ok) {
        setStep(5)
      } else {
        setError('Nepodarilo sa odoslať SMS')
      }
    } catch {
      setError('Chyba pripojenia')
    }
    setIsSubmitting(false)
  }

  // Step 5: Verify SMS and create account
  const verifySmsAndRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!smsCode) return
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
        if (data.reason === 'invalid_code') setError('Nesprávny SMS kód')
        else if (data.reason === 'expired') { setError('SMS kód vypršal'); setStep(4) }
        else setError('Overenie zlyhalo')
        setIsSubmitting(false)
        return
      }

      // Create account
      const regRes = await fetch('/api/customer-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, account_type: accountType })
      })
      const regData = await regRes.json()

      if (regRes.ok) {
        setSuccess(true)
      } else {
        setError(regData.error || 'Registrácia zlyhala')
      }
    } catch {
      setError('Chyba pripojenia')
    }
    setIsSubmitting(false)
  }

  const maskPhone = (p: string) => {
    if (!p) return ''
    const clean = p.replace(/\s/g, '')
    return clean.slice(0, 4) + ' *** ' + clean.slice(-3)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Registrácia úspešná!</h1>
          <p className="text-gray-600 mb-6">Teraz sa môžete prihlásiť.</p>
          <Link href="/prihlasenie" className="block w-full py-4 bg-black text-white rounded-xl font-semibold">
            Prihlásiť sa
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto p-6">
        <button onClick={() => step > 1 ? setStep(step - 1) : router.back()} className="p-2 hover:bg-gray-100 rounded-full mb-4">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold mb-2">Registrácia</h1>
        <p className="text-gray-600 mb-6">Krok {step} z 5</p>
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i < step ? 'bg-green-500' : i === step ? 'bg-black' : 'bg-gray-200'}`} />
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-500 text-sm mb-4 p-3 bg-red-50 rounded-xl">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
            {error.includes('prihlásiť') && (
              <Link href="/prihlasenie" className="ml-auto text-black underline font-medium">Prihlásiť</Link>
            )}
          </div>
        )}

        {/* Step 1: Account type */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="font-medium mb-4">Vyberte typ účtu:</p>
            <button type="button" onClick={() => setAccountType('individual')}
              className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 ${accountType === 'individual' ? 'border-black bg-gray-50' : 'border-gray-200'}`}>
              <User className="w-6 h-6" />
              <div className="text-left"><p className="font-medium">Pre seba</p><p className="text-sm text-gray-500">Osobné objednávky</p></div>
            </button>
            <button type="button" onClick={() => setAccountType('company')}
              className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 ${accountType === 'company' ? 'border-black bg-gray-50' : 'border-gray-200'}`}>
              <Building2 className="w-6 h-6" />
              <div className="text-left"><p className="font-medium">Pre firmu</p><p className="text-sm text-gray-500">Firemné objednávky</p></div>
            </button>
            <button type="button" onClick={() => setStep(2)} className="w-full py-4 bg-black text-white rounded-xl font-semibold mt-4">
              Pokračovať
            </button>
          </div>
        )}

        {/* Step 2: Personal/Company info */}
        {step === 2 && (
          <div className="space-y-4">
            {accountType === 'individual' ? (
              <>
                <input type="text" placeholder="Meno *" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl" required />
                <input type="text" placeholder="Priezvisko *" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl" required />
              </>
            ) : (
              <>
                <input type="text" placeholder="Názov spoločnosti *" value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl" required />
                <input type="text" placeholder="IČO *" value={formData.ico} onChange={e => setFormData({...formData, ico: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl" required />
                <input type="text" placeholder="DIČ" value={formData.dic} onChange={e => setFormData({...formData, dic: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl" />
                <input type="text" placeholder="IČ DPH" value={formData.ic_dph} onChange={e => setFormData({...formData, ic_dph: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl" />
              </>
            )}
            <div className="pt-2">
              <p className="text-sm font-medium text-gray-700 mb-2">Adresa</p>
              <input type="text" placeholder="Ulica a číslo *" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl mb-2" required />
              <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="Mesto *" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl" required />
                <input type="text" placeholder="PSČ *" value={formData.postal_code} onChange={e => setFormData({...formData, postal_code: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl" required />
              </div>
            </div>
            <button type="button" onClick={() => setStep(3)} className="w-full py-4 bg-black text-white rounded-xl font-semibold">
              Pokračovať
            </button>
          </div>
        )}

        {/* Step 3: Email & Phone */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="email" placeholder="Email *" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl" required />
            </div>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="tel" placeholder="Telefón * (+421...)" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl" required />
            </div>
            <Turnstile onVerify={setTurnstileToken} />
            <button type="button" onClick={sendEmailOtp} disabled={isSubmitting || !turnstileToken || !formData.email || !formData.phone} className="w-full py-4 bg-black text-white rounded-xl font-semibold disabled:opacity-50">
              {isSubmitting ? 'Posielam...' : 'Overiť email'}
            </button>
          </div>
        )}

        {/* Step 4: Email verification */}
        {step === 4 && (
          <form onSubmit={verifyEmailAndSendSms} className="space-y-4">
            <p className="text-sm text-gray-500 mb-4">
              Poslali sme 6-miestny kód na <span className="font-medium text-black">{formData.email}</span>
            </p>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder="000000" value={emailCode} onChange={e => setEmailCode(e.target.value.replace(/\D/g, '').slice(0, 6))} className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-center text-2xl tracking-widest" maxLength={6} required autoFocus />
            </div>
            <button type="submit" disabled={isSubmitting || emailCode.length !== 6} className="w-full py-4 bg-black text-white rounded-xl font-semibold disabled:opacity-50">
              {isSubmitting ? 'Overujem...' : 'Overiť e-mail'}
            </button>
          </form>
        )}

        {/* Step 5: SMS verification */}
        {step === 5 && (
          <form onSubmit={verifySmsAndRegister} className="space-y-4">
            <p className="text-sm text-gray-500 mb-4">
              Poslali sme SMS kód na <span className="font-medium text-black">{maskPhone(formData.phone)}</span>
            </p>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder="000000" value={smsCode} onChange={e => setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 6))} className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-center text-2xl tracking-widest" maxLength={6} required autoFocus />
            </div>
            <button type="submit" disabled={isSubmitting || smsCode.length !== 6} className="w-full py-4 bg-black text-white rounded-xl font-semibold disabled:opacity-50">
              {isSubmitting ? 'Registrujem...' : 'Dokončiť registráciu'}
            </button>
          </form>
        )}

        <p className="text-center text-gray-500 text-sm mt-6">
          Už máte účet? <Link href="/prihlasenie" className="text-black underline">Prihlásiť sa</Link>
        </p>
      </div>
    </div>
  )
}
