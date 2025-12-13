'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Phone, RefreshCw, ChevronDown, ArrowLeft } from 'lucide-react'
import Turnstile from '@/components/Turnstile'

const DEV_PHONE = '+421909188881'
const DEV_CODE = '000000'

const COUNTRIES = [
  { code: 'SK', name: 'Slovensko', dial: '+421', flag: '🇸🇰' },
  { code: 'CZ', name: 'Česko', dial: '+420', flag: '🇨🇿' },
  { code: 'AT', name: 'Rakúsko', dial: '+43', flag: '🇦🇹' },
  { code: 'DE', name: 'Nemecko', dial: '+49', flag: '🇩🇪' },
  { code: 'PL', name: 'Poľsko', dial: '+48', flag: '🇵🇱' },
  { code: 'HU', name: 'Maďarsko', dial: '+36', flag: '🇭🇺' },
]

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<'phone' | 'sms'>('phone')
  const [phone, setPhone] = useState('')
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0])
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [smsCode, setSmsCode] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const [isDevMode, setIsDevMode] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('customer')
    const lastActivity = localStorage.getItem('customer_last_activity')
    if (saved && lastActivity) {
      const elapsed = Date.now() - parseInt(lastActivity)
      if (elapsed < 15 * 60 * 1000) {
        router.push('/moj-ucet')
      }
    }
  }, [router])

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(r => r - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [resendTimer])

  const getFullPhone = () => selectedCountry.dial + phone
  const maskPhone = (p: string) => p ? p.slice(0, -4).replace(/./g, '*') + p.slice(-4) : ''

  const sendSms = async (resend = false) => {
    const fullPhone = getFullPhone()
    if (!fullPhone || !phone) return
    setIsLoading(true)
    setError('')
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

  const verifySms = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    const fullPhone = getFullPhone()
    try {
      if (isDevMode && smsCode === DEV_CODE) {
        await loginUser(fullPhone)
        return
      }
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone, code: smsCode })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Nesprávny kód')
      }
      await loginUser(fullPhone)
    } catch (err: any) {
      setError(err.message)
      setIsLoading(false)
    }
  }

  const loginUser = async (fullPhone: string) => {
    try {
      const res = await fetch('/api/customer-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone })
      })
      if (!res.ok) {
        setError('Účet neexistuje. Zaregistrujte sa.')
        setStep('phone')
        setIsLoading(false)
        return
      }
      const data = await res.json()
      localStorage.setItem('customer', JSON.stringify({ ...data.user, phone: fullPhone }))
      localStorage.setItem('customer_last_activity', Date.now().toString())
      router.push('/moj-ucet')
    } catch (err) {
      setError('Chyba pri prihlásení')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <div className="p-4">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">
          <ArrowLeft className="w-5 h-5" />
          Späť
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">📦</span>
            </div>
            <h1 className="text-2xl font-bold dark:text-white">Prihlásenie</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {step === 'phone' && 'Zadajte telefónne číslo'}
              {step === 'sms' && 'Zadajte SMS kód'}
            </p>
          </div>
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-center">
              {error}
            </div>
          )}
          {step === 'phone' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Telefónne číslo</label>
                <div className="flex gap-2">
                  <div className="relative">
                    <button type="button" onClick={() => setShowCountryDropdown(!showCountryDropdown)} className="flex items-center gap-2 px-3 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700">
                      <span className="text-xl">{selectedCountry.flag}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedCountry.dial}</span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                    {showCountryDropdown && (
                      <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg z-10 min-w-[200px] max-h-[300px] overflow-y-auto">
                        {COUNTRIES.map(country => (
                          <button key={country.code} type="button" onClick={() => { setSelectedCountry(country); setShowCountryDropdown(false) }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <span className="text-xl">{country.flag}</span>
                            <span className="font-medium text-gray-900 dark:text-white">{country.name}</span>
                            <span className="text-gray-500 ml-auto">{country.dial}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <input type="tel" placeholder="909 123 456" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} className="flex-1 px-4 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl focus:border-black dark:focus:border-white focus:outline-none text-gray-900 dark:text-white" autoFocus />
                </div>
              </div>
              <Turnstile onVerify={setTurnstileToken} />
              <button type="button" onClick={() => sendSms()} disabled={isLoading || !phone || !turnstileToken} className="w-full py-4 bg-black text-white rounded-xl font-semibold disabled:opacity-50">
                {isLoading ? 'Odosielam...' : 'Pokračovať'}
              </button>
              <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
                Nemáte účet? <Link href="/registracia" className="text-black dark:text-white underline">Zaregistrujte sa</Link>
              </p>
            </div>
          )}
          {step === 'sms' && (
            <form onSubmit={verifySms} className="space-y-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                {isDevMode ? (
                  <span className="text-orange-600">Test mód - zadajte 000000</span>
                ) : (
                  <>Kód sme poslali na <span className="font-medium text-black dark:text-white">{maskPhone(getFullPhone())}</span></>
                )}
              </p>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" inputMode="numeric" placeholder="000000" value={smsCode} onChange={e => setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 6))} className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-center text-2xl tracking-widest focus:border-black dark:focus:border-white focus:outline-none text-gray-900 dark:text-white" maxLength={6} autoFocus />
              </div>
              <button type="submit" disabled={isLoading || smsCode.length !== 6} className="w-full py-4 bg-black text-white rounded-xl font-semibold disabled:opacity-50">
                {isLoading ? 'Overujem...' : 'Prihlásiť sa'}
              </button>
              {!isDevMode && (
                <button type="button" onClick={() => sendSms(true)} disabled={resendTimer > 0 || isLoading} className="w-full py-3 text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2 disabled:opacity-50">
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  {resendTimer > 0 ? `Znova odoslať (${resendTimer}s)` : 'Odoslať SMS znova'}
                </button>
              )}
              <button type="button" onClick={() => { setStep('phone'); setSmsCode(''); setError('') }} className="w-full py-2 text-gray-500 dark:text-gray-400 text-sm">
                Zmeniť telefónne číslo
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
