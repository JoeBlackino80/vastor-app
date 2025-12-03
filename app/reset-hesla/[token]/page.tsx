'use client'
import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Lock, CheckCircle, AlertCircle } from 'lucide-react'

export default function ResetPassword() {
  const router = useRouter()
  const params = useParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Heslá sa nezhodujú')
      return
    }
    if (password.length < 6) {
      setError('Heslo musí mať aspoň 6 znakov')
      return
    }
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: params.token, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Niečo sa pokazilo')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Heslo zmenené!</h1>
          <p className="text-gray-600 mb-6">Teraz sa môžete prihlásiť s novým heslom.</p>
          <Link href="/prihlasenie" className="block w-full py-4 bg-black text-white rounded-xl font-semibold">
            Prihlásiť sa
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-sm">
        <h1 className="text-2xl font-bold mb-2 text-center">Nové heslo</h1>
        <p className="text-gray-600 mb-8 text-center">Zadajte nové heslo pre váš účet.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="password" placeholder="Nové heslo" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-xl" required />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="password" placeholder="Potvrdiť heslo" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-xl" required />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          <button type="submit" disabled={isLoading} className="w-full py-4 bg-black text-white rounded-xl font-semibold disabled:opacity-50">
            {isLoading ? 'Mením heslo...' : 'Zmeniť heslo'}
          </button>
        </form>
      </div>
    </div>
  )
}
