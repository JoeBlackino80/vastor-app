'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { UserPlus, CheckCircle, Bike, Car, AlertCircle, Phone, Lock, RefreshCw, ChevronDown, Upload, Camera, X, FileText } from 'lucide-react'

const DEV_PHONES = ['+421909188881']
const DEV_CODE = '000000'
const SUPABASE_URL = 'https://nkxnkcsvtqbbczhnpokt.supabase.co'

const COUNTRIES = [
  { code: 'SK', name: 'Slovensko', dial: '+421', flag: '🇸🇰' },
  { code: 'CZ', name: 'Česko', dial: '+420', flag: '🇨🇿' },
  { code: 'PL', name: 'Poľsko', dial: '+48', flag: '🇵🇱' },
  { code: 'HU', name: 'Maďarsko', dial: '+36', flag: '🇭🇺' },
  { code: 'AT', name: 'Rakúsko', dial: '+43', flag: '🇦🇹' },
  { code: 'DE', name: 'Nemecko', dial: '+49', flag: '🇩🇪' },
  { code: 'UA', name: 'Ukrajina', dial: '+380', flag: '🇺🇦' },
]

const LICENSE_GROUPS = ['AM', 'A1', 'A2', 'A', 'B1', 'B', 'C1', 'C', 'D1', 'D']

const Motorcycle = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 16a2 2 0 1 0 4 0 2 2 0 0 0-4 0z"/>
    <path d="M15 16a2 2 0 1 0 4 0 2 2 0 0 0-4 0z"/>
    <path d="M7 16h8"/>
    <path d="M5.5 11l1.5 5"/>
    <path d="M17 11l-1.5 5"/>
    <path d="M12 7h3l2 4"/>
    <path d="M9 11h6"/>
    <path d="M9 7l-2 4"/>
  </svg>
)

