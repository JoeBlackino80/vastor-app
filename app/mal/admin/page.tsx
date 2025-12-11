'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, KeyRound, AlertCircle, Shield } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<'login' | 'sms'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [smsCode, setSmsCode] = useState('')
  const [phone, setPhone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const admin = localStorage.getItem('admin')
    if (admin) {
      router.push('/mal/admin/stats')
    }
  }, [])

  const handleLogin = async () => {
    setError('')
    setIsSubmitting(true)
    
    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, step: 'password' })
      })
      const data = await res.json()
      
      if (!res.ok) {
        setError(data.error || 'Nesprávne údaje')
        setIsSubmitting(false)
        return
      }
      
      setPhone(data.phone)
      
      const smsRes = await fetch('https://nkxnkcsvtqbbczhnpokt.supabase.co/functions/v1/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: data.phone })
      })
      
      if (!smsRes.ok) throw new Error('SMS error')
      
      setStep('sms')
    } catch (err) {
      setError('Chyba pripojenia')
    } finally {
      setIsSubmitting(false)
    }
  }

  const verifySms = async () => {
    setError('')
    setIsSubmitting(true)
    
    try {
      // Verify SMS - send phone as email (that's how it's stored)
      const verifyRes = await fetch('https://nkxnkcsvtqbbczhnpokt.supabase.co/functions/v1/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: phone, code: smsCode })
      })
      const verifyData = await verifyRes.json()
      
      if (!verifyData.ok) {
        setError(verifyData.reason === 'expired' ? 'Kód vypršal' : 'Nesprávny kód')
        setIsSubmitting(false)
        return
      }
      
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, step: 'complete' })
      })
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error)
      
      localStorage.setItem('admin', JSON.stringify(data.admin))
      router.push('/mal/admin/stats')
    } catch (err: any) {
      setError(err.message || 'Chyba pri overovaní')
    } finally {
      setIsSubmitting(false)
    }
  }

  const maskPhone = (p: string) => p ? p.slice(0, 4) + ' *** ' + p.slice(-3) : ''

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-gray-400 mt-2">
            {step === 'login' ? 'Prihláste sa pomocou hesla' : 'Zadajte SMS kód'}
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm mb-4 p-3 bg-red-900/30 rounded-xl">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 'login' && (
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500"
                autoFocus
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="password"
                placeholder="Heslo"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500"
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={isSubmitting || !email || !password}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold disabled:opacity-50"
            >
              {isSubmitting ? 'Overujem...' : 'Prihlásiť sa'}
            </button>
          </div>
        )}

        {step === 'sms' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-400 mb-4 text-center">
              SMS kód sme poslali na <span className="font-medium text-white">{maskPhone(phone)}</span>
            </p>
            
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="000000"
                value={smsCode}
                onChange={e => setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white text-center text-2xl tracking-widest placeholder-gray-500"
                maxLength={6}
                autoFocus
              />
            </div>

            <button
              onClick={verifySms}
              disabled={isSubmitting || smsCode.length !== 6}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold disabled:opacity-50"
            >
              {isSubmitting ? 'Overujem...' : 'Overiť a prihlásiť'}
            </button>

            <button
              onClick={() => { setStep('login'); setSmsCode('') }}
              className="w-full py-3 text-gray-400 hover:text-white"
            >
              Späť
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
