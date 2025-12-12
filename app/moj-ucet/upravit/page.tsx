'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, AlertCircle, CheckCircle } from 'lucide-react'

export default function EditProfile() {
  const router = useRouter()
  const [customer, setCustomer] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', company_name: '',
    phone: '', street: '', city: '', postal_code: '',
    ico: '', dic: '', ic_dph: ''
  })

  useEffect(() => {
    const saved = localStorage.getItem('customer')
    if (saved) {
      const c = JSON.parse(saved)
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
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch('/api/customer-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: customer.id, phone: customer.phone, ...formData })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      localStorage.setItem('customer', JSON.stringify({ ...customer, ...formData }))
      setSuccess(true)
      setTimeout(() => router.push('/moj-ucet'), 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba pri ukladaní')
    } finally {
      setIsLoading(false)
    }
  }

  if (!customer) return null
  const isCompany = customer.account_type === 'company'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto p-6">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-200 rounded-full mb-4">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold mb-6">Upraviť profil</h1>

        {success && (
          <div className="flex items-center gap-2 p-4 bg-green-100 text-green-800 rounded-xl mb-6">
            <CheckCircle className="w-5 h-5" /> Profil bol úspešne uložený
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold mb-4">{isCompany ? 'Firemné údaje' : 'Osobné údaje'}</h2>
            <div className="space-y-4">
              {isCompany ? (
                <>
                  <input type="text" placeholder="Názov spoločnosti" value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} className="w-full px-4 py-3 bg-gray-100 rounded-xl" />
                  <input type="text" placeholder="IČO" value={formData.ico} onChange={e => setFormData({...formData, ico: e.target.value})} className="w-full px-4 py-3 bg-gray-100 rounded-xl" />
                  <input type="text" placeholder="DIČ" value={formData.dic} onChange={e => setFormData({...formData, dic: e.target.value})} className="w-full px-4 py-3 bg-gray-100 rounded-xl" />
                  <input type="text" placeholder="IČ DPH" value={formData.ic_dph} onChange={e => setFormData({...formData, ic_dph: e.target.value})} className="w-full px-4 py-3 bg-gray-100 rounded-xl" />
                </>
              ) : (
                <>
                  <input type="text" placeholder="Meno" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} className="w-full px-4 py-3 bg-gray-100 rounded-xl" />
                  <input type="text" placeholder="Priezvisko" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} className="w-full px-4 py-3 bg-gray-100 rounded-xl" />
                </>
              )}
              <input type="tel" placeholder="Telefón" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 bg-gray-100 rounded-xl" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold mb-4">Adresa</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Ulica a číslo" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} className="w-full px-4 py-3 bg-gray-100 rounded-xl" />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Mesto" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-3 bg-gray-100 rounded-xl" />
                <input type="text" placeholder="PSČ" value={formData.postal_code} onChange={e => setFormData({...formData, postal_code: e.target.value})} className="w-full px-4 py-3 bg-gray-100 rounded-xl" />
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          <button type="submit" disabled={isLoading} className="w-full py-4 bg-black text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
            <Save className="w-5 h-5" /> {isLoading ? 'Ukladám...' : 'Uložiť zmeny'}
          </button>
        </form>
      </div>
    </div>
  )
}
