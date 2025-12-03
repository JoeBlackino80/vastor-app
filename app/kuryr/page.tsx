'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navigation, Mail, Lock, AlertCircle } from 'lucide-react'

export default function CourierLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/courier-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (data.courier) {
        localStorage.setItem('courier', JSON.stringify(data.courier))
        router.push('/kuryr/dashboard')
      } else {
        if (data.message === 'not_found') setError('Účet neexistuje')
        else if (data.message === 'wrong_password') setError('Nesprávne heslo')
        else if (data.message === 'no_password') setError('Účet nemá heslo, kontaktujte admin')
        else if (data.message === 'pending_approval') setError('Čakáte na schválenie')
        else if (data.message === 'rejected') setError('Váš účet bol zamietnutý')
        else setError('Prihlásenie zlyhalo')
      }
    } catch (err) {
      setError('Chyba pripojenia')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-lg">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
            <Navigation className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">VASTOR Kurýr</h1>
            <p className="text-gray-500 text-sm">Prihlásenie</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full pl-12 pr-4 py-4 bg-gray-100 rounded-xl"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Heslo"
              className="w-full pl-12 pr-4 py-4 bg-gray-100 rounded-xl"
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
          Nemáš účet? <Link href="/kuryr/registracia" className="text-black underline">Registrovať sa</Link>
        </p>
      </div>
    </div>
  )
}