export default function CourierRegistration() {
  const [step, setStep] = useState(1)
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0])
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', birth_date: '', nationality: 'SK', id_number: '',
    phone: '',
    street: '', city: '', postal_code: '',
    vehicle_type: 'bike', license_number: '', license_group: '', vehicle_plate: '',
    iban: '', bank_name: '',
    terms_accepted: false, gdpr_accepted: false
  })

  const [documents, setDocuments] = useState({
    id_front: null as File | null,
    id_back: null as File | null,
    selfie: null as File | null
  })
  const [documentPreviews, setDocumentPreviews] = useState({
    id_front: '',
    id_back: '',
    selfie: ''
  })
  const [uploadingDoc, setUploadingDoc] = useState('')
  
  const [smsCode, setSmsCode] = useState('')
  const [pin, setPin] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const [isDevMode, setIsDevMode] = useState(false)

  const fileInputRefs = {
    id_front: useRef<HTMLInputElement>(null),
    id_back: useRef<HTMLInputElement>(null),
    selfie: useRef<HTMLInputElement>(null)
  }

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const formatIBAN = (value: string) => {
    const cleaned = value.replace(/\s/g, '').toUpperCase()
    const groups = cleaned.match(/.{1,4}/g)
    return groups ? groups.join(' ') : cleaned
  }

  const validateIBAN = (iban: string) => {
    const cleaned = iban.replace(/\s/g, '')
    if (cleaned.startsWith('SK') && cleaned.length !== 24) return 'Slovenský IBAN má 24 znakov'
    if (cleaned.startsWith('CZ') && cleaned.length !== 24) return 'Český IBAN má 24 znakov'
    if (cleaned.length < 15) return 'IBAN je príliš krátky'
    return ''
  }

  const validateField = (field: string, value: any) => {
    switch (field) {
      case 'first_name': return !value ? 'Meno je povinné' : ''
      case 'last_name': return !value ? 'Priezvisko je povinné' : ''
      case 'birth_date': return !value ? 'Dátum narodenia je povinný' : ''
      case 'phone': return !value ? 'Telefón je povinný' : ''
      case 'street': return !value ? 'Ulica je povinná' : ''
      case 'city': return !value ? 'Mesto je povinné' : ''
      case 'license_number':
        if ((formData.vehicle_type === 'motorcycle' || formData.vehicle_type === 'car') && !value) return 'Číslo vodičského preukazu je povinné'
        return ''
      case 'license_group':
        if ((formData.vehicle_type === 'motorcycle' || formData.vehicle_type === 'car') && !value) return 'Skupina vodičského preukazu je povinná'
        return ''
      case 'iban':
        if (!value) return 'IBAN je povinný'
        return validateIBAN(value)
      case 'terms_accepted': return !value ? 'Musíte súhlasiť s VOP' : ''
      case 'gdpr_accepted': return !value ? 'Musíte súhlasiť s GDPR' : ''
      default: return ''
    }
  }

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    const error = validateField(field, formData[field as keyof typeof formData])
    setErrors(prev => ({ ...prev, [field]: error }))
  }

  const updateField = (field: string, value: any) => {
    let processedValue = value
    if (field === 'iban') processedValue = formatIBAN(value)
    setFormData(prev => ({ ...prev, [field]: processedValue }))
    if (touched[field]) {
      const error = validateField(field, processedValue)
      setErrors(prev => ({ ...prev, [field]: error }))
    }
  }

  const handleFileSelect = (type: 'id_front' | 'id_back' | 'selfie', file: File | null) => {
    if (!file) return
    
    if (file.size > 10 * 1024 * 1024) {
      setError('Súbor je príliš veľký (max 10MB)')
      return
    }

    setDocuments(prev => ({ ...prev, [type]: file }))
    
    const reader = new FileReader()
    reader.onload = (e) => {
      setDocumentPreviews(prev => ({ ...prev, [type]: e.target?.result as string }))
    }
    reader.readAsDataURL(file)
    setError('')
  }

  const removeDocument = (type: 'id_front' | 'id_back' | 'selfie') => {
    setDocuments(prev => ({ ...prev, [type]: null }))
    setDocumentPreviews(prev => ({ ...prev, [type]: '' }))
  }

  const validateStep = (s: number) => {
    setError('')
    let stepErrors: Record<string, string> = {}
    let fields: string[] = []
    
    if (s === 1) fields = ['first_name', 'last_name', 'birth_date']
    else if (s === 2) fields = ['phone', 'street', 'city']
    else if (s === 3) {
      if (formData.vehicle_type === 'motorcycle' || formData.vehicle_type === 'car') {
        fields = ['license_number', 'license_group']
      }
    }
    else if (s === 4) {
      if (!documents.id_front) {
        setError('Nahrajte prednú stranu dokladu')
        return false
      }
      if (!documents.id_back) {
        setError('Nahrajte zadnú stranu dokladu')
        return false
      }
      if (!documents.selfie) {
        setError('Nahrajte selfie s dokladom')
        return false
      }
      return true
    }
    else if (s === 5) fields = ['iban', 'terms_accepted', 'gdpr_accepted']

    fields.forEach(field => {
      const error = validateField(field, formData[field as keyof typeof formData])
      if (error) stepErrors[field] = error
    })

    setErrors(prev => ({ ...prev, ...stepErrors }))
    setTouched(prev => {
      const newTouched = { ...prev }
      fields.forEach(f => newTouched[f] = true)
      return newTouched
    })

    return Object.keys(stepErrors).length === 0
  }

  const nextStep = () => { if (validateStep(step)) setStep(step + 1) }
  const prevStep = () => { setError(''); setStep(step - 1) }
  const getFullPhone = () => selectedCountry.dial + formData.phone

  const uploadDocuments = async () => {
    const fullPhone = getFullPhone()
    const uploads: Record<string, string> = {}

    for (const [type, file] of Object.entries(documents)) {
      if (!file) continue
      
      setUploadingDoc(type)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)
      formData.append('phone', fullPhone)

      const res = await fetch('/api/upload-document', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Upload zlyhal')
      
      uploads[type] = data.path
    }

    setUploadingDoc('')
    return uploads
  }

  const sendSmsOtp = async (isResend = false) => {
    if (!isResend && !validateStep(5)) return
    setIsSubmitting(true)
    setError('')
    
    const fullPhone = getFullPhone()
    
    if (DEV_PHONES.includes(fullPhone)) {
      setIsDevMode(true)
      setSmsCode('')
      setResendTimer(60)
      setStep(6)
      setIsSubmitting(false)
      return
    }
    
    try {
      if (!isResend) {
        const checkRes = await fetch('/api/check-account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: fullPhone, type: 'courier' })
        })
        const checkData = await checkRes.json()
        if (checkData.exists) { 
          setError('Telefón už je registrovaný')
          setIsSubmitting(false)
          return 
        }
      }

      const res = await fetch(SUPABASE_URL + '/functions/v1/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone })
      })
      
      if ((await res.json()).ok) {
        setSmsCode('')
        setResendTimer(60)
        if (!isResend) setStep(6)
      } else {
        setError('Nepodarilo sa odoslať SMS')
      }
    } catch { 
      setError('Chyba pripojenia') 
    }
    setIsSubmitting(false)
  }

  const verifySmsOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    
    const fullPhone = getFullPhone()
    
    try {
      if (isDevMode && smsCode === DEV_CODE) {
        setStep(7)
        setIsSubmitting(false)
        return
      }

      const res = await fetch(SUPABASE_URL + '/functions/v1/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fullPhone, code: smsCode.trim() })
      })
      const data = await res.json()
      
      if (!data.ok) { 
        setError(data.reason === 'expired' ? 'Kód vypršal' : 'Nesprávny kód')
        setIsSubmitting(false)
        return 
      }

      setStep(7)
    } catch { 
      setError('Chyba pripojenia') 
    }
    setIsSubmitting(false)
  }

  const completeRegistration = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (pin.length !== 4) { setError('PIN musí mať 4 číslice'); return }
    if (pin !== pinConfirm) { setError('PIN kódy sa nezhodujú'); return }

    setIsSubmitting(true)
    const fullPhone = getFullPhone()
    
    try {
      if (isDevMode) {
        await fetch('/api/dev-reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: fullPhone })
        })
      }

      // Upload documents first
      let documentPaths = {}
      try {
        documentPaths = await uploadDocuments()
      } catch (err: any) {
        setError(err.message || 'Chyba pri nahrávaní dokumentov')
        setIsSubmitting(false)
        return
      }

      const regRes = await fetch('/api/courier-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          phone: fullPhone,
          drivers_license: formData.license_number,
          license_group: formData.license_group,
          iban: formData.iban.replace(/\s/g, ''),
          id_document_front_url: (documentPaths as any).id_front,
          id_document_back_url: (documentPaths as any).id_back,
          selfie_url: (documentPaths as any).selfie
        })
      })
      const regData = await regRes.json()
      
      if (!regData.success) {
        setError(regData.error || 'Registrácia zlyhala')
        setIsSubmitting(false)
        return
      }

      const pinRes = await fetch('/api/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set', type: 'courier', phone: fullPhone, pin })
      })
      
      if (!pinRes.ok) throw new Error('Chyba pri nastavení PIN')

      localStorage.setItem('courier_phone', fullPhone)
      setIsSuccess(true)
    } catch (err: any) { 
      setError(err.message || 'Chyba pripojenia') 
    }
    setIsSubmitting(false)
  }

  const maskPhone = (p: string) => p ? p.slice(0, 4) + '***' + p.slice(-3) : ''

  const inputClass = (field: string) => 
    `w-full px-4 py-3 bg-gray-50 border rounded-xl transition-colors ${
      errors[field] && touched[field] ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-black'
    } focus:outline-none`

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Registrácia odoslaná!</h1>
          <p className="text-gray-600 mb-4">Vaša žiadosť bude preverená do 24 hodín. Po schválení vás budeme kontaktovať a môžete sa prihlásiť.</p>
          <p className="text-sm text-gray-500 mb-4">Môžete byť vyzvaný na doplnenie výpisu z registra trestov.</p>
          <Link href="/kuryr" className="text-black underline font-medium">Späť na prihlásenie</Link>
        </div>
      </div>
    )
  }

  const totalSteps = 7

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Registrácia kuriéra</h1>
              <p className="text-gray-500 text-sm">Krok {step} z {totalSteps}</p>
            </div>
          </div>
          <div className="flex gap-1">
            {Array.from({length: totalSteps}, (_, i) => i + 1).map(s => (
              <div key={s} className={`h-1 flex-1 rounded-full ${s < step ? 'bg-green-500' : s === step ? 'bg-black' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          {error && <div className="mb-4 p-3 bg-red-50 rounded-xl text-red-600 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4 flex-shrink-0" />{error}</div>}

          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-bold text-lg">Osobné údaje</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meno *</label>
                <input placeholder="Zadajte meno" value={formData.first_name} onChange={e => updateField('first_name', e.target.value)} onBlur={() => handleBlur('first_name')} className={inputClass('first_name')} />
                {errors.first_name && touched.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priezvisko *</label>
                <input placeholder="Zadajte priezvisko" value={formData.last_name} onChange={e => updateField('last_name', e.target.value)} onBlur={() => handleBlur('last_name')} className={inputClass('last_name')} />
                {errors.last_name && touched.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dátum narodenia *</label>
                <input type="date" value={formData.birth_date} onChange={e => updateField('birth_date', e.target.value)} onBlur={() => handleBlur('birth_date')} className={inputClass('birth_date')} />
                {errors.birth_date && touched.birth_date && <p className="text-red-500 text-sm mt-1">{errors.birth_date}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Číslo občianskeho preukazu</label>
                <input placeholder="Napr. EA123456" value={formData.id_number} onChange={e => updateField('id_number', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-black focus:outline-none" />
              </div>
            </div>
          )}

          {/* Step 2: Contact */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-bold text-lg">Kontakt a adresa</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefónne číslo *</label>
                <div className="flex gap-2">
                  <div className="relative">
                    <button type="button" onClick={() => setShowCountryDropdown(!showCountryDropdown)} className="flex items-center gap-2 px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100">
                      <span className="text-xl">{selectedCountry.flag}</span>
                      <span className="text-sm font-medium">{selectedCountry.dial}</span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                    {showCountryDropdown && (
                      <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 min-w-[200px]">
                        {COUNTRIES.map(country => (
                          <button key={country.code} type="button" onClick={() => { setSelectedCountry(country); setShowCountryDropdown(false) }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl">
                            <span className="text-xl">{country.flag}</span>
                            <span className="font-medium">{country.name}</span>
                            <span className="text-gray-500 ml-auto">{country.dial}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <input type="tel" placeholder="909 123 456" value={formData.phone} onChange={e => updateField('phone', e.target.value.replace(/\D/g, ''))} onBlur={() => handleBlur('phone')} className={`flex-1 ${inputClass('phone')}`} />
                </div>
                {errors.phone && touched.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ulica a číslo domu *</label>
                <input placeholder="Napr. Hlavná 123" value={formData.street} onChange={e => updateField('street', e.target.value)} onBlur={() => handleBlur('street')} className={inputClass('street')} />
                {errors.street && touched.street && <p className="text-red-500 text-sm mt-1">{errors.street}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mesto *</label>
                  <input placeholder="Napr. Bratislava" value={formData.city} onChange={e => updateField('city', e.target.value)} onBlur={() => handleBlur('city')} className={inputClass('city')} />
                  {errors.city && touched.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PSČ</label>
                  <input placeholder="Napr. 831 01" value={formData.postal_code} onChange={e => updateField('postal_code', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-black focus:outline-none" />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Vehicle */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-bold text-lg">Dopravný prostriedok</h2>
              
              <div className="grid grid-cols-3 gap-3">
                <button type="button" onClick={() => updateField('vehicle_type', 'bike')} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-colors ${formData.vehicle_type === 'bike' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <Bike className="w-8 h-8" />
                  <span className="text-sm font-medium">Bicykel</span>
                </button>
                <button type="button" onClick={() => updateField('vehicle_type', 'motorcycle')} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-colors ${formData.vehicle_type === 'motorcycle' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <Motorcycle className="w-8 h-8" />
                  <span className="text-sm font-medium">Motorka</span>
                </button>
                <button type="button" onClick={() => updateField('vehicle_type', 'car')} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-colors ${formData.vehicle_type === 'car' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <Car className="w-8 h-8" />
                  <span className="text-sm font-medium">Auto</span>
                </button>
              </div>

              {(formData.vehicle_type === 'motorcycle' || formData.vehicle_type === 'car') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Číslo vodičského preukazu *</label>
                    <input placeholder="Napr. AB123456" value={formData.license_number} onChange={e => updateField('license_number', e.target.value)} onBlur={() => handleBlur('license_number')} className={inputClass('license_number')} />
                    {errors.license_number && touched.license_number && <p className="text-red-500 text-sm mt-1">{errors.license_number}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Skupina vodičského preukazu *</label>
                    <select value={formData.license_group} onChange={e => updateField('license_group', e.target.value)} onBlur={() => handleBlur('license_group')} className={inputClass('license_group')}>
                      <option value="">Vyberte skupinu</option>
                      {LICENSE_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                    {errors.license_group && touched.license_group && <p className="text-red-500 text-sm mt-1">{errors.license_group}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ŠPZ vozidla</label>
                    <input placeholder="Napr. BA123AB" value={formData.vehicle_plate} onChange={e => updateField('vehicle_plate', e.target.value.toUpperCase())} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-black focus:outline-none" />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 4: Documents */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="font-bold text-lg">Overenie identity</h2>
              <p className="text-sm text-gray-500">Nahrajte fotografie dokladov pre overenie vašej totožnosti</p>
              
              {/* ID Front */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Občiansky preukaz / Pas - predná strana *</label>
                <input type="file" ref={fileInputRefs.id_front} accept="image/*" className="hidden" onChange={e => handleFileSelect('id_front', e.target.files?.[0] || null)} />
                
                {documentPreviews.id_front ? (
                  <div className="relative">
                    <img src={documentPreviews.id_front} alt="ID predná strana" className="w-full h-48 object-cover rounded-xl border border-gray-200" />
                    <button type="button" onClick={() => removeDocument('id_front')} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileInputRefs.id_front.current?.click()} className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-gray-400 hover:bg-gray-50 transition-colors">
                    <FileText className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-500">Kliknite pre nahratie</span>
                  </button>
                )}
              </div>

              {/* ID Back */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Občiansky preukaz / Pas - zadná strana *</label>
                <input type="file" ref={fileInputRefs.id_back} accept="image/*" className="hidden" onChange={e => handleFileSelect('id_back', e.target.files?.[0] || null)} />
                
                {documentPreviews.id_back ? (
                  <div className="relative">
                    <img src={documentPreviews.id_back} alt="ID zadná strana" className="w-full h-48 object-cover rounded-xl border border-gray-200" />
                    <button type="button" onClick={() => removeDocument('id_back')} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileInputRefs.id_back.current?.click()} className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-gray-400 hover:bg-gray-50 transition-colors">
                    <FileText className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-500">Kliknite pre nahratie</span>
                  </button>
                )}
              </div>

              {/* Selfie */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Selfie s dokladom *</label>
                <p className="text-xs text-gray-500 mb-2">Odfotťe sa s dokladom vedľa tváre</p>
                <input type="file" ref={fileInputRefs.selfie} accept="image/*" capture="user" className="hidden" onChange={e => handleFileSelect('selfie', e.target.files?.[0] || null)} />
                
                {documentPreviews.selfie ? (
                  <div className="relative">
                    <img src={documentPreviews.selfie} alt="Selfie" className="w-full h-48 object-cover rounded-xl border border-gray-200" />
                    <button type="button" onClick={() => removeDocument('selfie')} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileInputRefs.selfie.current?.click()} className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-gray-400 hover:bg-gray-50 transition-colors">
                    <Camera className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-500">Kliknite pre fotku alebo nahratie</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Bank & Agreements */}
          {step === 5 && (
            <div className="space-y-4">
              <h2 className="font-bold text-lg">Bankové údaje a súhlasy</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IBAN *</label>
                <input placeholder="SK89 0200 0000 0000 1234 5678" value={formData.iban} onChange={e => updateField('iban', e.target.value)} onBlur={() => handleBlur('iban')} className={inputClass('iban')} maxLength={34} />
                {errors.iban && touched.iban && <p className="text-red-500 text-sm mt-1">{errors.iban}</p>}
                <p className="text-gray-500 text-xs mt-1">Slovenský IBAN má 24 znakov</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Názov banky</label>
                <input placeholder="Napr. Slovenská sporiteľňa" value={formData.bank_name} onChange={e => updateField('bank_name', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-black focus:outline-none" />
              </div>

              <div className="pt-4 space-y-3">
                <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer ${errors.terms_accepted && touched.terms_accepted ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="checkbox" checked={formData.terms_accepted} onChange={e => updateField('terms_accepted', e.target.checked)} onBlur={() => handleBlur('terms_accepted')} className="mt-0.5 w-5 h-5 rounded" />
                  <span className="text-sm">Súhlasím s <Link href="/vop" target="_blank" className="text-black underline font-medium">Všeobecnými obchodnými podmienkami</Link> *</span>
                </label>
                {errors.terms_accepted && touched.terms_accepted && <p className="text-red-500 text-sm">{errors.terms_accepted}</p>}

                <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer ${errors.gdpr_accepted && touched.gdpr_accepted ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="checkbox" checked={formData.gdpr_accepted} onChange={e => updateField('gdpr_accepted', e.target.checked)} onBlur={() => handleBlur('gdpr_accepted')} className="mt-0.5 w-5 h-5 rounded" />
                  <span className="text-sm">Súhlasím so <Link href="/gdpr" target="_blank" className="text-black underline font-medium">spracovaním osobných údajov (GDPR)</Link> *</span>
                </label>
                {errors.gdpr_accepted && touched.gdpr_accepted && <p className="text-red-500 text-sm">{errors.gdpr_accepted}</p>}
              </div>
            </div>
          )}

          {/* Step 6: SMS Verification */}
          {step === 6 && (
            <form onSubmit={verifySmsOtp} className="space-y-4">
              <h2 className="font-bold text-lg">Overenie telefónu</h2>
              <p className="text-sm text-gray-500">
                {isDevMode ? <span className="text-orange-600">Test mód - zadajte kód 000000</span> : <>SMS kód sme poslali na {maskPhone(getFullPhone())}</>}
              </p>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" placeholder="000000" value={smsCode} onChange={e => setSmsCode(e.target.value.replace(/\D/g,'').slice(0,6))} className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-center text-2xl tracking-widest focus:border-black focus:outline-none" maxLength={6} autoFocus />
              </div>
              <button type="submit" disabled={isSubmitting || smsCode.length !== 6} className="w-full py-4 bg-black text-white rounded-xl font-semibold disabled:opacity-50">{isSubmitting ? 'Overujem...' : 'Overiť SMS'}</button>
              {!isDevMode && (
                <button type="button" onClick={() => sendSmsOtp(true)} disabled={resendTimer > 0 || isSubmitting} className="w-full py-3 text-gray-600 flex items-center justify-center gap-2 disabled:opacity-50">
                  <RefreshCw className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
                  {resendTimer > 0 ? `Znova odoslať (${resendTimer}s)` : 'Odoslať SMS znova'}
                </button>
              )}
            </form>
          )}

          {/* Step 7: PIN */}
          {step === 7 && (
            <form onSubmit={completeRegistration} className="space-y-4">
              <h2 className="font-bold text-lg">Nastavte si PIN</h2>
              <p className="text-sm text-gray-500">4-miestny PIN pre rýchle prihlásenie</p>
              
              {uploadingDoc && (
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600 text-sm flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Nahrávam dokumenty...
                </div>
              )}
              
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="password" inputMode="numeric" placeholder="PIN" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-center text-2xl tracking-widest focus:border-black focus:outline-none" maxLength={4} autoFocus />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="password" inputMode="numeric" placeholder="Potvrďte PIN" value={pinConfirm} onChange={e => setPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 4))} className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-center text-2xl tracking-widest focus:border-black focus:outline-none" maxLength={4} />
              </div>
              <button type="submit" disabled={isSubmitting || pin.length !== 4 || pinConfirm.length !== 4} className="w-full py-4 bg-black text-white rounded-xl font-semibold disabled:opacity-50">{isSubmitting ? 'Registrujem...' : 'Dokončiť registráciu'}</button>
            </form>
          )}

          {/* Navigation */}
          {step <= 5 && (
            <div className="flex gap-3 mt-6">
              {step > 1 && <button type="button" onClick={prevStep} className="flex-1 py-4 border-2 border-gray-200 rounded-xl font-semibold hover:border-gray-300">Späť</button>}
              {step < 5 ? (
                <button type="button" onClick={nextStep} className="flex-1 py-4 bg-black text-white rounded-xl font-semibold">Ďalej</button>
              ) : (
                <button type="button" onClick={() => sendSmsOtp()} disabled={isSubmitting} className="flex-1 py-4 bg-black text-white rounded-xl font-semibold disabled:opacity-50">{isSubmitting ? 'Posielam...' : 'Overiť telefón'}</button>
              )}
            </div>
          )}
        </div>
        
        <p className="text-center text-gray-500 text-sm mt-6">Už máš účet? <Link href="/kuryr" className="text-black underline">Prihlásiť sa</Link></p>
      </div>
    </div>
  )
}
