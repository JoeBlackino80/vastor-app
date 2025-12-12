'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Phone, Lock, RefreshCw, ChevronDown, ArrowLeft, Bike, Car, UserPlus } from 'lucide-react'
import Turnstile from '@/components/Turnstile'

const DEV_PHONES = ['+421909188881']
const DEV_CODE = '000000'

const COUNTRIES = [
  { code: 'SK', name: 'Slovensko', dial: '+421', flag: '🇸🇰' },
  { code: 'CZ', name: 'Česko', dial: '+420', flag: '🇨🇿' },
  { code: 'PL', name: 'Poľsko', dial: '+48', flag: '🇵🇱' },
  { code: 'HU', name: 'Maďarsko', dial: '+36', flag: '🇭🇺' },
  { code: 'AT', name: 'Rakúsko', dial: '+43', flag: '🇦🇹' },
]

type LoginStep = 'check' | 'pin' | 'phone' | 'sms' | 'new-pin' | 'new-pin-confirm'

export default function CourierLoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<LoginStep>('check')
  const [savedPhone, setSavedPhone] = useState<string | null>(null)
  const [phone, setPhone] = useState('')
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0])
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [pin, setPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [newPinConfirm, setNewPinConfirm] = useState('')
  const [smsCode, setSmsCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const [isDevMode, setIsDevMode] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [forgotPin, setForgotPin] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('courier')
    if (saved) {
      const data = JSON.parse(saved)
      if (data.phone && data.pin) {
        setSavedPhone(data.phone)
        setStep('pin')
      } else {
        setStep('phone')
      }
    } else {
      setStep('phone')
    }
  }, [])

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [resendTimer])

  const getFullPhone = () => selectedCountry.dial + phone

  const maskPhone = (p: string) => {
    if (!p) return ''
    return p.slice(0, -4).replace(/./g, '*') + p.slice(-4)
  }

  const handlePinLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const saved = JSON.parse(localStorage.getItem('courier') || '{}')
      if (saved.pin === pin) {
        router.push('/kuryr/dashboard')
      } else {
        setError('Nesprávny PIN')
        setPin('')
      }
    } catch (err) {
      setError('Chyba pri prihlásení')
    } finally {
      setIsSubmitting(false)
    }
  }

  const sendSmsOtp = async (resend = false) => {
    const fullPhone = forgotPin ? savedPhone : getFullPhone()
    if (!fullPhone) return

    setIsSubmitting(true)
    setError('')

    if (DEV_PHONES.includes(fullPhone!)) {
      setIsDevMode(true)
      setStep('sms')
      setIsSubmitting(false)
      return
    }

    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      setStep('sms')
      if (resend) setResendTimer(60)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba pri odosielaní SMS')
    } finally {
      setIsSubmitting(false)
    }
  }

  const verifySmsOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    const fullPhone = forgotPin ? savedPhone : getFullPhone()

    if (isDevMode && smsCode === DEV_CODE) {
      // Dev mode - check if courier exists
      try {
        const userRes = await fetch('/api/courier-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: fullPhone })
        })
        const userData = await userRes.json()
        
        if (!userRes.ok) {
          setError('Účet kuriera s týmto telefónom neexistuje.')
          setIsSubmitting(false)
          return
        }

        localStorage.setItem('temp_login_phone', fullPhone!)
        localStorage.setItem('temp_login_courier', JSON.stringify(userData.courier))
        setStep('new-pin')
      } catch (err) {
        setError('Chyba pri overovaní')
      }
      setIsSubmitting(false)
      return
    }

    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone, code: smsCode })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      const userRes = await fetch('/api/courier-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone })
      })
      const userData = await userRes.json()
      
      if (!userRes.ok) {
        setError('Účet kuriera s týmto telefónom neexistuje.')
        return
      }

      localStorage.setItem('temp_login_phone', fullPhone!)
      localStorage.setItem('temp_login_courier', JSON.stringify(userData.courier))
      setStep('new-pin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nesprávny kód')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNewPin = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPin.length !== 4) {
      setError('PIN musí mať 4 číslice')
      return
    }
    setError('')
    setStep('new-pin-confirm')
  }

  const handlePinConfirm = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPin !== newPinConfirm) {
      setError('PIN sa nezhoduje')
      setNewPinConfirm('')
      return
    }

    const fullPhone = forgotPin ? savedPhone : (localStorage.getItem('temp_login_phone') || getFullPhone())
    const courierData = JSON.parse(localStorage.getItem('temp_login_courier') || '{}')

    localStorage.setItem('courier', JSON.stringify({
      ...courierData,
      phone: fullPhone,
      pin: newPin
    }))
    localStorage.removeItem('temp_login_phone')
    localStorage.removeItem('temp_login_courier')

    router.push('/kuryr/dashboard')
  }

  const handleForgotPin = () => {
    setForgotPin(true)
    setError('')
    sendSmsOtp()
  }

  const useDifferentPhone = () => {
    setSavedPhone(null)
    setStep('phone')
    setForgotPin(false)
    setError('')
  }

  if (step === 'check') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <div className="p-4">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
          Späť
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bike className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Kuriér prihlásenie</h1>
            <p className="text-gray-400 mt-2">
              {step === 'pin' && 'Zadajte váš PIN'}
              {step === 'phone' && 'Zadajte telefónne číslo'}
              {step === 'sms' && 'Zadajte SMS kód'}
              {step === 'new-pin' && 'Vytvorte si PIN'}
              {step === 'new-pin-confirm' && 'Potvrďte PIN'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-xl text-red-300 text-center">
              {error}
            </div>
          )}

          {step === 'pin' && (
            <form onSubmit={handlePinLogin} className="space-y-6">
              <div>
                <p className="text-sm text-gray-400 text-center mb-4">
                  Prihlásenie ako {maskPhone(savedPhone || '')}
                </p>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="password"
                    inputMode="numeric"
                    placeholder="••••"
                    value={pin}
                    onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-xl text-center text-2xl tracking-widest text-white focus:border-green-500 focus:outline-none"
                    maxLength={4}
                    autoFocus
                  />
                </div>
              </div>
              <button type="submit" disabled={isSubmitting || pin.length !== 4} className="w-full py-4 bg-green-500 text-white rounded-xl font-semibold disabled:opacity-50">
                {isSubmitting ? 'Prihlasujem...' : 'Prihlásiť sa'}
              </button>
              <div className="flex justify-between text-sm">
                <button type="button" onClick={handleForgotPin} className="text-gray-400 hover:text-white">Zabudol som PIN</button>
                <button type="button" onClick={useDifferentPhone} className="text-gray-400 hover:text-white">Iný účet</button>
              </div>
            </form>
          )}

          {step === 'phone' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Telefónne číslo</label>
                <div className="flex gap-2">
                  <div className="relative">
                    <button type="button" onClick={() => setShowCountryDropdown(!showCountryDropdown)} className="flex items-center gap-2 px-3 py-4 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700">
                      <span className="text-xl">{selectedCountry.flag}</span>
                      <span className="text-sm font-medium text-white">{selectedCountry.dial}</span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                    {showCountryDropdown && (
                      <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-700 rounded-xl shadow-lg z-10 min-w-[200px]">
                        {COUNTRIES.map(country => (
                          <button key={country.code} type="button" onClick={() => { setSelectedCountry(country); setShowCountryDropdown(false) }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-700 first:rounded-t-xl last:rounded-b-xl text-white">
                            <span className="text-xl">{country.flag}</span>
                            <span className="font-medium">{country.name}</span>
                            <span className="text-gray-400 ml-auto">{country.dial}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <input type="tel" placeholder="909 123 456" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 px-4 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-green-500 focus:outline-none" autoFocus />
                </div>
              </div>
              <Turnstile onVerify={setTurnstileToken} />
              <button type="button" onClick={() => sendSmsOtp()} disabled={isSubmitting || !phone || !turnstileToken}
                className="w-full py-4 bg-green-500 text-white rounded-xl font-semibold disabled:opacity-50">
                {isSubmitting ? 'Odosielam...' : 'Pokračovať'}
              </button>
              <p className="text-center text-gray-400 text-sm">
                Chceš jazdiť s nami? <Link href="/kuryr/registracia" className="text-green-400 underline">Registruj sa</Link>
              </p>
            </div>
          )}

          {step === 'sms' && (
            <form onSubmit={verifySmsOtp} className="space-y-6">
              <div>
                <p className="text-sm text-gray-400 text-center mb-4">
                  {isDevMode ? <span className="text-orange-400">Test mód - zadajte 000000</span> : <>Kód sme poslali na <span className="font-medium text-white">{maskPhone(forgotPin ? savedPhone! : getFullPhone())}</span></>}
                </p>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input type="text" inputMode="numeric" placeholder="000000" value={smsCode} onChange={e => setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-xl text-center text-2xl tracking-widest text-white focus:border-green-500 focus:outline-none" maxLength={6} autoFocus />
                </div>
              </div>
              <button type="submit" disabled={isSubmitting || smsCode.length !== 6} className="w-full py-4 bg-green-500 text-white rounded-xl font-semibold disabled:opacity-50">
                {isSubmitting ? 'Overujem...' : 'Overiť'}
              </button>
              {!isDevMode && (
                <button type="button" onClick={() => sendSmsOtp(true)} disabled={resendTimer > 0 || isSubmitting}
                  className="w-full py-3 text-gray-400 flex items-center justify-center gap-2 disabled:opacity-50">
                  <RefreshCw className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
                  {resendTimer > 0 ? `Znova odoslať (${resendTimer}s)` : 'Odoslať SMS znova'}
                </button>
              )}
            </form>
          )}

          {step === 'new-pin' && (
            <form onSubmit={handleNewPin} className="space-y-6">
              <div>
                <p className="text-sm text-gray-400 text-center mb-4">PIN použijete na rýchle prihlásenie</p>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input type="password" inputMode="numeric" placeholder="••••" value={newPin} onChange={e => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-xl text-center text-2xl tracking-widest text-white focus:border-green-500 focus:outline-none" maxLength={4} autoFocus />
                </div>
              </div>
              <button type="submit" disabled={newPin.length !== 4} className="w-full py-4 bg-green-500 text-white rounded-xl font-semibold disabled:opacity-50">Pokračovať</button>
            </form>
          )}

          {step === 'new-pin-confirm' && (
            <form onSubmit={handlePinConfirm} className="space-y-6">
              <div>
                <p className="text-sm text-gray-400 text-center mb-4">Zadajte PIN znova pre potvrdenie</p>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input type="password" inputMode="numeric" placeholder="••••" value={newPinConfirm} onChange={e => setNewPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-xl text-center text-2xl tracking-widest text-white focus:border-green-500 focus:outline-none" maxLength={4} autoFocus />
                </div>
              </div>
              <button type="submit" disabled={newPinConfirm.length !== 4} className="w-full py-4 bg-green-500 text-white rounded-xl font-semibold disabled:opacity-50">Prihlásiť sa</button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
