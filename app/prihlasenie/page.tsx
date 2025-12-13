'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Phone, Lock, RefreshCw, ChevronDown, ArrowLeft } from 'lucide-react'
import Turnstile from '@/components/Turnstile'

const DEV_PHONE = '+421909188881'
const DEV_CODE = '000000'
const SESSION_TIMEOUT = 5 * 60 * 1000 // 5 minutes

const COUNTRIES = [
  { code: 'SK', name: 'Slovensko', dial: '+421', flag: '🇸🇰' },
  { code: 'CZ', name: 'Česko', dial: '+420', flag: '🇨🇿' },
  { code: 'AT', name: 'Rakúsko', dial: '+43', flag: '🇦🇹' },
  { code: 'DE', name: 'Nemecko', dial: '+49', flag: '🇩🇪' },
  { code: 'PL', name: 'Poľsko', dial: '+48', flag: '🇵🇱' },
  { code: 'HU', name: 'Maďarsko', dial: '+36', flag: '🇭🇺' },
  { code: 'FR', name: 'Francúzsko', dial: '+33', flag: '🇫🇷' },
  { code: 'IT', name: 'Taliansko', dial: '+39', flag: '🇮🇹' },
  { code: 'ES', name: 'Španielsko', dial: '+34', flag: '🇪🇸' },
  { code: 'NL', name: 'Holandsko', dial: '+31', flag: '🇳🇱' },
  { code: 'BE', name: 'Belgicko', dial: '+32', flag: '🇧🇪' },
  { code: 'PT', name: 'Portugalsko', dial: '+351', flag: '🇵🇹' },
  { code: 'SE', name: 'Švédsko', dial: '+46', flag: '🇸🇪' },
  { code: 'DK', name: 'Dánsko', dial: '+45', flag: '🇩🇰' },
  { code: 'FI', name: 'Fínsko', dial: '+358', flag: '🇫🇮' },
  { code: 'IE', name: 'Írsko', dial: '+353', flag: '🇮🇪' },
  { code: 'GR', name: 'Grécko', dial: '+30', flag: '🇬🇷' },
  { code: 'RO', name: 'Rumunsko', dial: '+40', flag: '🇷🇴' },
  { code: 'BG', name: 'Bulharsko', dial: '+359', flag: '🇧🇬' },
  { code: 'HR', name: 'Chorvátsko', dial: '+385', flag: '🇭🇷' },
  { code: 'SI', name: 'Slovinsko', dial: '+386', flag: '🇸🇮' },
  { code: 'EE', name: 'Estónsko', dial: '+372', flag: '🇪🇪' },
  { code: 'LV', name: 'Lotyšsko', dial: '+371', flag: '🇱🇻' },
  { code: 'LT', name: 'Litva', dial: '+370', flag: '🇱🇹' },
  { code: 'LU', name: 'Luxembursko', dial: '+352', flag: '🇱🇺' },
  { code: 'MT', name: 'Malta', dial: '+356', flag: '🇲🇹' },
  { code: 'CY', name: 'Cyprus', dial: '+357', flag: '🇨🇾' },
]

// Kroky: 
// 'init' - kontrola localStorage
// 'pin-only' - má uložený účet, zadáva len PIN
// 'phone' - zadáva telefón (nové zariadenie)
// 'sms' - zadáva SMS kód
// 'pin-verify' - overuje existujúci PIN (po SMS z nového zariadenia)
// 'pin-reset' - vytvára nový PIN (zabudnutý PIN)
// 'pin-reset-confirm' - potvrdzuje nový PIN
type Step = 'init' | 'pin-only' | 'phone' | 'sms' | 'pin-verify' | 'pin-reset' | 'pin-reset-confirm'

