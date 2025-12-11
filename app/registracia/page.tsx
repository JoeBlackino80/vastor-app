'use client'
import Turnstile from '@/components/Turnstile'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Building2, User, ArrowLeft, CheckCircle, AlertCircle, KeyRound, Phone, RefreshCw } from 'lucide-react'

export default function RegistrationPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [accountType, setAccountType] = useState<'individual' | 'company'>('individual')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [emailCode, setEmailCode] = useState('')
  const [smsCode, setSmsCode] = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    ico: '',
    dic: '',
    icDph: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    postalCode: ''
  })

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const updateForm = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const maskPhone = (phone: string) => {
    if (phone.length < 6) return phone
    return phone.slice(0, 4) + ' *** ' + phone.slice(-3)
  }

  const nextStep = () => {
    setError('')
    if (step === 1 && !accountType) {
      setError('Vyberte typ účtu')
      return
    }
    if (step === 2) {
      if (accountType === 'individual' && (!formData.firstName || !formData.lastName)) {
        setError('Vyplňte meno a priezvisko')
        return
      }
      if (accountType === 'company' && !formData.companyName) {
        setError('Vyplňte názov firmy')
        return
      }
    }
    if (step === 3) {
      if (!formData.email || !formData.phone) {
        setError('Vyplňte email a telefón')
        return
      }
    }
    setStep(step + 1)
  }

  const prevStep = () => {
    setError('')
    setStep(step - 1)
  }

  const sendEmailOtp = async (isResend = false) => {
    setError('')
    setIsSubmitting(true)
    
    try {
      if (!isResend) {
        const checkRes = await fetch('/api/check-account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, type: 'customer' })
        })
        const checkData = await checkRes.json()
        if (checkData.exists) {
          setError('Účet s týmto emailom už existuje. Môžete sa prihlásiť.')
          setIsSubmitting(false)
          return
        }
      }

      const res = await fetch('https://nkxnkcsvtqbbczhnpokt.supabase.co/functions/v1/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      })
      
      if (!res.ok) throw new Error('Nepodarilo sa odoslať kód')
      
      setEmailCode('')
      setResendTimer(60)
      if (!isResend) setStep(4)
    } catch (err) {
      setError('Chyba pri odosielaní kódu')
    } finally {
      setIsSubmitting(false)
    }
  }

  const verifyEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    
    try {
      const res = await fetch('https://nkxnkcsvtqbbczhnpokt.supabase.co/functions/v1/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, code: emailCode })
      })
      
      const data = await res.json()
      if (!data.valid) {
        setError(data.error === 'expired' ? 'Kód vypršal, vyžiadajte nový' : 'Nesprávny kód')
        setIsSubmitting(false)
        return
      }
      
      await sendSmsOtp()
      setStep(5)
    } catch (err) {
      setError('Chyba pri overovaní')
    } finally {
      setIsSubmitting(false)
    }
  }

  const sendSmsOtp = async (isResend = false) => {
    try {
      const res = await fetch('https://nkxnkcsvtqbbczhnpokt.supabase.co/functions/v1/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone })
      })
      
      if (!res.ok) throw new Error('SMS error')
      
      setSmsCode('')
      setResendTimer(60)
    } catch (err) {
      setError('Nepodarilo sa odoslať SMS')
    }
  }

  const verifySmsAndRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    
    try {
      const verifyRes = await fetch('https://nkxnkcsvtqbbczhnpokt.supabase.co/functions/v1/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone, code: smsCode })
      })
      
      const verifyData = await verifyRes.json()
      if (!verifyData.valid) {
        setError(verifyData.error === 'expired' ? 'Kód vypršal' : 'Nesprávny kód')
        setIsSubmitting(false)
        return
      }

      const res = await fetch('/api/customer-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          accountType,
          turnstileToken
        })
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Chyba registrácie')
      
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Chyba pri registrácii')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Registrácia úspešná!</h1>
          <p className="text-gray-600 mb-6">Váš účet bol vytvorený.</p>
          <Link href="/prihlasenie" className="inline-block px-6 py-3 bg-black text-white rounded-xl font-semibold">
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

        {step === 1 && (
          <div className="space-y-4">
            <p className="font-medium mb-4">Vyberte typ účtu:</p>
            <button type="button" onClick={() => setAccountType('individual')}
              className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 ${accountType === 'individual' ? 'border-black bg-gray-50' : 'border-gray-200'}`}>
              <User className="w-6 h-6" />
              <div className="text-left">
                <div className="font-semibold">Fyzická osoba</div>
                <div className="text-sm text-gray-500">Pre osobné použitie</div>
              </div>
            </button>
            <button type="button" onClick={() => setAccountType('company')}
              className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 ${accountType === 'company' ? 'border-black bg-gray-50' : 'border-gray-200'}`}>
              <Building2 className="w-6 h-6" />
              <div className="text-left">
                <div className="font-semibold">Firma / Živnostník</div>
                <div className="text-sm text-gray-500">Pre firemné účely</div>
              </div>
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            {accountType === 'individual' ? (
              <>
                <input type="text" placeholder="Meno *" value={formData.firstName} onChange={e => updateForm('firstName', e.target.value)} className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl" />
                <input type="text" placeholder="Priezvisko *" value={formData.lastName} onChange={e => updateForm('lastName', e.target.value)} className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl" />
              </>
            ) : (
              <>
                <input type="text" placeholder="Názov firmy *" value={formData.companyName} onChange={e => updateForm('companyName', e.target.value)} className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl" />
                <input type="text" placeholder="IČO" value={formData.ico} onChange={e => updateForm('ico', e.target.value)} className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl" />
                <input type="text" placeholder="DIČ" value={formData.dic} onChange={e => updateForm('dic', e.target.value)} className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl" />
                <input type="text" placeholder="IČ DPH" value={formData.icDph} onChange={e => updateForm('icDph', e.target.value)} className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl" />
              </>
            )}
            <input type="text" placeholder="Ulica a číslo" value={formData.street} onChange={e => updateForm('street', e.target.value)} className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl" />
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Mesto" value={formData.city} onChange={e => updateForm('city', e.target.value)} className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl" />
              <input type="text" placeholder="PSČ" value={formData.postalCode} onChange={e => updateForm('postalCode', e.target.value)} className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl" />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <input type="email" placeholder="Email *" value={formData.email} onChange={e => updateForm('email', e.target.value)} className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl" />
            <input type="tel" placeholder="Telefón *" value={formData.phone} onChange={e => updateForm('phone', e.target.value)} className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl" />
            <Turnstile onVerify={setTurnstileToken} />
          </div>
        )}

        {step === 4 && (
          <form onSubmit={verifyEmailOtp} className="space-y-4">
            <p className="text-sm text-gray-500 mb-4">
              Poslali sme overovací kód na <span className="font-medium text-black">{formData.email}</span>
            </p>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder="000000" value={emailCode} onChange={e => setEmailCode(e.target.value.replace(/\D/g, '').slice(0, 6))} className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-center text-2xl tracking-widest" maxLength={6} autoFocus />
            </div>
            <button type="submit" disabled={isSubmitting || emailCode.length !== 6} className="w-full py-4 bg-black text-white rounded-xl font-semibold disabled:opacity-50">
              {isSubmitting ? 'Overujem...' : 'Overiť email'}
            </button>
            <button type="button" onClick={() => sendEmailOtp(true)} disabled={resendTimer > 0 || isSubmitting}
              className="w-full py-3 text-gray-600 flex items-center justify-center gap-2 disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
              {resendTimer > 0 ? `Znova odoslať (${resendTimer}s)` : 'Odoslať email znova'}
            </button>
          </form>
        )}

        {step === 5 && (
          <form onSubmit={verifySmsAndRegister} className="space-y-4">
            <p className="text-sm text-gray-500 mb-4">
              Poslali sme SMS kód na <span className="font-medium text-black">{maskPhone(formData.phone)}</span>
            </p>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder="000000" value={smsCode} onChange={e => setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 6))} className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-center text-2xl tracking-widest" maxLength={6} autoFocus />
            </div>
            <button type="submit" disabled={isSubmitting || smsCode.length !== 6} className="w-full py-4 bg-black text-white rounded-xl font-semibold disabled:opacity-50">
              {isSubmitting ? 'Registrujem...' : 'Dokončiť registráciu'}
            </button>
            <button type="button" onClick={() => sendSmsOtp(true)} disabled={resendTimer > 0 || isSubmitting}
              className="w-full py-3 text-gray-600 flex items-center justify-center gap-2 disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
              {resendTimer > 0 ? `Znova odoslať (${resendTimer}s)` : 'Odoslať SMS znova'}
            </button>
          </form>
        )}

        {step <= 3 && (
          <div className="flex gap-3 mt-6">
            {step > 1 && <button type="button" onClick={prevStep} className="flex-1 py-4 border-2 border-gray-200 rounded-xl font-semibold">Späť</button>}
            {step < 3 ? (
              <button type="button" onClick={nextStep} className="flex-1 py-4 bg-black text-white rounded-xl font-semibold">Ďalej</button>
            ) : (
              <button type="button" onClick={() => sendEmailOtp()} disabled={isSubmitting || !turnstileToken} className="flex-1 py-4 bg-black text-white rounded-xl font-semibold disabled:opacity-50">
                {isSubmitting ? 'Posielam...' : 'Overiť email'}
              </button>
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
