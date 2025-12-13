'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckCircle, Bike, Car, AlertCircle, Phone, RefreshCw, ChevronDown, Camera, X, FileText, ArrowLeft, ArrowRight } from 'lucide-react'
import Turnstile from '@/components/Turnstile'

const DEV_PHONES = ['+421909188881']
const DEV_CODE = '000000'

const COUNTRIES = [
  { code: 'SK', name: 'Slovensko', dial: '+421', flag: '🇸🇰' },
  { code: 'CZ', name: 'Česko', dial: '+420', flag: '🇨🇿' },
  { code: 'PL', name: 'Poľsko', dial: '+48', flag: '🇵🇱' },
  { code: 'HU', name: 'Maďarsko', dial: '+36', flag: '🇭🇺' },
  { code: 'AT', name: 'Rakúsko', dial: '+43', flag: '🇦🇹' },
]

const LICENSE_GROUPS = ['AM', 'A1', 'A2', 'A', 'B1', 'B', 'C1', 'C', 'D1', 'D']

const Motorcycle = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 16a2 2 0 1 0 4 0 2 2 0 0 0-4 0z"/><path d="M15 16a2 2 0 1 0 4 0 2 2 0 0 0-4 0z"/>
    <path d="M7 16h8"/><path d="M5.5 11l1.5 5"/><path d="M17 11l-1.5 5"/><path d="M12 7h3l2 4"/><path d="M9 11h6"/><path d="M9 7l-2 4"/>
  </svg>
)

