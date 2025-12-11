'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, AlertCircle, KeyRound, Phone } from 'lucide-react'
import Turnstile from '@/components/Turnstile'

const SUPABASE_URL = 'https://nkxnkcsvtqbbczhnpokt.supabase.co'

export default function CustomerLogin() {
  const router = useRouter()
  const [step, setStep] = useState<'email' | 'email-code' | 'sms-code'>('email')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [emailCode, setEmailCode] = useState('')
  const [smsCode, setSmsCode] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')

  // Step 1: Check account exists and send email OTP
  const checkAndSendEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !turnstileToken) return
    setIsLoading(true)
    setError('')

    try {
      // Check if account exists
      const checkRes = await fetch('/api/check-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), type: 'customer' })
      })
      const checkData = await checkRes.json()

      if (!checkData.exists) {
        setError('Účet neexistuje. Chcete sa registrovať?')
        setIsLoading(false)
        return
      }

      setPhone(checkData.phone || '')

      // Send email OTP
      const res = await fetch(SUPABASE_URL + '/functions/v1/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      })
      const data = await res.json()

      if (data.ok) {
        setStep('email-code')
      } else {
        setError('Nepodarilo sa odoslať kód')
      }
    } catch {
      setError('Chyba pripojenia')
    }
    setIsLoading(false)
  }

  // Step 2: Verify email OTP and send SMS OTP
  const verifyEmailAndSendSms = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailCode) return
    setIsLoading(true)
    setError('')

    try {
      // Verify email OTP
      const res = await fetch(SUPABASE_URL + '/functions/v1/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code: emailCode.trim() })
      })
      const data = await res.json()

      if (!data.ok) {
        if (data.reason === 'invalid_code') setError('Nesprávny kód')
        else if (data.reason === 'expired') { setError('Kód vypršal'); setStep('email') }
        else setError('Overenie zlyhalo')
        setIsLoading(false)
        return
      }

      // Send SMS OTP
      const smsRes = await fetch(SUPABASE_URL + '/functions/v1/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      })
      const smsData = await smsRes.json()

      if (smsData.ok) {
        setStep('sms-code')
      } else {
        setError('Nepodarilo sa odoslať SMS')
      }
    } catch {
      setError('Chyba pripojenia')
    }
    setIsLoading(false)
  }

  // Step 3: Verify SMS OTP and login
  const verifySmsAndLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!smsCode) return
    setIsLoading(true)
    setError('')

    try {
      // Verify SMS OTP (using same verify-otp function, phone stored in email column)
      const res = await fetch(SUPABASE_URL + '/functions/v1/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: phone, code: smsCode.trim() })
      })
      const data = await res.json()

      if (data.ok) {
        // Get customer data
        const custRes = await fetch('/api/check-account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim().toLowerCase(), type: 'customer' })
        })
        const custData = await custRes.json()
        
        localStorage.setItem('customer', JSON.stringify({ 
          id: custData.id,
          email: email.trim().toLowerCase(),
          phone 
        }))
        router.push('/moj-ucet')
      } else {
        if (data.reason === 'invalid_code') setError('Nesprávny SMS kód')
        else if (data.reason === 'expired') { setError('SMS kód vypršal'); setStep('email-code') }
        else setError('Overenie zlyhalo')
      }
    } catch {
      setError('Chyba pripojenia')
    }
    setIsLoading(false)
  }

  const maskPhone = (p: string) => {
    if (!p) return ''
    return p.slice(0, 4) + ' *** ' + p.slice(-3)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto p-6">
        <button onClick={() => step === 'email' ? router.back() : setStep('email')} className="p-2 hover:bg-gray-200 rounded-full mb-4">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold mb-2">Prihlásenie</h1>
        <p className="text-gray-600 mb-8">
          {step === 'email' && 'Zadajte svoj e-mail'}
          {step === 'email-code' && 'Zadajte kód z e-mailu'}
          {step === 'sms-code' && 'Zadajte kód z SMS'}
        </p>

        {/* Progress */}
        <div className="flex gap-2 mb-6">
          <div className={`h-1 flex-1 rounded-full ${step === 'email' ? 'bg-black' : 'bg-green-500'}`} />
          <div className={`h-1 flex-1 rounded-full ${step === 'email-code' ? 'bg-black' : step === 'sms-code' ? 'bg-green-500' : 'bg-gray-200'}`} />
          <div className={`h-1 flex-1 rounded-full ${step === 'sms-code' ? 'bg-black' : 'bg-gray-200'}`} />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-500 text-sm mb-4 p-3 bg-red-50 rounded-xl">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> 
            <span>{error}</span>
            {error.includes('Registrovať') && (
              <Link href="/registracia" className="ml-auto text-black underline font-medium">Registrovať</Link>
            )}
          </div>
        )}

        {/* Step 1: Email */}
        {step === 'email' && (
          <form onSubmit={checkAndSendEmail} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="vas@email.sk"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl"
                required
                autoFocus
              />
            </div>
            <Turnstile onVerify={setTurnstileToken} />
            <button
              type="submit"
              disabled={isLoading || !turnstileToken || !email}
              className="w-full py-4 bg-black text-white rounded-xl font-semibold disabled:opacity-50"
            >
              {isLoading ? 'Overujem...' : 'Pokračovať'}
            </button>
          </form>
        )}

        {/* Step 2: Email Code */}
        {step === 'email-code' && (
          <form onSubmit={verifyEmailAndSendSms} className="space-y-4">
            <p className="text-sm text-gray-500 mb-4">
              Poslali sme 6-miestny kód na <span className="font-medium text-black">{email}</span>
            </p>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="000000"
                value={emailCode}
                onChange={e => setEmailCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-center text-2xl tracking-widest"
                maxLength={6}
                required
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || emailCode.length !== 6}
              className="w-full py-4 bg-black text-white rounded-xl font-semibold disabled:opacity-50"
            >
              {isLoading ? 'Overujem...' : 'Overiť e-mail'}
            </button>
          </form>
        )}

        {/* Step 3: SMS Code */}
        {step === 'sms-code' && (
          <form onSubmit={verifySmsAndLogin} className="space-y-4">
            <p className="text-sm text-gray-500 mb-4">
              Poslali sme SMS kód na <span className="font-medium text-black">{maskPhone(phone)}</span>
            </p>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="000000"
                value={smsCode}
                onChange={e => setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-center text-2xl tracking-widest"
                maxLength={6}
                required
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || smsCode.length !== 6}
              className="w-full py-4 bg-black text-white rounded-xl font-semibold disabled:opacity-50"
            >
              {isLoading ? 'Prihlasujem...' : 'Prihlásiť sa'}
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