export default function LoginPage() {
  const router = useRouter()
  
  // State
  const [step, setStep] = useState<Step>('init')
  const [phone, setPhone] = useState('')
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0])
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [smsCode, setSmsCode] = useState('')
  const [pin, setPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [newPinConfirm, setNewPinConfirm] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  
  // Uložené dáta
  const [savedCustomer, setSavedCustomer] = useState<any>(null)
  const [tempCustomer, setTempCustomer] = useState<any>(null) // Pre nové zariadenie po SMS
  const [isDevMode, setIsDevMode] = useState(false)
  const [isForgotPin, setIsForgotPin] = useState(false)

  // Init - skontroluj localStorage
  useEffect(() => {
    const saved = localStorage.getItem('customer')
    if (saved) {
      const customer = JSON.parse(saved)
      const lastActivity = localStorage.getItem('customer_last_activity')
      const now = Date.now()
      
      // Ak je aktívna session (menej ako 5 min), presmeruj na účet
      if (lastActivity && (now - parseInt(lastActivity)) < SESSION_TIMEOUT) {
        router.push('/moj-ucet')
        return
      }
      
      // Session vypršala alebo nie je - potrebuje PIN
      if (customer.phone) {
        setSavedCustomer(customer)
        setStep('pin-only')
        return
      }
    }
    
    // Žiadny uložený účet - potrebuje telefón
    setStep('phone')
  }, [router])

  // Resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(r => r - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [resendTimer])

  // Helper - maskuj telefón
  const maskPhone = (p: string) => p ? p.slice(0, -4).replace(/./g, '*') + p.slice(-4) : ''
  
  // Helper - plné telefónne číslo
  const getFullPhone = () => selectedCountry.dial + phone

  // ============ AKCIE ============

  // Prihlásenie len PINom (uložený účet)
  const handlePinOnly = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (savedCustomer?.pin === pin) {
      localStorage.setItem('customer_last_activity', Date.now().toString())
      router.push('/moj-ucet')
    } else {
      setError('Nesprávny PIN')
      setPin('')
    }
  }

  // Odoslanie SMS kódu
  const sendSms = async (resend = false) => {
    const fullPhone = isForgotPin ? savedCustomer?.phone : getFullPhone()
    if (!fullPhone) return
    
    setIsLoading(true)
    setError('')

    // Dev mód
    if (fullPhone === DEV_PHONE) {
      setIsDevMode(true)
      setStep('sms')
      setIsLoading(false)
      if (resend) setResendTimer(60)
      return
    }

    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone })
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Chyba pri odosielaní SMS')
      }
      
      setStep('sms')
      if (resend) setResendTimer(60)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Overenie SMS kódu
  const verifySms = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const fullPhone = isForgotPin ? savedCustomer?.phone : getFullPhone()

    // Dev mód
    if (isDevMode && smsCode === DEV_CODE) {
      await handleSmsVerified(fullPhone)
      return
    }

    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone, code: smsCode })
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Nesprávny kód')
      }
      
      await handleSmsVerified(fullPhone)
    } catch (err: any) {
      setError(err.message)
      setIsLoading(false)
    }
  }

  // Po úspešnom overení SMS
  const handleSmsVerified = async (fullPhone: string) => {
    // Ak je to zabudnutý PIN - vytvor nový
    if (isForgotPin) {
      setStep('pin-reset')
      setIsLoading(false)
      return
    }

    // Inak načítaj údaje zákazníka z DB
    try {
      const res = await fetch('/api/customer-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone })
      })
      
      if (!res.ok) {
        setError('Účet s týmto telefónom neexistuje. Zaregistrujte sa.')
        setStep('phone')
        setIsLoading(false)
        return
      }
      
      const data = await res.json()
      setTempCustomer({ ...data.customer, phone: fullPhone })
      setStep('pin-verify')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Overenie existujúceho PINu (nové zariadenie)
  const handlePinVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (tempCustomer?.pin === pin) {
      // Ulož do localStorage a prihlás
      localStorage.setItem('customer', JSON.stringify(tempCustomer))
      localStorage.setItem('customer_last_activity', Date.now().toString())
      router.push('/moj-ucet')
    } else {
      setError('Nesprávny PIN')
      setPin('')
    }
  }

  // Vytvorenie nového PINu (zabudnutý PIN) - krok 1
  const handlePinReset = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPin.length !== 4) {
      setError('PIN musí mať 4 číslice')
      return
    }
    setError('')
    setStep('pin-reset-confirm')
  }

  // Potvrdenie nového PINu - krok 2
  const handlePinResetConfirm = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPin !== newPinConfirm) {
      setError('PINy sa nezhodujú')
      setNewPinConfirm('')
      return
    }

    setIsLoading(true)

    try {
      // Ulož nový PIN do DB
      const res = await fetch('/api/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set',
          type: 'customer',
          phone: savedCustomer.phone,
          pin: newPin
        })
      })

      if (!res.ok) throw new Error('Chyba pri ukladaní PIN')

      // Aktualizuj localStorage a prihlás
      const updatedCustomer = { ...savedCustomer, pin: newPin }
      localStorage.setItem('customer', JSON.stringify(updatedCustomer))
      localStorage.setItem('customer_last_activity', Date.now().toString())
      router.push('/moj-ucet')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Zabudnutý PIN
  const handleForgotPin = () => {
    setIsForgotPin(true)
    setError('')
    sendSms()
  }

  // Iný účet
  const handleDifferentAccount = () => {
    setSavedCustomer(null)
    setStep('phone')
    setIsForgotPin(false)
    setError('')
  }

  // Odhlásenie
  const handleLogout = () => {
    // Nechaj customer v localStorage, vymaž len aktivitu
    localStorage.removeItem('customer_last_activity') // Po odhlásení stačí PIN
    router.push('/')
  }

  // ============ RENDER ============

  if (step === 'init') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="p-4">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-black">
          <ArrowLeft className="w-5 h-5" />
          Späť
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">📦</span>
            </div>
            <h1 className="text-2xl font-bold">Prihlásenie</h1>
            <p className="text-gray-500 mt-2">
              {step === 'pin-only' && 'Zadajte váš PIN'}
              {step === 'phone' && 'Zadajte telefónne číslo'}
              {step === 'sms' && 'Zadajte SMS kód'}
              {step === 'pin-verify' && 'Zadajte váš PIN'}
              {step === 'pin-reset' && 'Vytvorte nový PIN'}
              {step === 'pin-reset-confirm' && 'Potvrďte nový PIN'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-center">
              {error}
            </div>
          )}

          {/* PIN ONLY - uložený účet */}
          {step === 'pin-only' && (
            <form onSubmit={handlePinOnly} className="space-y-6">
              <p className="text-sm text-gray-500 text-center">
                Prihlásenie ako {maskPhone(savedCustomer?.phone || '')}
              </p>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  inputMode="numeric"
                  placeholder="••••"
                  value={pin}
                  onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-center text-2xl tracking-widest focus:border-black focus:outline-none"
                  maxLength={4}
                  autoFocus
                />
              </div>
              <button type="submit" disabled={pin.length !== 4} className="w-full py-4 bg-black text-white rounded-xl font-semibold disabled:opacity-50">
                Prihlásiť sa
              </button>
              <div className="flex justify-between text-sm">
                <button type="button" onClick={handleForgotPin} className="text-gray-600 hover:text-black">
                  Zabudol som PIN
                </button>
                <button type="button" onClick={handleDifferentAccount} className="text-gray-600 hover:text-black">
                  Iný účet
                </button>
              </div>
              <button type="button" onClick={handleLogout} className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200">
                Odhlásiť sa
              </button>
            </form>
          )}

          {/* PHONE - nové zariadenie */}
          {step === 'phone' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telefónne číslo</label>
                <div className="flex gap-2">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                      className="flex items-center gap-2 px-3 py-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
                    >
                      <span className="text-xl">{selectedCountry.flag}</span>
                      <span className="text-sm font-medium">{selectedCountry.dial}</span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                    {showCountryDropdown && (
                      <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 min-w-[200px] max-h-[300px] overflow-y-auto">
                        {COUNTRIES.map(country => (
                          <button
                            key={country.code}
                            type="button"
                            onClick={() => { setSelectedCountry(country); setShowCountryDropdown(false) }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl"
                          >
                            <span className="text-xl">{country.flag}</span>
                            <span className="font-medium">{country.name}</span>
                            <span className="text-gray-500 ml-auto">{country.dial}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <input
                    type="tel"
                    placeholder="909 123 456"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 px-4 py-4 bg-white border border-gray-200 rounded-xl focus:border-black focus:outline-none"
                    autoFocus
                  />
                </div>
              </div>
              <Turnstile onVerify={setTurnstileToken} />
              <button
                type="button"
                onClick={() => sendSms()}
                disabled={isLoading || !phone || !turnstileToken}
                className="w-full py-4 bg-black text-white rounded-xl font-semibold disabled:opacity-50"
              >
                {isLoading ? 'Odosielam...' : 'Pokračovať'}
              </button>
              <p className="text-center text-gray-500 text-sm">
                Nemáte účet? <Link href="/registracia" className="text-black underline">Zaregistrujte sa</Link>
              </p>
            </div>
          )}

          {/* SMS */}
          {step === 'sms' && (
            <form onSubmit={verifySms} className="space-y-6">
              <p className="text-sm text-gray-500 text-center">
                {isDevMode ? (
                  <span className="text-orange-600">Test mód - zadajte 000000</span>
                ) : (
                  <>Kód sme poslali na <span className="font-medium text-black">{maskPhone(isForgotPin ? savedCustomer?.phone : getFullPhone())}</span></>
                )}
              </p>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  value={smsCode}
                  onChange={e => setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-center text-2xl tracking-widest focus:border-black focus:outline-none"
                  maxLength={6}
                  autoFocus
                />
              </div>
              <button type="submit" disabled={isLoading || smsCode.length !== 6} className="w-full py-4 bg-black text-white rounded-xl font-semibold disabled:opacity-50">
                {isLoading ? 'Overujem...' : 'Overiť'}
              </button>
              {!isDevMode && (
                <button
                  type="button"
                  onClick={() => sendSms(true)}
                  disabled={resendTimer > 0 || isLoading}
                  className="w-full py-3 text-gray-600 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  {resendTimer > 0 ? `Znova odoslať (${resendTimer}s)` : 'Odoslať SMS znova'}
                </button>
              )}
            </form>
          )}

          {/* PIN VERIFY - nové zariadenie, overenie existujúceho PINu */}
          {step === 'pin-verify' && (
            <form onSubmit={handlePinVerify} className="space-y-6">
              <p className="text-sm text-gray-500 text-center">
                Zadajte PIN pre účet {maskPhone(tempCustomer?.phone || '')}
              </p>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  inputMode="numeric"
                  placeholder="••••"
                  value={pin}
                  onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-center text-2xl tracking-widest focus:border-black focus:outline-none"
                  maxLength={4}
                  autoFocus
                />
              </div>
              <button type="submit" disabled={pin.length !== 4} className="w-full py-4 bg-black text-white rounded-xl font-semibold disabled:opacity-50">
                Prihlásiť sa
              </button>
            </form>
          )}

          {/* PIN RESET - vytvorenie nového PINu */}
          {step === 'pin-reset' && (
            <form onSubmit={handlePinReset} className="space-y-6">
              <p className="text-sm text-gray-500 text-center">Zadajte nový 4-miestny PIN</p>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  inputMode="numeric"
                  placeholder="••••"
                  value={newPin}
                  onChange={e => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-center text-2xl tracking-widest focus:border-black focus:outline-none"
                  maxLength={4}
                  autoFocus
                />
              </div>
              <button type="submit" disabled={newPin.length !== 4} className="w-full py-4 bg-black text-white rounded-xl font-semibold disabled:opacity-50">
                Pokračovať
              </button>
            </form>
          )}

          {/* PIN RESET CONFIRM */}
          {step === 'pin-reset-confirm' && (
            <form onSubmit={handlePinResetConfirm} className="space-y-6">
              <p className="text-sm text-gray-500 text-center">Potvrďte nový PIN</p>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  inputMode="numeric"
                  placeholder="••••"
                  value={newPinConfirm}
                  onChange={e => setNewPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-center text-2xl tracking-widest focus:border-black focus:outline-none"
                  maxLength={4}
                  autoFocus
                />
              </div>
              <button type="submit" disabled={isLoading || newPinConfirm.length !== 4} className="w-full py-4 bg-black text-white rounded-xl font-semibold disabled:opacity-50">
                {isLoading ? 'Ukladám...' : 'Uložiť a prihlásiť'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
