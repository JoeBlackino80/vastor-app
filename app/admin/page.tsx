'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'

export default function AdminLogin() {
  const router = useRouter()
  const [step, setStep] = useState<'email' | 'password' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('admin')
    if (saved) {
      router.push('/admin/dashboard')
    }
  }, [router])

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) { setError('Zadajte email'); return }
    setError('')
    setStep('password')
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) { setError('Zadajte heslo'); return }
    setIsLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Nesprávne prihlasovacie údaje')
        setIsLoading(false)
        return
      }

      setStep('code')
    } catch (err) {
      setError('Chyba pripojenia')
    }
    setIsLoading(false)
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length !== 6) { setError('Zadajte 6-miestny kód'); return }
    setIsLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Nesprávny kód')
        setIsLoading(false)
        return
      }

      localStorage.setItem('admin', JSON.stringify(data.admin))
      localStorage.setItem('admin_token', data.token)
      router.push('/admin/dashboard')
    } catch (err) {
      setError('Chyba pripojenia')
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-slate-400">VORU - Správa systému</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    placeholder="admin@voru.sk"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-amber-500 focus:outline-none"
                    autoFocus
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-700 transition-all flex items-center justify-center gap-2"
              >
                Pokračovať <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          )}

          {step === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="text-center mb-4">
                <p className="text-slate-300 text-sm">{email}</p>
                <button type="button" onClick={() => setStep('email')} className="text-amber-400 text-sm hover:underline">
                  Zmeniť
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Heslo</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-amber-500 focus:outline-none"
                    autoFocus
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-700 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Overujem...' : 'Prihlásiť sa'}
              </button>
            </form>
          )}

          {step === 'code' && (
            <form onSubmit={handleCodeSubmit} className="space-y-6">
              <div className="text-center mb-4">
                <p className="text-slate-300 text-sm">Overovací kód sme poslali na</p>
                <p className="text-white font-medium">{email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">6-miestny kód</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white text-center text-2xl tracking-widest placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                  maxLength={6}
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || code.length !== 6}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-700 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Overujem...' : 'Overiť a prihlásiť'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          Prístup len pre autorizovaných administrátorov
        </p>
      </div>
    </div>
  )
}