export default function CourierRegistration() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0])
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', birth_date: '', id_number: '',
    phone: '', street: '', city: '', postal_code: '',
    vehicle_type: 'bike', license_number: '', license_group: '', vehicle_plate: '',
    iban: '', bank_name: '', terms_accepted: false, gdpr_accepted: false
  })
  const [documents, setDocuments] = useState({ id_front: null as File | null, id_back: null as File | null, selfie: null as File | null })
  const [documentPreviews, setDocumentPreviews] = useState({ id_front: '', id_back: '', selfie: '' })
  const [smsCode, setSmsCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const [isDevMode, setIsDevMode] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const fileInputRefs = { id_front: useRef<HTMLInputElement>(null), id_back: useRef<HTMLInputElement>(null), selfie: useRef<HTMLInputElement>(null) }

  useEffect(() => { if (resendTimer > 0) { const t = setTimeout(() => setResendTimer(r => r - 1), 1000); return () => clearTimeout(t) } }, [resendTimer])

  const formatIBAN = (v: string) => { const c = v.replace(/\s/g, '').toUpperCase(); const g = c.match(/.{1,4}/g); return g ? g.join(' ') : c }
  const validateIBAN = (iban: string) => { const c = iban.replace(/\s/g, ''); if (c.startsWith('SK') && c.length !== 24) return 'Slovenský IBAN má 24 znakov'; if (c.length < 15) return 'IBAN je príliš krátky'; return '' }
  
  const validateField = (field: string, value: any) => {
    if (field === 'first_name' && !value) return 'Meno je povinné'
    if (field === 'last_name' && !value) return 'Priezvisko je povinné'
    if (field === 'birth_date' && !value) return 'Dátum narodenia je povinný'
    if (field === 'phone' && !value) return 'Telefón je povinný'
    if (field === 'street' && !value) return 'Ulica je povinná'
    if (field === 'city' && !value) return 'Mesto je povinné'
    if (field === 'license_number' && (formData.vehicle_type === 'motorcycle' || formData.vehicle_type === 'car') && !value) return 'Číslo vodičského preukazu je povinné'
    if (field === 'iban') { if (!value) return 'IBAN je povinný'; return validateIBAN(value) }
    if (field === 'terms_accepted' && !value) return 'Musíte súhlasiť s VOP'
    if (field === 'gdpr_accepted' && !value) return 'Musíte súhlasiť s GDPR'
    return ''
  }

  const handleBlur = (field: string) => { setTouched(p => ({ ...p, [field]: true })); setErrors(p => ({ ...p, [field]: validateField(field, formData[field as keyof typeof formData]) })) }
  const updateField = (field: string, value: any) => { let v = field === 'iban' ? formatIBAN(value) : value; setFormData(p => ({ ...p, [field]: v })); if (touched[field]) setErrors(p => ({ ...p, [field]: validateField(field, v) })) }
  const getFullPhone = () => selectedCountry.dial + formData.phone
  const maskPhone = (p: string) => p ? p.slice(0, 4) + '***' + p.slice(-3) : ''

  const handleFileSelect = (type: 'id_front' | 'id_back' | 'selfie', file: File | null) => {
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { setError('Súbor je príliš veľký (max 10MB)'); return }
    setDocuments(p => ({ ...p, [type]: file }))
    const reader = new FileReader()
    reader.onload = (e) => setDocumentPreviews(p => ({ ...p, [type]: e.target?.result as string }))
    reader.readAsDataURL(file)
    setError('')
  }

  const removeDocument = (type: 'id_front' | 'id_back' | 'selfie') => { setDocuments(p => ({ ...p, [type]: null })); setDocumentPreviews(p => ({ ...p, [type]: '' })) }

  const validateStep = (s: number) => {
    setError('')
    let fields: string[] = []
    if (s === 1) fields = ['first_name', 'last_name', 'birth_date']
    else if (s === 2) fields = ['phone', 'street', 'city']
    else if (s === 3 && (formData.vehicle_type === 'motorcycle' || formData.vehicle_type === 'car')) fields = ['license_number']
    else if (s === 4) { if (!documents.id_front || !documents.id_back || !documents.selfie) { setError('Nahrajte všetky dokumenty'); return false } return true }
    else if (s === 5) fields = ['iban', 'terms_accepted', 'gdpr_accepted']
    let stepErrors: Record<string, string> = {}
    fields.forEach(f => { const e = validateField(f, formData[f as keyof typeof formData]); if (e) stepErrors[f] = e })
    setErrors(p => ({ ...p, ...stepErrors }))
    setTouched(p => { const n = { ...p }; fields.forEach(f => n[f] = true); return n })
    return Object.keys(stepErrors).length === 0
  }

  const nextStep = () => { if (validateStep(step)) setStep(step + 1) }
  const prevStep = () => { setError(''); setStep(step - 1) }

  const sendSmsOtp = async (isResend = false) => {
    if (!isResend && !validateStep(5)) return
    setIsSubmitting(true); setError('')
    const fullPhone = getFullPhone()
    if (DEV_PHONES.includes(fullPhone)) { setIsDevMode(true); setResendTimer(60); setStep(6); setIsSubmitting(false); return }
    try {
      const res = await fetch('/api/send-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: fullPhone }) })
      if (res.ok) { setResendTimer(60); if (!isResend) setStep(6) } else setError('Nepodarilo sa odoslať SMS')
    } catch { setError('Chyba pripojenia') }
    setIsSubmitting(false)
  }

  const verifySmsOtp = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setError('')
    const fullPhone = getFullPhone()
    try {
      if (isDevMode && smsCode === DEV_CODE) { await completeRegistration(); return }
      const res = await fetch('/api/verify-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: fullPhone, code: smsCode }) })
      if (res.ok) await completeRegistration()
      else setError('Nesprávny kód')
    } catch { setError('Chyba pripojenia') }
    setIsSubmitting(false)
  }

  const completeRegistration = async () => {
    setIsSubmitting(true)
    const fullPhone = getFullPhone()
    try {
      const formDataUpload = new FormData()
      if (documents.id_front) formDataUpload.append('id_front', documents.id_front)
      if (documents.id_back) formDataUpload.append('id_back', documents.id_back)
      if (documents.selfie) formDataUpload.append('selfie', documents.selfie)
      formDataUpload.append('phone', fullPhone)
      const uploadRes = await fetch('/api/upload-document', { method: 'POST', body: formDataUpload })
      const uploadData = await uploadRes.json()
      
      const regRes = await fetch('/api/courier-register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, phone: fullPhone, iban: formData.iban.replace(/\s/g, ''), id_document_front_url: uploadData.id_front, id_document_back_url: uploadData.id_back, selfie_url: uploadData.selfie })
      })
      if ((await regRes.json()).success) setIsSuccess(true)
      else setError('Registrácia zlyhala')
    } catch { setError('Chyba pripojenia') }
    setIsSubmitting(false)
  }

  const inputClass = (field: string) => 'w-full px-4 py-4 bg-white dark:bg-gray-800 border rounded-xl transition-colors focus:outline-none focus:border-green-500 dark:text-white ' + (errors[field] && touched[field] ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-600')

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center p-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-3 dark:text-white">Registrácia odoslaná</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Vaša žiadosť bude preverená do 24 hodín. Po schválení vás budeme kontaktovať.</p>
          <Link href="/kuryr/prihlasenie" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700">
            Prejsť na prihlásenie
          </Link>
        </div>
      </div>
    )
  }

  const totalSteps = 6
  const stepTitles = ['Osobné údaje', 'Kontakt', 'Vozidlo', 'Dokumenty', 'Bankové údaje', 'Overenie']

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-8 px-6">
        <div className="max-w-lg mx-auto">
          <Link href="/kuryr" className="inline-flex items-center gap-2 text-green-100 hover:text-white mb-4">
            <ArrowLeft className="w-5 h-5" /> Späť
          </Link>
          <h1 className="text-2xl font-bold mb-2">Registrácia kuriéra</h1>
          <p className="text-green-100">{stepTitles[step - 1]} - Krok {step} z {totalSteps}</p>
          <div className="flex gap-1 mt-4">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} className={'h-1.5 flex-1 rounded-full ' + (i < step ? 'bg-white' : i === step - 1 ? 'bg-white' : 'bg-green-400/40')} />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          {error && <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-center gap-2"><AlertCircle className="w-5 h-5 flex-shrink-0" />{error}</div>}

          {/* Step 1: Personal */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Meno *</label>
                <input placeholder="Vaše meno" value={formData.first_name} onChange={e => updateField('first_name', e.target.value)} onBlur={() => handleBlur('first_name')} className={inputClass('first_name')} />
                {errors.first_name && touched.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priezvisko *</label>
                <input placeholder="Vaše priezvisko" value={formData.last_name} onChange={e => updateField('last_name', e.target.value)} onBlur={() => handleBlur('last_name')} className={inputClass('last_name')} />
                {errors.last_name && touched.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dátum narodenia *</label>
                <input type="date" value={formData.birth_date} onChange={e => updateField('birth_date', e.target.value)} onBlur={() => handleBlur('birth_date')} className={inputClass('birth_date')} />
                {errors.birth_date && touched.birth_date && <p className="text-red-500 text-sm mt-1">{errors.birth_date}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Číslo OP</label>
                <input placeholder="EA123456" value={formData.id_number} onChange={e => updateField('id_number', e.target.value)} className={inputClass('id_number')} />
              </div>
              <Turnstile onVerify={setTurnstileToken} />
            </div>
          )}

          {/* Step 2: Contact */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Telefón *</label>
                <div className="flex gap-2">
                  <div className="relative">
                    <button type="button" onClick={() => setShowCountryDropdown(!showCountryDropdown)} className="flex items-center gap-2 px-3 py-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl">
                      <span>{selectedCountry.flag}</span>
                      <span className="text-sm font-medium dark:text-white">{selectedCountry.dial}</span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                    {showCountryDropdown && (
                      <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg z-10 min-w-[200px]">
                        {COUNTRIES.map(c => (
                          <button key={c.code} type="button" onClick={() => { setSelectedCountry(c); setShowCountryDropdown(false) }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <span>{c.flag}</span><span className="dark:text-white">{c.name}</span><span className="text-gray-500 ml-auto">{c.dial}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <input type="tel" placeholder="909 123 456" value={formData.phone} onChange={e => updateField('phone', e.target.value.replace(/\D/g, ''))} onBlur={() => handleBlur('phone')} className={'flex-1 ' + inputClass('phone')} />
                </div>
                {errors.phone && touched.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ulica a číslo *</label>
                <input placeholder="Hlavná 123" value={formData.street} onChange={e => updateField('street', e.target.value)} onBlur={() => handleBlur('street')} className={inputClass('street')} />
                {errors.street && touched.street && <p className="text-red-500 text-sm mt-1">{errors.street}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mesto *</label>
                  <input placeholder="Bratislava" value={formData.city} onChange={e => updateField('city', e.target.value)} onBlur={() => handleBlur('city')} className={inputClass('city')} />
                  {errors.city && touched.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">PSČ</label>
                  <input placeholder="831 01" value={formData.postal_code} onChange={e => updateField('postal_code', e.target.value)} className={inputClass('postal_code')} />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Vehicle */}
          {step === 3 && (
            <div className="space-y-5">
              <p className="text-gray-600 dark:text-gray-400">Vyberte typ vozidla, ktorým budete doručovať</p>
              <div className="grid grid-cols-3 gap-3">
                {[{ type: 'bike', icon: Bike, label: 'Bicykel' }, { type: 'motorcycle', icon: Motorcycle, label: 'Motorka' }, { type: 'car', icon: Car, label: 'Auto' }].map(v => (
                  <button key={v.type} type="button" onClick={() => updateField('vehicle_type', v.type)} className={'p-5 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ' + (formData.vehicle_type === v.type ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300')}>
                    <v.icon className={'w-10 h-10 ' + (formData.vehicle_type === v.type ? 'text-green-600' : 'text-gray-400')} />
                    <span className={'text-sm font-medium ' + (formData.vehicle_type === v.type ? 'text-green-700 dark:text-green-400' : 'dark:text-white')}>{v.label}</span>
                  </button>
                ))}
              </div>
              {(formData.vehicle_type === 'motorcycle' || formData.vehicle_type === 'car') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Číslo vodičského preukazu *</label>
                    <input placeholder="AB123456" value={formData.license_number} onChange={e => updateField('license_number', e.target.value)} onBlur={() => handleBlur('license_number')} className={inputClass('license_number')} />
                    {errors.license_number && touched.license_number && <p className="text-red-500 text-sm mt-1">{errors.license_number}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Skupina VP</label>
                    <select value={formData.license_group} onChange={e => updateField('license_group', e.target.value)} className={inputClass('license_group')}>
                      <option value="">Vyberte</option>
                      {LICENSE_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ŠPZ</label>
                    <input placeholder="BA123AB" value={formData.vehicle_plate} onChange={e => updateField('vehicle_plate', e.target.value.toUpperCase())} className={inputClass('vehicle_plate')} />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 4: Documents */}
          {step === 4 && (
            <div className="space-y-5">
              <p className="text-gray-600 dark:text-gray-400">Nahrajte fotografie dokladov pre overenie totožnosti</p>
              {['id_front', 'id_back', 'selfie'].map((type) => (
                <div key={type}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {type === 'id_front' ? 'OP - predná strana *' : type === 'id_back' ? 'OP - zadná strana *' : 'Selfie s dokladom *'}
                  </label>
                  <input type="file" ref={fileInputRefs[type as keyof typeof fileInputRefs]} accept="image/*" className="hidden" onChange={e => handleFileSelect(type as any, e.target.files?.[0] || null)} />
                  {documentPreviews[type as keyof typeof documentPreviews] ? (
                    <div className="relative">
                      <img src={documentPreviews[type as keyof typeof documentPreviews]} alt="" className="w-full h-40 object-cover rounded-xl border border-gray-200" />
                      <button type="button" onClick={() => removeDocument(type as any)} className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => fileInputRefs[type as keyof typeof fileInputRefs].current?.click()} className="w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors">
                      {type === 'selfie' ? <Camera className="w-8 h-8 text-gray-400" /> : <FileText className="w-8 h-8 text-gray-400" />}
                      <span className="text-sm text-gray-500">Kliknite pre nahratie</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Step 5: Bank */}
          {step === 5 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">IBAN *</label>
                <input placeholder="SK89 0200 0000 0000 1234 5678" value={formData.iban} onChange={e => updateField('iban', e.target.value)} onBlur={() => handleBlur('iban')} className={inputClass('iban')} maxLength={34} />
                {errors.iban && touched.iban && <p className="text-red-500 text-sm mt-1">{errors.iban}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Názov banky</label>
                <input placeholder="Slovenská sporiteľňa" value={formData.bank_name} onChange={e => updateField('bank_name', e.target.value)} className={inputClass('bank_name')} />
              </div>
              <div className="pt-4 space-y-3">
                <label className={'flex items-start gap-3 p-4 rounded-xl border cursor-pointer ' + (errors.terms_accepted && touched.terms_accepted ? 'border-red-500' : 'border-gray-200 dark:border-gray-600')}>
                  <input type="checkbox" checked={formData.terms_accepted} onChange={e => updateField('terms_accepted', e.target.checked)} className="mt-0.5 w-5 h-5 accent-green-600" />
                  <span className="text-sm dark:text-gray-300">Súhlasím s <Link href="/vop" target="_blank" className="text-green-600 underline">VOP</Link> *</span>
                </label>
                <label className={'flex items-start gap-3 p-4 rounded-xl border cursor-pointer ' + (errors.gdpr_accepted && touched.gdpr_accepted ? 'border-red-500' : 'border-gray-200 dark:border-gray-600')}>
                  <input type="checkbox" checked={formData.gdpr_accepted} onChange={e => updateField('gdpr_accepted', e.target.checked)} className="mt-0.5 w-5 h-5 accent-green-600" />
                  <span className="text-sm dark:text-gray-300">Súhlasím s <Link href="/gdpr" target="_blank" className="text-green-600 underline">GDPR</Link> *</span>
                </label>
              </div>
            </div>
          )}

          {/* Step 6: SMS */}
          {step === 6 && (
            <form onSubmit={verifySmsOtp} className="space-y-5">
              <p className="text-gray-600 dark:text-gray-400 text-center">
                {isDevMode ? <span className="text-orange-600">Test mód - zadajte 000000</span> : <>SMS kód sme poslali na {maskPhone(getFullPhone())}</>}
              </p>
              <input type="text" inputMode="numeric" placeholder="000000" value={smsCode} onChange={e => setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 6))} className="w-full px-4 py-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-center text-3xl tracking-widest focus:border-green-500 focus:outline-none dark:text-white" maxLength={6} autoFocus />
              <button type="submit" disabled={isSubmitting || smsCode.length !== 6} className="w-full py-4 bg-green-600 text-white rounded-xl font-semibold disabled:opacity-50 hover:bg-green-700">
                {isSubmitting ? 'Registrujem...' : 'Dokončiť registráciu'}
              </button>
              {!isDevMode && (
                <button type="button" onClick={() => sendSmsOtp(true)} disabled={resendTimer > 0} className="w-full py-3 text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  {resendTimer > 0 ? 'Znova odoslať (' + resendTimer + 's)' : 'Odoslať SMS znova'}
                </button>
              )}
            </form>
          )}

          {/* Navigation */}
          {step < 6 && (
            <div className="flex gap-3 mt-8">
              {step > 1 && <button type="button" onClick={prevStep} className="flex-1 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl font-semibold hover:border-gray-300 dark:text-white">Späť</button>}
              {step < 5 ? (
                <button type="button" onClick={nextStep} className="flex-1 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 flex items-center justify-center gap-2">
                  Ďalej <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button type="button" onClick={() => sendSmsOtp()} disabled={isSubmitting} className="flex-1 py-4 bg-green-600 text-white rounded-xl font-semibold disabled:opacity-50 hover:bg-green-700">
                  {isSubmitting ? 'Posielam...' : 'Overiť telefón'}
                </button>
              )}
            </div>
          )}
        </div>

        <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-6">
          Už máš účet? <Link href="/kuryr/prihlasenie" className="text-green-600 underline">Prihlásiť sa</Link>
        </p>
      </div>
    </div>
  )
}
