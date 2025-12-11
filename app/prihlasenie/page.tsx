'use client'
import Turnstile from '@/components/Turnstile'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Phone, KeyRound, AlertCircle, ArrowLeft } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [method, setMethod] = useState<'email' | 'sms'>('email')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [customerId, setCustomerId] = useState<string | null>(null)

  const sendOtp = async () => {
    setError('')
    setIsSubmitting(true)
    
    try {
      // Check if account exists
      const checkRes = await fetch('/api/check-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'customer' })
      })
      const checkData = await checkRes.json()
      
      if (!checkData.exists) {
        setError('Účet neexistuje. Zaregistrujte sa.')
        setIsSubmitting(false)
        return
      }
      
      setCustomerId(checkData.id)
      
      // Send OTP based on selected method
      if (method === 'email') {
        const res = await fetch('https://nkxnkcsvtqbbczhnpokt.supabase.co/functions/v1/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        })
        if (!res.ok) throw new Error('Nepodarilo sa odoslať kód')
      } else {
        // Use phone from account
        if (!checkData.phone) {
          setError('Účet nemá telefónne číslo. Použite email.')
          setIsSubmitting(false)
          return
        }
        setPhone(checkData.phone)
        const res = await fetch('https://nkxnkcsvtqbbczhnpokt.supabase.co/functions/v1/send-sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: checkData.phone })
        })
        if (!res.ok) throw new Error('Nepodarilo sa odoslať SMS')
      }
      
      setCode('')
      setStep(2)
    } catch (err) {
      setError('Chyba pri odosielaní kódu')
    } finally {
      setIsSubmitting(false)
    }
  }

  const verifyAndLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    
    try {
      const verifyRes = await fetch('https://nkxnkcsvtqbbczhnpokt.supabase.co/functions/v1/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(method === 'email' ? { email, code } : { phone, code })
      })
      
      const verifyData = await verifyRes.json()
      if (!verifyData.valid) {
        setError(verifyData.error === 'expired' ? 'Kód vypršal, vyžiadajte nový' : 'Nesprávny kód')
        setIsSubmitting(false)
        return
      }
      
      // Get customer data and login
      const loginRes = await fetch('/api/customer-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp_verified: true })
      })
      
      const loginData = await loginRes.json()
      if (!loginRes.ok) throw new Error(loginData.error || 'Chyba prihlásenia')
      
      localStorage.setItem('customer', JSON.stringify(loginData.customer))
      router.push('/moj-ucet')
    } catch (err: any) {
      setError(err.message || 'Chyba pri overovaní')
    } finally {
      setIsSubmitting(false)
    }
  }

  const maskPhone = (p: string) => p ? p.slice(0, 4) + ' *** ' + p.slice(-3) : ''

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto p-6">
        {step === 2 && (
          <button onClick={() => setStep(1)} className="p-2 hover:bg-gray-100 rounded-full mb-4">
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}
        
        <h1 className="text-2xl font-bold mb-2">Prihlásenie</h1>
        <p className="text-gray-600 mb-6">
          {step === 1 ? 'Zadajte email a vyberte spôsob overenia' : `Zadajte kód z ${method === 'email' ? 'emailu' : 'SMS'}`}
        </p>

        {error && (
          <div className="flex items-center gap-2 text-red-500 text-sm mb-4 p-3 bg-red-50 rounded-xl">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
            {error.includes('Zaregistrujte') && (
              <Link href="/registracia" className="ml-auto text-black underline font-medium">Registrácia</Link>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl"
                required
              />
            </div>

            <p className="font-medium text-sm text-gray-700">Poslať kód cez:</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMethod('email')}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 ${method === 'email' ? 'border-black bg-gray-50' : 'border-gray-200'}`}
              >
                <Mail className="w-6 h-6" />
                <span className="font-semibold text-sm">Email</span>
              </button>
              <button
                type="button"
                onClick={() => setMethod('sms')}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 ${method === 'sms' ? 'border-black bg-gray-50' : 'border-gray-200'}`}
              >
                <Phone className="w-6 h-6" />
                <span className="font-semibold text-sm">SMS</span>
              </button>
            </div>

            <Turnstile onVerify={setTurnstileToken} />

            <button
              type="button"
              onClick={sendOtp}
              disabled={isSubmitting || !email || !turnstileToken}
              className="w-full py-4 bg-black text-white rounded-xl font-semibold disabled:opacity-50"
            >
              {isSubmitting ? 'Posielam...' : 'Poslať kód'}
            </button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={verifyAndLogin} className="space-y-4">
            <p className="text-sm text-gray-500 mb-4">
              Kód sme poslali na{' '}
              <span className="font-medium text-black">
                {method === 'email' ? email : maskPhone(phone)}
              </span>
            </p>
            
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="000000"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-center text-2xl tracking-widest"
                maxLength={6}
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || code.length !== 6}
              className="w-full py-4 bg-black text-white rounded-xl font-semibold disabled:opacity-50"
            >
              {isSubmitting ? 'Overujem...' : 'Prihlásiť sa'}
            </button>

            <button
              type="button"
              onClick={() => { setStep(1); setCode('') }}
              className="w-full py-3 text-gray-600"
            >
              Poslať nový kód
            </button>
          </form>
        )}

        <p className="text-center text-gray-500 text-sm mt-6">
          Nemáte účet? <Link href="/registracia" className="text-black underline">Registrovať sa</Link>
        </p>
      </div>
    </div>
  )
}
