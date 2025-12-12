'use client'
import { useState, useEffect, Suspense } from 'react'
import Turnstile from '@/components/Turnstile'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, FileText, MapPin, Clock, Crown, CheckCircle, ChevronDown, Mail, Phone as PhoneIcon } from 'lucide-react'

const COUNTRIES = [
  { code: 'SK', name: 'Slovensko', dial: '+421', flag: '🇸🇰' },
  { code: 'CZ', name: 'Česko', dial: '+420', flag: '🇨🇿' },
  { code: 'PL', name: 'Poľsko', dial: '+48', flag: '🇵🇱' },
  { code: 'HU', name: 'Maďarsko', dial: '+36', flag: '🇭🇺' },
  { code: 'AT', name: 'Rakúsko', dial: '+43', flag: '🇦🇹' },
]

const PACKAGE_SIZES = {
  envelope: { label: 'Obálka / Dokument', desc: 'do 1kg, do 35×25cm', extra: 0, vehicles: ['bike', 'motorcycle', 'car'] },
  small: { label: 'Malý balík', desc: 'do 5kg, do 40cm', extra: 0, vehicles: ['bike', 'motorcycle', 'car'] },
  medium: { label: 'Stredný balík', desc: 'do 10kg, do 60cm', extra: 2, vehicles: ['motorcycle', 'car'] },
  large: { label: 'Veľký balík', desc: 'do 15kg, do 80cm', extra: 4, vehicles: ['car'] }
}

const SERVICE_PRICES = { standard: 4.90, express: 7.90, premium: 12.90 }
const INSURANCE_PRICES: Record<number, number> = { 0: 0, 100: 1, 500: 3, 1000: 5 }

function OrderForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isReorder = searchParams.get('reorder') === 'true'
  const [customer, setCustomer] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')
  const [pickupCountry, setPickupCountry] = useState(COUNTRIES[0])
  const [deliveryCountry, setDeliveryCountry] = useState(COUNTRIES[0])
  const [showPickupCountry, setShowPickupCountry] = useState(false)
  const [showDeliveryCountry, setShowDeliveryCountry] = useState(false)
  
  const [formData, setFormData] = useState({
    pickup_company: '',
    pickup_name: '',
    pickup_surname: '',
    pickup_street: '',
    pickup_city: '',
    pickup_postal: '',
    pickup_country: 'Slovensko',
    pickup_phone: '',
    pickup_floor: '',
    pickup_doorbell: '',
    pickup_notes: '',
    delivery_company: '',
    delivery_name: '',
    delivery_surname: '',
    delivery_street: '',
    delivery_city: '',
    delivery_postal: '',
    delivery_country: 'Slovensko',
    delivery_phone: '',
    delivery_email: '',
    delivery_floor: '',
    delivery_doorbell: '',
    delivery_notes: '',
    package_size: 'small',
    package_description: '',
    service_type: 'standard',
    pickup_time: 'now',
    pickup_datetime: '',
    insurance: 0,
    photo_confirmation: false,
    reverse_delivery: false,
    order_notes: ''
  })

  useEffect(() => {
    const saved = localStorage.getItem('customer')
    if (saved) {
      const c = JSON.parse(saved)
      setCustomer(c)
      setFormData(prev => ({
        ...prev,
        pickup_name: c.first_name || '',
        pickup_surname: c.last_name || '',
        pickup_company: c.company_name || '',
        pickup_street: c.street || '',
        pickup_city: c.city || '',
        pickup_postal: c.postal_code || '',
        pickup_phone: c.phone?.replace(/^\+\d{2,3}/, '') || ''
      }))
    }

    if (isReorder) {
      const reorderData = localStorage.getItem('reorder')
      if (reorderData) {
        const data = JSON.parse(reorderData)
        setFormData(prev => ({ ...prev, ...data }))
        localStorage.removeItem('reorder')
      }
    }
  }, [isReorder])

  const calculatePrice = () => {
    let total = SERVICE_PRICES[formData.service_type as keyof typeof SERVICE_PRICES] || 4.90
    total += PACKAGE_SIZES[formData.package_size as keyof typeof PACKAGE_SIZES]?.extra || 0
    total += INSURANCE_PRICES[formData.insurance] || 0
    if (formData.reverse_delivery) total *= 1.5
    return total
  }

  const price = calculatePrice()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    
    try {
      const verifyRes = await fetch('/api/verify-turnstile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: turnstileToken })
      })
      if (!verifyRes.ok) throw new Error('Verifikácia zlyhala.')

      const fullPickupPhone = pickupCountry.dial + formData.pickup_phone
      const fullDeliveryPhone = deliveryCountry.dial + formData.delivery_phone
      const allowedVehicles = PACKAGE_SIZES[formData.package_size as keyof typeof PACKAGE_SIZES]?.vehicles || ['car']

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          pickup_phone: fullPickupPhone,
          delivery_phone: fullDeliveryPhone,
          allowed_vehicles: allowedVehicles,
          price,
          pickup_address: `${formData.pickup_street}, ${formData.pickup_postal} ${formData.pickup_city}, ${formData.pickup_country}`,
          delivery_address: `${formData.delivery_street}, ${formData.delivery_postal} ${formData.delivery_city}, ${formData.delivery_country}`,
          recipient_name: formData.delivery_name,
          recipient_surname: formData.delivery_surname,
          recipient_phone: fullDeliveryPhone,
          recipient_email: formData.delivery_email
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setIsSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Niečo sa pokazilo')
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClass = "w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-xl border border-transparent focus:border-black focus:outline-none"

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-lg mx-auto p-6 pt-12">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-sm">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-2 dark:text-white">Objednávka prijatá!</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Kuriér bude priradený čo najskôr. Príjemca dostane SMS s tracking linkom.</p>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 mb-6">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Celková cena</p>
              <p className="text-3xl font-bold dark:text-white">{price.toFixed(2)} €</p>
            </div>
            <Link href="/" className="block w-full py-4 bg-black text-white rounded-xl font-semibold">
              Späť na hlavnú stránku
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto p-6">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full mb-4">
          <ArrowLeft className="w-6 h-6 dark:text-white" />
        </button>
        <h1 className="text-2xl font-bold mb-6 dark:text-white">
          {isReorder ? 'Objednať znova' : 'Nová objednávka'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Odosielateľ */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold mb-4 dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5" /> Odosielateľ (miesto vyzdvihnutia)
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Firma (voliteľné)" value={formData.pickup_company} onChange={e => setFormData({...formData, pickup_company: e.target.value})} className={`col-span-2 ${inputClass}`} />
              <input type="text" placeholder="Meno *" value={formData.pickup_name} onChange={e => setFormData({...formData, pickup_name: e.target.value})} className={inputClass} required />
              <input type="text" placeholder="Priezvisko *" value={formData.pickup_surname} onChange={e => setFormData({...formData, pickup_surname: e.target.value})} className={inputClass} required />
              <input type="text" placeholder="Ulica a číslo *" value={formData.pickup_street} onChange={e => setFormData({...formData, pickup_street: e.target.value})} className={`col-span-2 ${inputClass}`} required />
              <input type="text" placeholder="Mesto *" value={formData.pickup_city} onChange={e => setFormData({...formData, pickup_city: e.target.value})} className={inputClass} required />
              <input type="text" placeholder="PSČ *" value={formData.pickup_postal} onChange={e => setFormData({...formData, pickup_postal: e.target.value})} className={inputClass} required />
              
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefón *</label>
                <div className="flex gap-2">
                  <div className="relative">
                    <button type="button" onClick={() => setShowPickupCountry(!showPickupCountry)} className="flex items-center gap-2 px-3 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl">
                      <span className="text-xl">{pickupCountry.flag}</span>
                      <span className="text-sm font-medium dark:text-white">{pickupCountry.dial}</span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                    {showPickupCountry && (
                      <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg z-10 min-w-[180px]">
                        {COUNTRIES.map(c => (
                          <button key={c.code} type="button" onClick={() => { setPickupCountry(c); setShowPickupCountry(false); setFormData({...formData, pickup_country: c.name}) }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-xl last:rounded-b-xl">
                            <span className="text-xl">{c.flag}</span>
                            <span className="font-medium dark:text-white">{c.name}</span>
                            <span className="text-gray-500 ml-auto">{c.dial}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <input type="tel" placeholder="909 123 456" value={formData.pickup_phone} onChange={e => setFormData({...formData, pickup_phone: e.target.value.replace(/\D/g, '')})} className={`flex-1 ${inputClass}`} required />
                </div>
              </div>

              <input type="text" placeholder="Poschodie" value={formData.pickup_floor} onChange={e => setFormData({...formData, pickup_floor: e.target.value})} className={inputClass} />
              <input type="text" placeholder="Meno pri zvončeku" value={formData.pickup_doorbell} onChange={e => setFormData({...formData, pickup_doorbell: e.target.value})} className={inputClass} />
              <textarea placeholder="Poznámky pre kuriéra" value={formData.pickup_notes} onChange={e => setFormData({...formData, pickup_notes: e.target.value})} className={`col-span-2 ${inputClass}`} rows={2} />
            </div>
          </div>

          {/* Príjemca */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold mb-4 dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5" /> Príjemca (miesto doručenia)
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Firma (voliteľné)" value={formData.delivery_company} onChange={e => setFormData({...formData, delivery_company: e.target.value})} className={`col-span-2 ${inputClass}`} />
              <input type="text" placeholder="Meno *" value={formData.delivery_name} onChange={e => setFormData({...formData, delivery_name: e.target.value})} className={inputClass} required />
              <input type="text" placeholder="Priezvisko *" value={formData.delivery_surname} onChange={e => setFormData({...formData, delivery_surname: e.target.value})} className={inputClass} required />
              <input type="text" placeholder="Ulica a číslo *" value={formData.delivery_street} onChange={e => setFormData({...formData, delivery_street: e.target.value})} className={`col-span-2 ${inputClass}`} required />
              <input type="text" placeholder="Mesto *" value={formData.delivery_city} onChange={e => setFormData({...formData, delivery_city: e.target.value})} className={inputClass} required />
              <input type="text" placeholder="PSČ *" value={formData.delivery_postal} onChange={e => setFormData({...formData, delivery_postal: e.target.value})} className={inputClass} required />
              
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefón *</label>
                <div className="flex gap-2">
                  <div className="relative">
                    <button type="button" onClick={() => setShowDeliveryCountry(!showDeliveryCountry)} className="flex items-center gap-2 px-3 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl">
                      <span className="text-xl">{deliveryCountry.flag}</span>
                      <span className="text-sm font-medium dark:text-white">{deliveryCountry.dial}</span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                    {showDeliveryCountry && (
                      <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg z-10 min-w-[180px]">
                        {COUNTRIES.map(c => (
                          <button key={c.code} type="button" onClick={() => { setDeliveryCountry(c); setShowDeliveryCountry(false); setFormData({...formData, delivery_country: c.name}) }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-xl last:rounded-b-xl">
                            <span className="text-xl">{c.flag}</span>
                            <span className="font-medium dark:text-white">{c.name}</span>
                            <span className="text-gray-500 ml-auto">{c.dial}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <input type="tel" placeholder="909 123 456" value={formData.delivery_phone} onChange={e => setFormData({...formData, delivery_phone: e.target.value.replace(/\D/g, '')})} className={`flex-1 ${inputClass}`} required />
                </div>
              </div>

              <input type="email" placeholder="Email (pre tracking)" value={formData.delivery_email} onChange={e => setFormData({...formData, delivery_email: e.target.value})} className={`col-span-2 ${inputClass}`} />
              <input type="text" placeholder="Poschodie" value={formData.delivery_floor} onChange={e => setFormData({...formData, delivery_floor: e.target.value})} className={inputClass} />
              <input type="text" placeholder="Meno pri zvončeku" value={formData.delivery_doorbell} onChange={e => setFormData({...formData, delivery_doorbell: e.target.value})} className={inputClass} />
              <textarea placeholder="Poznámky pre kuriéra" value={formData.delivery_notes} onChange={e => setFormData({...formData, delivery_notes: e.target.value})} className={`col-span-2 ${inputClass}`} rows={2} />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">Príjemca dostane SMS s tracking linkom</p>
          </div>

          {/* Veľkosť zásielky */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold mb-4 dark:text-white">Veľkosť zásielky</h2>
            <div className="space-y-3">
              {Object.entries(PACKAGE_SIZES).map(([key, val]) => (
                <button key={key} type="button" onClick={() => setFormData({...formData, package_size: key})}
                  className={`w-full p-4 rounded-xl border-2 flex items-center justify-between ${formData.package_size === key ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-700' : 'border-gray-200 dark:border-gray-600'}`}>
                  <div className="flex items-center gap-3">
                    {key === 'envelope' ? <FileText className="w-5 h-5 dark:text-white" /> : <Package className="w-5 h-5 dark:text-white" />}
                    <div className="text-left">
                      <p className="font-medium dark:text-white">{val.label}</p>
                      <p className="text-sm text-gray-500">{val.desc}</p>
                    </div>
                  </div>
                  <span className="font-semibold dark:text-white">{val.extra === 0 ? 'Základ' : `+${val.extra} €`}</span>
                </button>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Nad 15kg alebo nad 80cm? <a href="mailto:info@voru.sk" className="underline font-medium">Kontaktujte nás</a> pre individuálnu cenu.
              </p>
            </div>
            <input type="text" placeholder="Popis zásielky (napr. elektronika, dokumenty...)" value={formData.package_description} onChange={e => setFormData({...formData, package_description: e.target.value})} className={`mt-4 ${inputClass}`} />
          </div>

          {/* Čas vyzdvihnutia */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold mb-4 dark:text-white">Kedy vyzdvihnúť</h2>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setFormData({...formData, pickup_time: 'now'})}
                className={`p-4 rounded-xl border-2 text-center ${formData.pickup_time === 'now' ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-700' : 'border-gray-200 dark:border-gray-600'}`}>
                <p className="font-semibold dark:text-white">Čo najskôr</p>
                <p className="text-sm text-gray-500">Kuriér príde hneď</p>
              </button>
              <button type="button" onClick={() => setFormData({...formData, pickup_time: 'scheduled'})}
                className={`p-4 rounded-xl border-2 text-center ${formData.pickup_time === 'scheduled' ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-700' : 'border-gray-200 dark:border-gray-600'}`}>
                <p className="font-semibold dark:text-white">Naplánovať</p>
                <p className="text-sm text-gray-500">Vybrať dátum a čas</p>
              </button>
            </div>
            {formData.pickup_time === 'scheduled' && (
              <input type="datetime-local" value={formData.pickup_datetime} onChange={e => setFormData({...formData, pickup_datetime: e.target.value})} className={`mt-3 ${inputClass}`} required />
            )}
          </div>

          {/* Rýchlosť doručenia */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold mb-4 dark:text-white">Rýchlosť doručenia</h2>
            <div className="space-y-3">
              {[
                { id: 'standard', icon: Clock, label: 'Štandard', desc: 'Do 120 minút', price: '4,90 €' },
                { id: 'express', icon: MapPin, label: 'Express', desc: 'Do 60 minút', price: '7,90 €' },
                { id: 'premium', icon: Crown, label: 'Premium', desc: 'Do 45 minút', price: '12,90 €' }
              ].map(service => (
                <button key={service.id} type="button" onClick={() => setFormData({...formData, service_type: service.id})}
                  className={`w-full p-4 rounded-xl border-2 flex items-center justify-between ${formData.service_type === service.id ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-700' : 'border-gray-200 dark:border-gray-600'}`}>
                  <div className="flex items-center gap-3">
                    <service.icon className="w-5 h-5 dark:text-white" />
                    <div className="text-left">
                      <p className="font-medium dark:text-white">{service.label}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{service.desc}</p>
                    </div>
                  </div>
                  <p className="font-semibold dark:text-white">{service.price}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Poistenie */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold mb-4 dark:text-white">Poistenie zásielky</h2>
            <div className="space-y-3">
              {[
                { value: 0, label: 'Bez poistenia', price: '0 €' },
                { value: 100, label: 'Poistenie do 100 €', price: '+1 €' },
                { value: 500, label: 'Poistenie do 500 €', price: '+3 €' },
                { value: 1000, label: 'Poistenie do 1000 €', price: '+5 €' }
              ].map(ins => (
                <button key={ins.value} type="button" onClick={() => setFormData({...formData, insurance: ins.value})}
                  className={`w-full p-4 rounded-xl border-2 flex items-center justify-between ${formData.insurance === ins.value ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-700' : 'border-gray-200 dark:border-gray-600'}`}>
                  <span className="dark:text-white">{ins.label}</span>
                  <span className="font-semibold dark:text-white">{ins.price}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Ďalšie možnosti */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-bold dark:text-white">Ďalšie možnosti</h2>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium dark:text-white">Foto potvrdenie doručenia</p>
                <p className="text-sm text-gray-500">Kuriér odfotí doručenú zásielku</p>
              </div>
              <button type="button" onClick={() => setFormData({...formData, photo_confirmation: !formData.photo_confirmation})}
                className={`w-14 h-8 rounded-full transition-colors ${formData.photo_confirmation ? 'bg-black dark:bg-white' : 'bg-gray-300 dark:bg-gray-600'}`}>
                <div className={`w-6 h-6 rounded-full bg-white dark:bg-gray-800 shadow transform transition-transform ${formData.photo_confirmation ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium dark:text-white">Spiatočná zásielka</p>
                <p className="text-sm text-gray-500">Kuriér prinesie dokumenty späť (+50%)</p>
              </div>
              <button type="button" onClick={() => setFormData({...formData, reverse_delivery: !formData.reverse_delivery})}
                className={`w-14 h-8 rounded-full transition-colors ${formData.reverse_delivery ? 'bg-black dark:bg-white' : 'bg-gray-300 dark:bg-gray-600'}`}>
                <div className={`w-6 h-6 rounded-full bg-white dark:bg-gray-800 shadow transform transition-transform ${formData.reverse_delivery ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          {/* Poznámka */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold mb-4 dark:text-white">Poznámka k objednávke</h2>
            <textarea placeholder="Špeciálne inštrukcie, krehký tovar, volať pred doručením..." value={formData.order_notes} onChange={e => setFormData({...formData, order_notes: e.target.value})} className={`${inputClass} min-h-[100px] resize-none`} />
          </div>

          {error && <p className="text-red-500 text-center">{error}</p>}

          {/* Súhrn a odoslanie */}
          <div className="bg-black text-white rounded-2xl p-6">
            <h3 className="font-bold mb-4">Súhrn ceny</h3>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Doručenie ({formData.service_type})</span>
                <span>{SERVICE_PRICES[formData.service_type as keyof typeof SERVICE_PRICES]?.toFixed(2)} €</span>
              </div>
              {PACKAGE_SIZES[formData.package_size as keyof typeof PACKAGE_SIZES]?.extra > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Príplatok za veľkosť</span>
                  <span>+{PACKAGE_SIZES[formData.package_size as keyof typeof PACKAGE_SIZES]?.extra.toFixed(2)} €</span>
                </div>
              )}
              {formData.insurance > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Poistenie do {formData.insurance} €</span>
                  <span>+{INSURANCE_PRICES[formData.insurance]?.toFixed(2)} €</span>
                </div>
              )}
              {formData.reverse_delivery && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Spiatočná zásielka (+50%)</span>
                  <span>zahrnuté</span>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center border-t border-gray-700 pt-4 mb-4">
              <span className="text-gray-400">Celková cena</span>
              <span className="text-3xl font-bold">{price.toFixed(2)} €</span>
            </div>
            <Turnstile onVerify={setTurnstileToken} />
            <button type="submit" disabled={isSubmitting || !turnstileToken} className="w-full py-4 bg-white text-black font-semibold rounded-xl disabled:opacity-50 mt-4">
              {isSubmitting ? 'Odosielam...' : 'Odoslať objednávku'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function OrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center"><p className="dark:text-white">Načítavam...</p></div>}>
      <OrderForm />
    </Suspense>
  )
}
