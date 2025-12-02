'use client'
import { useState } from 'react'
import { UserPlus, CheckCircle, Truck, Bike, Car } from 'lucide-react'
import Link from 'next/link'

export default function CourierRegistration() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    vehicle_type: 'bike'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/courier-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()

      if (data.success) {
        setIsSuccess(true)
      } else {
        setError(data.error || 'Nepodarilo sa odoslat registraciu')
      }
    } catch (err) {
      setError('Chyba pri odosielani')
    }
    setIsSubmitting(false)
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Registracia odoslana!</h1>
          <p className="text-gray-600 mb-6">
            Dakujeme za registraciu. Tvoja ziadost bude preverena a schvalena administratorom. 
            O schvaleni ta budeme informovat emailom.
          </p>
          <Link href="/kuryr" className="text-black underline">Spat na prihlasenie</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-md mx-auto bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Registracia kuriera</h1>
            <p className="text-gray-500 text-sm">Pripoj sa k timu VASTOR</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Meno</label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                className="w-full px-4 py-3 bg-gray-100 rounded-xl"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Priezvisko</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                className="w-full px-4 py-3 bg-gray-100 rounded-xl"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 bg-gray-100 rounded-xl"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Telefon</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full px-4 py-3 bg-gray-100 rounded-xl"
              placeholder="+420..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Typ vozidla</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setFormData({...formData, vehicle_type: 'bike'})}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 ${formData.vehicle_type === 'bike' ? 'border-black bg-gray-50' : 'border-gray-200'}`}
              >
                <Bike className="w-6 h-6" />
                <span className="text-sm">Bicykel</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, vehicle_type: 'scooter'})}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 ${formData.vehicle_type === 'scooter' ? 'border-black bg-gray-50' : 'border-gray-200'}`}
              >
                <Truck className="w-6 h-6" />
                <span className="text-sm">Skuter</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, vehicle_type: 'car'})}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 ${formData.vehicle_type === 'car' ? 'border-black bg-gray-50' : 'border-gray-200'}`}
              >
                <Car className="w-6 h-6" />
                <span className="text-sm">Auto</span>
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-black text-white rounded-xl font-semibold disabled:opacity-50"
          >
            {isSubmitting ? 'Odosielam...' : 'Odoslat registraciu'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Uz mas ucet? <Link href="/kuryr" className="text-black underline">Prihlasit sa</Link>
        </p>
      </div>
    </div>
  )
}
