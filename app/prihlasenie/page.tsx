'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Phone, AlertCircle, ArrowLeft, Lock, RefreshCw } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<'phone' | 'pin' | 'sms' | 'setpin'>('phone')
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [smsCode, setSmsCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(0)

  useEffect(() => {
    const saved = localStorage.getItem('customer_phone')
    if (saved) {
      setPhone(saved)
      checkUserPin(saved)
    }
  }, [])

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const checkUserPin = async (userPhone: string) => {
    try {
      const res = await fetch('/api/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check', phone: userPhone, type: 'customer' })
      })
      const data = await res.json()
      
      if (data.exists && data.hasPin) {
        setStep('pin')
      }
    } catch (err) {}
  }

  const handlePhoneSubmit = async () => {
    setError('')
    setIsSubmitting(true)
    
    try {
      const res = await fetch('/api/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check', phone, type: 'customer' })
      })
      const data = await res.json()
      
      if (!data.exists) {
        setError('Účet neexistuje. Zaregistrujte sa.')
        setIsSubmitting(false)
        return
      }
      
      localStorage.setItem('customer_phone', phone)
      
      if (data.hasPin) {
        setStep('pin')
      } else {
        await sendSms()
      }
    } catch (err) {
      setError('Chyba pripojenia')
    } finally {
      setIsSubmitting(false)
    }
  }

  const sendSms = async () => {
    setError('')
    setIsSubmitting(true)
    
    try {
      const res = await fetch('https://nkxnkcsvtqbbczhnpokt.supabase.co/functions/v1/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      })
      
      if (!res.ok) throw new Error('SMS error')
      
      setSmsCode('')
      setResendTimer(60)
      setStep('sms')
    } catch (err) {
      setError('Nepodarilo sa odoslať SMS')
    } finally {
      setIsSubmitting(false)
    }
  }

  const verifyPin = async () => {
    setError('')
    setIsSubmitting(true)
    
    try {
      const res = await fetch('/api/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', phone, pin, type: 'customer' })
      })
      const data = await res.json()
      
      if (!res.ok) {
        setError(data.error || 'Nesprávny PIN')
        setPin('')
        setIsSubmitting(false)
        return
      }
      
      localStorage.setItem('customer', JSON.stringify(data.user))
      router.push('/moj-ucet')
    } catch (err) {
      setError('Chyba pri overovaní')
    } finally {
      setIsSubmitting(false)
    }
  }

  const verifySmsCode = async () => {
    setError('')
    setIsSubmitting(true)
    
    try {
      const res = await fetch('https://nkxnkcsvtqbbczhnpokt.supabase.co/functions/v1/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: phone, code: smsCode })
      })
      const data = await res.json()
      
      if (!data.ok) {
        setError(data.reason === 'expired' ? 'Kód vypršal' : 'Nesprávny kód')
        setIsSubmitting(false)
        return
      }
      
      setStep('setpin')
    } catch (err) {
      setError('Chyba pri overovaní')
    } finally {
      setIsSubmitting(false)
    }
  }

  const saveNewPin = async () => {
    setError('')
    
    if (newPin.length !== 4) {
      setError('PIN musí mať 4 číslice')
      return
    }
    
    if (newPin !== confirmPin) {
      setError('PIN sa nezhoduje')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const pinRes = await fetch('/api/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set', phone, pin: newPin, type: 'customer' })
      })
      
      if (!pinRes.ok) throw new Error('Chyba pri ukladaní PIN')
      
      const loginRes = await fetch('/api/customer-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp_verified: true })
      })
      const loginData = await loginRes.json()
      
      if (!loginRes.ok) throw new Error(loginData.error)
      
      localStorage.setItem('customer', JSON.stringify(loginData.customer))
      router.push('/moj-ucet')
    } catch (err: any) {
      setError(err.message || 'Chyba pri ukladaní')
    } finally {
      setIsSubmitting(false)
    }
  }

  const forgotPin = () => {
    setPin('')
    sendSms()
  }

  const maskPhone = (p: string) => p ? p.slice(0, 4) + ' *** ' + p.slice(-3) : ''

  const switchAccount = () => {
    localStorage.removeItem('customer_phone')
    setPhone('')
    setPin('')
    setStep('phone')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto p-6">
        {(step === 'sms' || step === 'setpin') && (
          <button onClick={() => setStep('phone')} className="p-2 hover:bg-gray-100 rounded-full mb-4">
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}
        
        <h1 className="text-2xl font-bold mb-2">Prihlásenie</h1>
        <p className="text-gray-600 mb-6">
          {step === 'phone' && 'Zadajte váš telefón'}
          {step === 'pin' && 'Zadajte váš PIN'}
          {step === 'sms' && 'Zadajte kód z SMS'}
          {step === 'setpin' && 'Nastavte si PIN'}
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

        {step === 'phone' && (
          <div className="space-y-4">
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                placeholder="Telefón (+421...)"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl"
                autoFocus
              />
            </div>

            <button
              onClick={handlePhoneSubmit}
              disabled={isSubmitting || !phone}
              className="w-full py-4 bg-black text-white rounded-xl font-semibold disabled:opacity-50"
            >
              {isSubmitting ? 'Overujem...' : 'Pokračovať'}
            </button>
          </div>
        )}

        {step === 'pin' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 mb-2">{maskPhone(phone)}</p>
            
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                inputMode="numeric"
                placeholder="••••"
                value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-center text-2xl tracking-widest"
                maxLength={4}
                autoFocus
              />
            </div>

            <button
              onClick={verifyPin}
              disabled={isSubmitting || pin.length !== 4}
              className="w-full py-4 bg-black text-white rounded-xl font-semibold disabled:opacity-50"
            >
              {isSubmitting ? 'Overujem...' : 'Prihlásiť sa'}
            </button>

            <div className="flex gap-4 text-sm">
              <button onClick={forgotPin} className="text-gray-600 hover:text-black">
                Zabudol som PIN
              </button>
              <button onClick={switchAccount} className="text-gray-600 hover:text-black ml-auto">
                Iný účet
              </button>
            </div>
          </div>
        )}

        {step === 'sms' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 mb-4">
              SMS kód sme poslali na <span className="font-medium text-black">{maskPhone(phone)}</span>
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
                autoFocus
              />
            </div>

            <button
              onClick={verifySmsCode}
              disabled={isSubmitting || smsCode.length !== 6}
              className="w-full py-4 bg-black text-white rounded-xl font-semibold disabled:opacity-50"
            >
              {isSubmitting ? 'Overujem...' : 'Overiť'}
            </button>

            <button
              onClick={() => sendSms()}
              disabled={resendTimer > 0 || isSubmitting}
              className="w-full py-3 text-gray-600 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
              {resendTimer > 0 ? `Znova odoslať (${resendTimer}s)` : 'Odoslať znova'}
            </button>
          </div>
        )}

        {step === 'setpin' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 mb-4">
              Nastavte si 4-miestny PIN pre rýchle prihlásenie
            </p>
            
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                inputMode="numeric"
                placeholder="Nový PIN"
                value={newPin}
                onChange={e => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-center text-2xl tracking-widest"
                maxLength={4}
                autoFocus
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                inputMode="numeric"
                placeholder="Zopakovať PIN"
                value={confirmPin}
                onChange={e => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-center text-2xl tracking-widest"
                maxLength={4}
              />
            </div>

            <button
              onClick={saveNewPin}
              disabled={isSubmitting || newPin.length !== 4 || confirmPin.length !== 4}
              className="w-full py-4 bg-black text-white rounded-xl font-semibold disabled:opacity-50"
            >
              {isSubmitting ? 'Ukladám...' : 'Uložiť a prihlásiť'}
            </button>
          </div>
        )}

        <p className="text-center text-gray-500 text-sm mt-6">
          Nemáte účet? <Link href="/registracia" className="text-black underline">Registrovať sa</Link>
        </p>
      </div>
    </div>
  )
}
