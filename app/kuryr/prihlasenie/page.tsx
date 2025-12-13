'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Phone, RefreshCw, ChevronDown, ArrowLeft, Bike } from 'lucide-react'
import Turnstile from '@/components/Turnstile'

const DEV_PHONE = '+421909188881'
const DEV_CODE = '000000'

const COUNTRIES = [
  { code: 'SK', name: 'Slovensko', dial: '+421', flag: '🇸🇰' },
  { code: 'CZ', name: 'Česko', dial: '+420', flag: '🇨🇿' },
  { code: 'AT', name: 'Rakúsko', dial: '+43', flag: '🇦🇹' },
  { code: 'HU', name: 'Maďarsko', dial: '+36', flag: '🇭🇺' },
  { code: 'PL', name: 'Poľsko', dial: '+48', flag: '🇵🇱' },
]

export default function CourierLogin() {
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
    const saved = localStorage.getItem('courier')
    if (saved) {
      router.push('/kuryr/dashboard')
    }
  }, [router])

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(r => r - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [resendTimer])

  const getFullPhone = () => selectedCountry.dial + phone

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
      if (!res.ok) throw new Error('Chyba pri odosielaní SMS')
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
        await loginCourier(fullPhone)
        return
      }
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone, code: smsCode })
      })
      if (!res.ok) throw new Error('Nesprávny kód')
      await loginCourier(fullPhone)
    } catch (err: any) {
      setError(err.message)
      setIsLoading(false)
    }
  }

  const loginCourier = async (fullPhone: string) => {
    try {
      const res = await fetch('/api/courier-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone })
      })
      if (!res.ok) {
        setError('Účet kuriéra s týmto telefónom neexistuje.')
        setStep('phone')
        setIsLoading(false)
        return
      }
      const data = await res.json()
      localStorage.setItem('courier', JSON.stringify(data.courier))
      router.push('/kuryr/dashboard')
    } catch (err) {
      setError('Chyba pri prihlásení')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <div className="p-4">
        <Link href="/kuryr" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">
          <ArrowLeft className="w-5 h-5" /> Späť
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bike className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold dark:text-white">Kuriér prihlásenie</h1>
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
                    <button type="button" onClick={() => setShowCountryDropdown(!showCountryDropdown)} className="flex items-center gap-2 px-3 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl">
                      <span>{selectedCountry.flag}</span>
                      <span className="text-sm font-medium dark:text-white">{selectedCountry.dial}</span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                    {showCountryDropdown && (
                      <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg z-10 min-w-[200px]">
                        {COUNTRIES.map(c => (
                          <button key={c.code} type="button" onClick={() => { setSelectedCountry(c); setShowCountryDropdown(false) }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <span>{c.flag}</span>
                            <span className="dark:text-white">{c.name}</span>
                            <span className="text-gray-500 ml-auto">{c.dial}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <input type="tel" placeholder="909 123 456" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} className="flex-1 px-4 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl dark:text-white" autoFocus />
                </div>
              </div>
              <Turnstile onVerify={setTurnstileToken} />
              <button type="button" onClick={() => sendSms()} disabled={isLoading || !phone || !turnstileToken} className="w-full py-4 bg-green-600 text-white rounded-xl font-semibold disabled:opacity-50">
                {isLoading ? 'Odosielam...' : 'Pokračovať'}
              </button>
              <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
                Nemáš účet? <Link href="/kuryr/registracia" className="text-green-600 underline">Zaregistruj sa</Link>
              </p>
            </div>
          )}
          {step === 'sms' && (
            <form onSubmit={verifySms} className="space-y-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                {isDevMode ? <span className="text-orange-600">Test mód - zadajte 000000</span> : 'Kód sme poslali na vaše číslo'}
              </p>
              <input type="text" inputMode="numeric" placeholder="000000" value={smsCode} onChange={e => setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 6))} className="w-full px-4 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-center text-2xl tracking-widest dark:text-white" maxLength={6} autoFocus />
              <button type="submit" disabled={isLoading || smsCode.length !== 6} className="w-full py-4 bg-green-600 text-white rounded-xl font-semibold disabled:opacity-50">
                {isLoading ? 'Overujem...' : 'Prihlásiť sa'}
              </button>
              {!isDevMode && (
                <button type="button" onClick={() => sendSms(true)} disabled={resendTimer > 0} className="w-full py-3 text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  {resendTimer > 0 ? 'Znova odoslať (' + resendTimer + 's)' : 'Odoslať SMS znova'}
                </button>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
