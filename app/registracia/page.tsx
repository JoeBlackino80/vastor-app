'use client'
import Turnstile from '@/components/Turnstile'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Building2, Mail, Phone, AlertCircle, KeyRound } from 'lucide-react'

const SUPABASE_URL = 'https://nkxnkcsvtqbbczhnpokt.supabase.co'

export default function CustomerRegistration() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [accountType, setAccountType] = useState<'individual' | 'company'>('individual')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [formData, setFormData] = useState({
    email: '', phone: '',
    street: '', city: '', postal_code: '', country: 'Slovensko',
    first_name: '', last_name: '',
    company_name: '', ico: '', dic: '', ic_dph: ''
  })

  const sendOtp = async () => {
    if (!turnstileToken) {
      setError('Počkajte na overenie Turnstile')
      return
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
      if (data.ok) {
        setOtpSent(true)
      } else {
        setError('Nepodarilo sa odoslať kód')
      }
    } catch {
      setError('Chyba pripojenia')
    }
    setIsSubmitting(false)
  }

  const verifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault()
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
        else if (verifyData.reason === 'expired') { setError('Kód vypršal, skúste znova'); setOtpSent(false) }
        else setError('Overenie zlyhalo')
        setIsSubmitting(false)
        return
      }

      const res = await fetch('/api/customer-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, account_type: accountType })
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      localStorage.setItem('customer', JSON.stringify(data.customer))
      router.push('/moj-ucet')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registrácia zlyhala')
    }
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto p-6">
        <button onClick={() => otpSent ? setOtpSent(false) : step > 1 ? setStep(step - 1) : router.back()} className="p-2 hover:bg-gray-100 rounded-full mb-4">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold mb-2">Registrácia</h1>
        <p className="text-gray-600 mb-6">{otpSent ? 'Zadajte kód z e-mailu' : `Krok ${step} z 3`}</p>

        {!otpSent && (
          <div className="flex gap-2 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-black' : 'bg-gray-200'}`} />
            ))}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-500 text-sm mb-4 p-3 bg-red-50 rounded-xl">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        {otpSent ? (
          <form onSubmit={verifyAndRegister} className="space-y-4">
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
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-center text-2xl tracking-widest"
                maxLength={6}
                required
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting || otpCode.length !== 6}
              className="w-full py-4 bg-black text-white rounded-xl font-semibold disabled:opacity-50"
            >
              {isSubmitting ? 'Registrujem...' : 'Dokončiť registráciu'}
            </button>
            <button
              type="button"
              onClick={() => { setOtpSent(false); setOtpCode(''); setError('') }}
              className="w-full text-gray-500 text-sm hover:text-black"
            >
              ← Zmeniť údaje
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            {step === 1 && (
              <>
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
              </>
            )}

            {step === 2 && (
              <>
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
              </>
            )}

            {step === 3 && (
              <>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="email" placeholder="Email *" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl" required />
                </div>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="tel" placeholder="Telefón *" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl" required />
                </div>
                <Turnstile onVerify={setTurnstileToken} />
                <button type="button" onClick={sendOtp} disabled={isSubmitting || !turnstileToken || !formData.email} className="w-full py-4 bg-black text-white rounded-xl font-semibold disabled:opacity-50">
                  {isSubmitting ? 'Posielam...' : 'Overiť email'}
                </button>
              </>
            )}
          </div>
        )}

        <p className="text-center text-gray-500 text-sm mt-6">
          Už máte účet? <Link href="/prihlasenie" className="text-black underline">Prihlásiť sa</Link>
        </p>
      </div>
    </div>
  )
}
