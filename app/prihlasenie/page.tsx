'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Lock, AlertCircle } from 'lucide-react'

export default function CustomerLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch('/api/customer-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      localStorage.setItem('customer', JSON.stringify(data.customer))
      router.push('/moj-ucet')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Prihlásenie zlyhalo')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto p-6">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full mb-4">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold mb-2">Prihlásenie</h1>
        <p className="text-gray-600 mb-8">Prihláste sa do svojho účtu</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="password"
              placeholder="Heslo"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl"
              required
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-black text-white rounded-xl font-semibold disabled:opacity-50"
          >
            {isLoading ? 'Prihlasujem...' : 'Prihlásiť sa'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Nemáte účet? <Link href="/registracia" className="text-black underline">Registrovať sa</Link>
        </p>
      </div>
    </div>
  )
}
