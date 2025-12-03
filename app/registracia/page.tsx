'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Building2, Mail, Lock, Phone, MapPin, CheckCircle, AlertCircle } from 'lucide-react'

export default function CustomerRegistration() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [accountType, setAccountType] = useState<'individual' | 'company'>('individual')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    email: '', password: '', confirmPassword: '', phone: '',
    street: '', city: '', postal_code: '', country: 'Slovensko',
    first_name: '', last_name: '',
    company_name: '', ico: '', dic: '', ic_dph: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      setError('Heslá sa nezhodujú')
      return
    }
    if (formData.password.length < 6) {
      setError('Heslo musí mať aspoň 6 znakov')
      return
    }
    setIsSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/customer-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, account_type: accountType })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registrácia zlyhala')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Registrácia úspešná!</h1>
          <p className="text-gray-600 mb-6">Teraz sa môžete prihlásiť.</p>
          <Link href="/prihlasenie" className="block w-full py-4 bg-black text-white rounded-xl font-semibold">
            Prihlásiť sa
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto p-6">
        <button onClick={() => step > 1 ? setStep(step - 1) : router.back()} className="p-2 hover:bg-gray-100 rounded-full mb-4">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold mb-2">Registrácia</h1>
        <p className="text-gray-600 mb-6">Krok {step} z 3</p>
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-black' : 'bg-gray-200'}`} />
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 && (
            <div className="space-y-4">
              <p className="font-medium mb-4">Vyberte typ účtu:</p>
              <button type="button" onClick={() => setAccountType('individual')}
                className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 ${accountType === 'individual' ? 'border-black bg-gray-50' : 'border-gray-200'}`}>
                <User className="w-6 h-6" />
                <div className="text-left"><p className="font-medium">Pre seba</p><p className="text-sm text-gray-500">Osobné objednávky</p></div>
              </button>
              <button type="button" onClick={() => setAccountType('company')}
                className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 ${accountType === 'company' ? 'border-black bg-gray-50' : 'border-gray-200'}`}>
                <Building2 className="w-6 h-6" />
                <div className="text-left"><p className="font-medium">Pre firmu</p><p className="text-sm text-gray-500">Firemné objednávky</p></div>
              </button>
              <button type="button" onClick={() => setStep(2)} className="w-full py-4 bg-black text-white rounded-xl font-semibold mt-4">
                Pokračovať
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {accountType === 'individual' ? (
                <>
                  <input type="text" placeholder="Meno *" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl" required />
                  <input type="text" placeholder="Priezvisko *" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl" required />
                </>
              ) : (
                <>
                  <input type="text" placeholder="Názov spoločnosti *" value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl" required />
                  <input type="text" placeholder="IČO *" value={formData.ico} onChange={e => setFormData({...formData, ico: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl" required />
                  <input type="text" placeholder="DIČ" value={formData.dic} onChange={e => setFormData({...formData, dic: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl" />
                  <input type="text" placeholder="IČ DPH" value={formData.ic_dph} onChange={e => setFormData({...formData, ic_dph: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl" />
                </>
              )}
              <div className="pt-2">
                <p className="text-sm font-medium text-gray-700 mb-2">Adresa</p>
                <input type="text" placeholder="Ulica a číslo *" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl mb-2" required />
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="Mesto *" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl" required />
                  <input type="text" placeholder="PSČ *" value={formData.postal_code} onChange={e => setFormData({...formData, postal_code: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl" required />
                </div>
              </div>
              <button type="button" onClick={() => setStep(3)} className="w-full py-4 bg-black text-white rounded-xl font-semibold">
                Pokračovať
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="email" placeholder="Email *" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl" required />
              </div>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="tel" placeholder="Telefón *" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl" required />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="password" placeholder="Heslo *" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl" required />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="password" placeholder="Potvrdiť heslo *" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl" required />
              </div>
              {error && <div className="flex items-center gap-2 text-red-500 text-sm"><AlertCircle className="w-4 h-4" />{error}</div>}
              <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-black text-white rounded-xl font-semibold disabled:opacity-50">
                {isSubmitting ? 'Registrujem...' : 'Registrovať sa'}
              </button>
            </div>
          )}
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Už máte účet? <Link href="/prihlasenie" className="text-black underline">Prihlásiť sa</Link>
        </p>
      </div>
    </div>
  )
}
