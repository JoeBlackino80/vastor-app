'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, AlertCircle, KeyRound } from 'lucide-react'

const SUPABASE_URL = 'https://nkxnkcsvtqbbczhnpokt.supabase.co'

export default function CustomerLogin() {
  const router = useRouter()
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setIsLoading(true)
    setError('')

    try {
      const res = await fetch(SUPABASE_URL + '/functions/v1/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      })
      const data = await res.json()

      if (data.ok) {
        setStep('code')
      } else {
        setError('Nepodarilo sa odoslať kód')
      }
    } catch {
      setError('Chyba pripojenia')
    }
    setIsLoading(false)
  }

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code) return
    setIsLoading(true)
    setError('')

    try {
      const res = await fetch(SUPABASE_URL + '/functions/v1/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code: code.trim() })
      })
      const data = await res.json()

      if (data.ok) {
        localStorage.setItem('customer', JSON.stringify({ email }))
        router.push('/moj-ucet')
      } else {
        if (data.reason === 'invalid_code') setError('Nesprávny kód')
        else if (data.reason === 'expired') { setError('Kód vypršal'); setStep('email') }
        else setError('Overenie zlyhalo')
      }
    } catch {
      setError('Chyba pripojenia')
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto p-6">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-200 rounded-full mb-4">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold mb-2">Prihlásenie</h1>
        <p className="text-gray-600 mb-8">
          {step === 'email' ? 'Zadajte svoj e-mail' : 'Zadajte kód z e-mailu'}
        </p>

        {error && (
          <div className="flex items-center gap-2 text-red-500 text-sm mb-4 p-3 bg-red-50 rounded-xl">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={sendOtp} className="space-y-4">
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
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-black text-white rounded-xl font-semibold disabled:opacity-50"
            >
              {isLoading ? 'Posielam...' : 'Poslať prihlasovací kód'}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOtp} className="space-y-4">
            <p className="text-sm text-gray-500 mb-4">
              Poslali sme 6-miestny kód na <span className="font-medium text-black">{email}</span>
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
                required
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || code.length !== 6}
              className="w-full py-4 bg-black text-white rounded-xl font-semibold disabled:opacity-50"
            >
              {isLoading ? 'Overujem...' : 'Prihlásiť sa'}
            </button>
            <button
              type="button"
              onClick={() => { setStep('email'); setCode(''); setError('') }}
              className="w-full text-gray-500 text-sm hover:text-black"
            >
              ← Zmeniť e-mail
            </button>
          </form>
        )}

        <p className="text-center text-gray-500 text-sm mt-6">
          Ešte nemáte účet? <Link href="/registracia" className="text-black underline">Registrovať sa</Link>
        </p>
      </div>
    </div>
  )
}
