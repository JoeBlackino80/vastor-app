'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

export default function EditProfile() {
  const router = useRouter()
  const [customer, setCustomer] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', company_name: '',
    phone: '', street: '', city: '', postal_code: '',
    ico: '', dic: '', ic_dph: ''
  })

  useEffect(() => {
    loadCustomerData()
  }, [])

  const loadCustomerData = async () => {
    const saved = localStorage.getItem('customer')
    if (!saved) {
      router.push('/prihlasenie')
      return
    }

    const localCustomer = JSON.parse(saved)
    
    // Fetch fresh data from API
    try {
      const res = await fetch('/api/customer-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: localCustomer.phone })
      })
      
      if (res.ok) {
        const data = await res.json()
        const c = data.user
        setCustomer(c)
        setFormData({
          first_name: c.first_name || '',
          last_name: c.last_name || '',
          company_name: c.company_name || '',
          phone: c.phone || '',
          street: c.street || '',
          city: c.city || '',
          postal_code: c.postal_code || '',
          ico: c.ico || '',
          dic: c.dic || '',
          ic_dph: c.ic_dph || ''
        })
        // Update localStorage with fresh data
        localStorage.setItem('customer', JSON.stringify({ ...c, pin: localCustomer.pin }))
      } else {
        // Fallback to localStorage
        setCustomer(localCustomer)
        setFormData({
          first_name: localCustomer.first_name || '',
          last_name: localCustomer.last_name || '',
          company_name: localCustomer.company_name || '',
          phone: localCustomer.phone || '',
          street: localCustomer.street || '',
          city: localCustomer.city || '',
          postal_code: localCustomer.postal_code || '',
          ico: localCustomer.ico || '',
          dic: localCustomer.dic || '',
          ic_dph: localCustomer.ic_dph || ''
        })
      }
    } catch {
      // Fallback to localStorage
      setCustomer(localCustomer)
      setFormData({
        first_name: localCustomer.first_name || '',
        last_name: localCustomer.last_name || '',
        company_name: localCustomer.company_name || '',
        phone: localCustomer.phone || '',
        street: localCustomer.street || '',
        city: localCustomer.city || '',
        postal_code: localCustomer.postal_code || '',
        ico: localCustomer.ico || '',
        dic: localCustomer.dic || '',
        ic_dph: localCustomer.ic_dph || ''
      })
    }
    setIsLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')
    try {
      const res = await fetch('/api/customer-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: customer.id, phone: customer.phone, ...formData })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      // Update localStorage
      const saved = localStorage.getItem('customer')
      const localData = saved ? JSON.parse(saved) : {}
      localStorage.setItem('customer', JSON.stringify({ ...localData, ...formData }))
      
      setSuccess(true)
      setTimeout(() => router.push('/moj-ucet'), 1500)
    } catch (err: any) {
      setError(err.message || 'Chyba pri ukladaní')
    } finally {
      setIsSaving(false)
    }
  }

  const isCompany = customer?.account_type === 'company'

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto p-6">
        <button onClick={() => router.back()} className="mb-6 flex items-center gap-2 text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h1 className="text-2xl font-bold mb-6">Upraviť profil</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isCompany ? (
            <div className="bg-white rounded-2xl p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Firemné údaje</h2>
              <input
                type="text"
                placeholder="Názov firmy"
                value={formData.company_name}
                onChange={e => setFormData({...formData, company_name: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border-0"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="IČO"
                  value={formData.ico}
                  onChange={e => setFormData({...formData, ico: e.target.value})}
                  className="px-4 py-3 bg-gray-50 rounded-xl border-0"
                />
                <input
                  type="text"
                  placeholder="DIČ"
                  value={formData.dic}
                  onChange={e => setFormData({...formData, dic: e.target.value})}
                  className="px-4 py-3 bg-gray-50 rounded-xl border-0"
                />
              </div>
              <input
                type="text"
                placeholder="IČ DPH (voliteľné)"
                value={formData.ic_dph}
                onChange={e => setFormData({...formData, ic_dph: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border-0"
              />
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Osobné údaje</h2>
              <input
                type="text"
                placeholder="Meno"
                value={formData.first_name}
                onChange={e => setFormData({...formData, first_name: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border-0"
              />
              <input
                type="text"
                placeholder="Priezvisko"
                value={formData.last_name}
                onChange={e => setFormData({...formData, last_name: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border-0"
              />
              <input
                type="tel"
                placeholder="Telefón"
                value={formData.phone}
                disabled
                className="w-full px-4 py-3 bg-gray-100 rounded-xl border-0 text-gray-500"
              />
            </div>
          )}

          <div className="bg-white rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Adresa</h2>
            <input
              type="text"
              placeholder="Ulica a číslo"
              value={formData.street}
              onChange={e => setFormData({...formData, street: e.target.value})}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border-0"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Mesto"
                value={formData.city}
                onChange={e => setFormData({...formData, city: e.target.value})}
                className="px-4 py-3 bg-gray-50 rounded-xl border-0"
              />
              <input
                type="text"
                placeholder="PSČ"
                value={formData.postal_code}
                onChange={e => setFormData({...formData, postal_code: e.target.value})}
                className="px-4 py-3 bg-gray-50 rounded-xl border-0"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 text-green-500 text-sm">
              <CheckCircle className="w-4 h-4" />
              Údaje boli uložené
            </div>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-4 bg-black text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {isSaving ? 'Ukladám...' : 'Uložiť zmeny'}
          </button>
        </form>
      </div>
    </div>
  )
}
