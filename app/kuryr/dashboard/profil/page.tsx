'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, Phone, MapPin, CreditCard, Bike, Car, FileText, Mail, AlertCircle, CheckCircle, Send, Loader2 } from 'lucide-react'
import Link from 'next/link'

const Motorcycle = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="5" cy="16" r="2"/><circle cx="17" cy="16" r="2"/>
    <path d="M7 16h8M5.5 11l1.5 5M17 11l-1.5 5M12 7h3l2 4M9 11h6M9 7l-2 4"/>
  </svg>
)

export default function CourierProfile() {
  const router = useRouter()
  const [courier, setCourier] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showChangeRequest, setShowChangeRequest] = useState(false)
  const [changeMessage, setChangeMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadCourierData()
  }, [])

  const loadCourierData = async () => {
    const saved = localStorage.getItem('courier')
    if (!saved) {
      router.push('/kuryr')
      return
    }

    const localCourier = JSON.parse(saved)
    
    try {
      const res = await fetch('/api/courier-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: localCourier.phone })
      })
      
      if (res.ok) {
        const data = await res.json()
        setCourier(data.courier)
        localStorage.setItem('courier', JSON.stringify({ ...data.courier, pin: localCourier.pin }))
      } else {
        setCourier(localCourier)
      }
    } catch {
      setCourier(localCourier)
    }
    setIsLoading(false)
  }

  const sendChangeRequest = async () => {
    if (!changeMessage.trim()) {
      setError('Napíšte čo chcete zmeniť')
      return
    }

    setIsSending(true)
    setError('')

    try {
      const res = await fetch('/api/courier-change-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courier_id: courier.id,
          courier_phone: courier.phone,
          courier_name: `${courier.first_name} ${courier.last_name}`,
          message: changeMessage
        })
      })

      if (res.ok) {
        setSent(true)
        setChangeMessage('')
        setTimeout(() => {
          setShowChangeRequest(false)
          setSent(false)
        }, 3000)
      } else {
        throw new Error('Chyba pri odosielaní')
      }
    } catch (err) {
      setError('Nepodarilo sa odoslať požiadavku')
    } finally {
      setIsSending(false)
    }
  }

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'bike': return <Bike className="w-5 h-5" />
      case 'motorcycle': return <Motorcycle className="w-5 h-5" />
      case 'car': return <Car className="w-5 h-5" />
      default: return <Bike className="w-5 h-5" />
    }
  }

  const getVehicleName = (type: string) => {
    switch (type) {
      case 'bike': return 'Bicykel'
      case 'motorcycle': return 'Motorka'
      case 'car': return 'Auto'
      default: return type
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-lg mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/kuryr/dashboard" className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold">Moje údaje</h1>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
          <p className="text-yellow-400 text-sm">
            ⚠️ Údaje boli overené pri registrácii. Ak potrebujete zmenu, kontaktujte podporu.
          </p>
        </div>

        <div className="bg-gray-800 rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-green-400" />
            </div>
            <h2 className="font-semibold">Osobné údaje</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Meno</span>
              <span>{courier?.first_name} {courier?.last_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Dátum narodenia</span>
              <span>{courier?.birth_date || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Číslo OP</span>
              <span>{courier?.id_number || '—'}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Phone className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="font-semibold">Kontakt</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Telefón</span>
              <span>{courier?.phone}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="font-semibold">Adresa</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Ulica</span>
              <span>{courier?.street || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Mesto</span>
              <span>{courier?.city || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">PSČ</span>
              <span>{courier?.postal_code || '—'}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center text-orange-400">
              {getVehicleIcon(courier?.vehicle_type)}
            </div>
            <h2 className="font-semibold">Vozidlo</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Typ</span>
              <span>{getVehicleName(courier?.vehicle_type)}</span>
            </div>
            {courier?.vehicle_type !== 'bike' && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-400">Vodičský preukaz</span>
                  <span>{courier?.drivers_license || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Skupina</span>
                  <span>{courier?.license_group || '—'}</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-gray-800 rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="font-semibold">Bankové údaje</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">IBAN</span>
              <span className="text-sm">{courier?.iban || '—'}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-pink-500/20 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-pink-400" />
            </div>
            <h2 className="font-semibold">Dokumenty</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Doklad totožnosti</span>
              {courier?.documents_verified ? (
                <span className="flex items-center gap-1 text-green-400 text-sm">
                  <CheckCircle className="w-4 h-4" /> Overený
                </span>
              ) : (
                <span className="flex items-center gap-1 text-yellow-400 text-sm">
                  <AlertCircle className="w-4 h-4" /> Čaká na overenie
                </span>
              )}
            </div>
          </div>
        </div>

        {!showChangeRequest ? (
          <button
            onClick={() => setShowChangeRequest(true)}
            className="w-full py-4 bg-gray-800 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-700"
          >
            <Mail className="w-5 h-5" />
            Požiadať o zmenu údajov
          </button>
        ) : (
          <div className="bg-gray-800 rounded-2xl p-5">
            <h3 className="font-semibold mb-3">Požiadavka na zmenu</h3>
            <p className="text-gray-400 text-sm mb-4">Popíšte čo chcete zmeniť a prečo.</p>
            
            <textarea
              value={changeMessage}
              onChange={e => setChangeMessage(e.target.value)}
              placeholder="Napr. Prosím o zmenu telefónneho čísla na +421..."
              className="w-full px-4 py-3 bg-gray-700 rounded-xl border-0 text-white placeholder-gray-500 resize-none"
              rows={4}
            />

            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            {sent && (
              <p className="text-green-400 text-sm mt-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Požiadavka bola odoslaná
              </p>
            )}

            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowChangeRequest(false)} className="flex-1 py-3 bg-gray-700 rounded-xl font-semibold hover:bg-gray-600">Zrušiť</button>
              <button onClick={sendChangeRequest} disabled={isSending} className="flex-1 py-3 bg-green-500 text-black rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                {isSending ? 'Odosielam...' : 'Odoslať'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
