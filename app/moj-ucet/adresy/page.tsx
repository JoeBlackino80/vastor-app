'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, MapPin, Trash2, Star, Edit2 } from 'lucide-react'

export default function FavoriteAddresses() {
  const router = useRouter()
  const [customer, setCustomer] = useState<any>(null)
  const [addresses, setAddresses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', address: '', notes: '', is_default: false })

  useEffect(() => {
    const saved = localStorage.getItem('customer')
    if (saved) {
      const c = JSON.parse(saved)
      setCustomer(c)
      fetchAddresses(c.id)
    }
  }, [])

  const fetchAddresses = async (customerId: string) => {
    try {
      const res = await fetch(`/api/favorite-addresses?customer_id=${customerId}`)
      const data = await res.json()
      setAddresses(data.addresses || [])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/favorite-addresses', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, customer_id: customer.id, id: editingId })
      })
      if (res.ok) {
        fetchAddresses(customer.id)
        setShowForm(false)
        setEditingId(null)
        setFormData({ name: '', address: '', notes: '', is_default: false })
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Naozaj chcete odstrániť túto adresu?')) return
    try {
      await fetch(`/api/favorite-addresses?id=${id}`, { method: 'DELETE' })
      fetchAddresses(customer.id)
    } catch (err) {
      console.error(err)
    }
  }

  const handleEdit = (address: any) => {
    setFormData({ name: address.name, address: address.address, notes: address.notes || '', is_default: address.is_default })
    setEditingId(address.id)
    setShowForm(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto p-6">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-200 rounded-full mb-4">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Obľúbené adresy</h1>
          <button onClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: '', address: '', notes: '', is_default: false }) }} className="p-2 bg-black text-white rounded-full">
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <h2 className="font-bold mb-4">{editingId ? 'Upraviť adresu' : 'Nová adresa'}</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Názov (napr. Domov, Práca)" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-gray-100 rounded-xl" required />
              <input type="text" placeholder="Adresa" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-3 bg-gray-100 rounded-xl" required />
              <input type="text" placeholder="Poznámky (voliteľné)" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full px-4 py-3 bg-gray-100 rounded-xl" />
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.is_default} onChange={e => setFormData({...formData, is_default: e.target.checked})} className="w-5 h-5" />
                <span>Predvolená adresa</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null) }} className="flex-1 py-3 border border-gray-200 rounded-xl font-semibold">Zrušiť</button>
              <button type="submit" className="flex-1 py-3 bg-black text-white rounded-xl font-semibold">Uložiť</button>
            </div>
          </form>
        )}

        {isLoading ? (
          <p className="text-center text-gray-500">Načítavam...</p>
        ) : addresses.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Zatiaľ nemáte uložené adresy</p>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map(addr => (
              <div key={addr.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{addr.name}</p>
                        {addr.is_default && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                      </div>
                      <p className="text-sm text-gray-600">{addr.address}</p>
                      {addr.notes && <p className="text-xs text-gray-400 mt-1">{addr.notes}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(addr)} className="p-2 hover:bg-gray-100 rounded-full">
                      <Edit2 className="w-4 h-4 text-gray-400" />
                    </button>
                    <button onClick={() => handleDelete(addr.id)} className="p-2 hover:bg-gray-100 rounded-full">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
