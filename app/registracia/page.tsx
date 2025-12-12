'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Building2, User, ArrowLeft, CheckCircle, AlertCircle, Phone, RefreshCw, Lock, ChevronDown } from 'lucide-react'
import Turnstile from '@/components/Turnstile'

const DEV_PHONES = ['+421909188881']
const DEV_CODE = '000000'

const COUNTRIES = [
  { code: 'SK', name: 'Slovensko', dial: '+421', flag: '🇸🇰' },
  { code: 'CZ', name: 'Česko', dial: '+420', flag: '🇨🇿' },
  { code: 'PL', name: 'Poľsko', dial: '+48', flag: '🇵🇱' },
  { code: 'HU', name: 'Maďarsko', dial: '+36', flag: '🇭🇺' },
  { code: 'AT', name: 'Rakúsko', dial: '+43', flag: '🇦🇹' },
  { code: 'DE', name: 'Nemecko', dial: '+49', flag: '🇩🇪' },
  { code: 'UA', name: 'Ukrajina', dial: '+380', flag: '🇺🇦' },
]

export default function RegistrationPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [accountType, setAccountType] = useState<'individual' | 'company'>('individual')
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0])
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [success, setSuccess] = useState(false)
  const [smsCode, setSmsCode] = useState('')
  const [pin, setPin] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const [isDevMode, setIsDevMode] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    ico: '',
    dic: '',
    icDph: '',
    phone: '',
    street: '',
    city: '',
    postalCode: ''
  })

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const validateField = (field: string, value: string) => {
    if (accountType === 'individual') {
      switch (field) {
        case 'firstName': return !value ? 'Meno je povinné' : ''
        case 'lastName': return !value ? 'Priezvisko je povinné' : ''
        case 'phone': return !value ? 'Telefón je povinný' : ''
        case 'street': return !value ? 'Ulica je povinná' : ''
        case 'city': return !value ? 'Mesto je povinné' : ''
        case 'postalCode': return !value ? 'PSČ je povinné' : ''
        default: return ''
      }
    } else {
      switch (field) {
        case 'companyName': return !value ? 'Názov firmy je povinný' : ''
        case 'ico': return !value ? 'IČO je povinné' : ''
        case 'dic': return !value ? 'DIČ je povinné' : ''
        case 'phone': return !value ? 'Telefón je povinný' : ''
        case 'street': return !value ? 'Ulica je povinná' : ''
        case 'city': return !value ? 'Mesto je povinné' : ''
        case 'postalCode': return !value ? 'PSČ je povinné' : ''
        default: return ''
      }
    }
  }

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    const error = validateField(field, formData[field as keyof typeof formData])
    setErrors(prev => ({ ...prev, [field]: error }))
  }

  const updateForm = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (touched[field]) {
      const error = validateField(field, value)
      setErrors(prev => ({ ...prev, [field]: error }))
    }
  }

  const maskPhone = (phone: string) => {
    if (phone.length < 6) return phone
    return phone.slice(0, 4) + ' *** ' + phone.slice(-3)
  }

  const getFullPhone = () => selectedCountry.dial + formData.phone

  const validateStep = (s: number) => {
    setError('')
    let stepErrors: Record<string, string> = {}
    let fields: string[] = []

    if (s === 2) {
      if (accountType === 'individual') {
        fields = ['firstName', 'lastName', 'street', 'city', 'postalCode']
      } else {
        fields = ['companyName', 'ico', 'dic', 'street', 'city', 'postalCode']
      }
    } else if (s === 3) {
      fields = ['phone']
    }

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

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const sendSmsOtp = async (isResend = false) => {
    if (!isResend && !validateStep(3)) return
    
    setError('')
    setIsSubmitting(true)
    const fullPhone = getFullPhone()
    
    if (DEV_PHONES.includes(fullPhone)) {
      setIsDevMode(true)
      setSmsCode('')
      setResendTimer(60)
      setStep(4)
      setIsSubmitting(false)
      return
    }
    
    try {
      if (!isResend) {
        const checkRes = await fetch('/api/check-account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: fullPhone, type: 'customer' })
        })
        const checkData = await checkRes.json()
        if (checkData.exists) {
          setError('Účet s týmto telefónom už existuje. Môžete sa prihlásiť.')
          setIsSubmitting(false)
          return
        }
      }

      const res = await fetch('https://nkxnkcsvtqbbczhnpokt.supabase.co/functions/v1/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone })
      })
      
      if (!res.ok) throw new Error('Nepodarilo sa odoslať SMS')
      
      setSmsCode('')
      setResendTimer(60)
      if (!isResend) setStep(4)
    } catch (err) {
      setError('Chyba pri odosielaní SMS')
    } finally {
      setIsSubmitting(false)
    }
  }

  const verifySmsOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    const fullPhone = getFullPhone()
    
    try {
      if (isDevMode && smsCode === DEV_CODE) {
        setStep(5)
        setIsSubmitting(false)
        return
      }

      const res = await fetch('https://nkxnkcsvtqbbczhnpokt.supabase.co/functions/v1/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fullPhone, code: smsCode })
      })
      
      const data = await res.json()
      if (!data.ok) {
        setError(data.reason === 'expired' ? 'Kód vypršal, vyžiadajte nový' : 'Nesprávny kód')
        setIsSubmitting(false)
        return
      }
      
      setStep(5)
    } catch (err) {
      setError('Chyba pri overovaní')
    } finally {
      setIsSubmitting(false)
    }
  }

  const completeRegistration = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (pin.length !== 4) {
      setError('PIN musí mať 4 číslice')
      return
    }
    if (pin !== pinConfirm) {
      setError('PIN kódy sa nezhodujú')
      return
    }

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

      const res = await fetch('/api/customer-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          phone: fullPhone,
          accountType
        })
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Chyba registrácie')
      
      const pinRes = await fetch('/api/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set',
          type: 'customer',
          phone: fullPhone,
          pin: pin
        })
      })
      
      if (!pinRes.ok) throw new Error('Chyba pri nastavení PIN')
      
      localStorage.setItem('customer_phone', fullPhone)
      
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Chyba pri registrácii')
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClass = (field: string) => 
    `w-full px-4 py-4 bg-white border rounded-xl transition-colors ${
      errors[field] && touched[field] ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-black'
    } focus:outline-none`

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Registrácia úspešná!</h1>
          <p className="text-gray-600 mb-6">Váš účet bol vytvorený. Môžete sa prihlásiť pomocou telefónu a PIN.</p>
          <Link href="/prihlasenie" className="inline-block px-6 py-3 bg-black text-white rounded-xl font-semibold">
            Prihlásiť sa
          </Link>
        </div>
      </div>
    )
  }

  const totalSteps = 5

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto p-6">
        <button onClick={() => step > 1 ? setStep(step - 1) : router.back()} className="p-2 hover:bg-gray-100 rounded-full mb-4">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold mb-2">Registrácia</h1>
        <p className="text-gray-600 mb-6">Krok {step} z {totalSteps}</p>
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i < step ? 'bg-green-500' : i === step ? 'bg-black' : 'bg-gray-200'}`} />
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-500 text-sm mb-4 p-3 bg-red-50 rounded-xl">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
            {error.includes('prihlásiť') && (
              <Link href="/prihlasenie" className="ml-auto text-black underline font-medium">Prihlásiť</Link>
            )}
          </div>
        )}

        {/* Step 1: Account Type */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="font-medium mb-4">Vyberte typ účtu:</p>
            <button type="button" onClick={() => setAccountType('individual')}
              className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 ${accountType === 'individual' ? 'border-black bg-gray-50' : 'border-gray-200'}`}>
              <User className="w-6 h-6" />
              <div className="text-left">
                <div className="font-semibold">Fyzická osoba</div>
                <div className="text-sm text-gray-500">Pre osobné použitie</div>
              </div>
            </button>
            <button type="button" onClick={() => setAccountType('company')}
              className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 ${accountType === 'company' ? 'border-black bg-gray-50' : 'border-gray-200'}`}>
              <Building2 className="w-6 h-6" />
              <div className="text-left">
                <div className="font-semibold">Firma / Živnostník</div>
                <div className="text-sm text-gray-500">Pre firemné účely</div>
              </div>
            </button>
          </div>
        )}

        {/* Step 2: Personal/Company Info */}
        {step === 2 && (
          <div className="space-y-4">
            {accountType === 'individual' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meno *</label>
                  <input 
                    type="text" 
                    placeholder="Zadajte meno" 
                    value={formData.firstName} 
                    onChange={e => updateForm('firstName', e.target.value)}
                    onBlur={() => handleBlur('firstName')}
                    className={inputClass('firstName')} 
                  />
                  {errors.firstName && touched.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priezvisko *</label>
                  <input 
                    type="text" 
                    placeholder="Zadajte priezvisko" 
                    value={formData.lastName} 
                    onChange={e => updateForm('lastName', e.target.value)}
                    onBlur={() => handleBlur('lastName')}
                    className={inputClass('lastName')} 
                  />
                  {errors.lastName && touched.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Názov firmy *</label>
                  <input 
                    type="text" 
                    placeholder="Zadajte názov firmy" 
                    value={formData.companyName} 
                    onChange={e => updateForm('companyName', e.target.value)}
                    onBlur={() => handleBlur('companyName')}
                    className={inputClass('companyName')} 
                  />
                  {errors.companyName && touched.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IČO *</label>
                  <input 
                    type="text" 
                    placeholder="Napr. 12345678" 
                    value={formData.ico} 
                    onChange={e => updateForm('ico', e.target.value)}
                    onBlur={() => handleBlur('ico')}
                    className={inputClass('ico')} 
                  />
                  {errors.ico && touched.ico && <p className="text-red-500 text-sm mt-1">{errors.ico}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">DIČ *</label>
                  <input 
                    type="text" 
                    placeholder="Napr. 2012345678" 
                    value={formData.dic} 
                    onChange={e => updateForm('dic', e.target.value)}
                    onBlur={() => handleBlur('dic')}
                    className={inputClass('dic')} 
                  />
                  {errors.dic && touched.dic && <p className="text-red-500 text-sm mt-1">{errors.dic}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IČ DPH (ak ste platcom)</label>
                  <input 
                    type="text" 
                    placeholder="Napr. SK2012345678" 
                    value={formData.icDph} 
                    onChange={e => updateForm('icDph', e.target.value)}
                    className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl focus:border-black focus:outline-none" 
                  />
                </div>
              </>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ulica a číslo domu *</label>
              <input 
                type="text" 
                placeholder="Napr. Hlavná 123" 
                value={formData.street} 
                onChange={e => updateForm('street', e.target.value)}
                onBlur={() => handleBlur('street')}
                className={inputClass('street')} 
              />
              {errors.street && touched.street && <p className="text-red-500 text-sm mt-1">{errors.street}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mesto *</label>
                <input 
                  type="text" 
                  placeholder="Napr. Bratislava" 
                  value={formData.city} 
                  onChange={e => updateForm('city', e.target.value)}
                  onBlur={() => handleBlur('city')}
                  className={inputClass('city')} 
                />
                {errors.city && touched.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PSČ *</label>
                <input 
                  type="text" 
                  placeholder="Napr. 831 01" 
                  value={formData.postalCode} 
                  onChange={e => updateForm('postalCode', e.target.value)}
                  onBlur={() => handleBlur('postalCode')}
                  className={inputClass('postalCode')} 
                />
                {errors.postalCode && touched.postalCode && <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Phone */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-2">Telefón použijete na prihlásenie</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefónne číslo *</label>
              <div className="flex gap-2">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className="flex items-center gap-2 px-3 py-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
                  >
                    <span className="text-xl">{selectedCountry.flag}</span>
                    <span className="text-sm font-medium">{selectedCountry.dial}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                  {showCountryDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 min-w-[200px]">
                      {COUNTRIES.map(country => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => {
                            setSelectedCountry(country)
                            setShowCountryDropdown(false)
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl"
                        >
                          <span className="text-xl">{country.flag}</span>
                          <span className="font-medium">{country.name}</span>
                          <span className="text-gray-500 ml-auto">{country.dial}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <input 
                  type="tel" 
                  placeholder="909 123 456" 
                  value={formData.phone} 
                  onChange={e => updateForm('phone', e.target.value.replace(/\D/g, ''))}
                  onBlur={() => handleBlur('phone')}
                  className={`flex-1 ${inputClass('phone')}`}
                />
              </div>
              {errors.phone && touched.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>
          </div>
        )}

        {/* Step 4: SMS Verification */}
        {step === 4 && (
          <form onSubmit={verifySmsOtp} className="space-y-4">
            <h2 className="font-bold text-lg">Overenie telefónu</h2>
            <p className="text-sm text-gray-500 mb-4">
              {isDevMode ? (
                <span className="text-orange-600">Test mód - zadajte kód 000000</span>
              ) : (
                <>SMS kód sme poslali na <span className="font-medium text-black">{maskPhone(getFullPhone())}</span></>
              )}
            </p>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="000000" 
                value={smsCode} 
                onChange={e => setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 6))} 
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-center text-2xl tracking-widest focus:border-black focus:outline-none" 
                maxLength={6} 
                autoFocus 
              />
            </div>
            <button type="submit" disabled={isSubmitting || smsCode.length !== 6} className="w-full py-4 bg-black text-white rounded-xl font-semibold disabled:opacity-50">
              {isSubmitting ? 'Overujem...' : 'Overiť SMS'}
            </button>
            {!isDevMode && (
              <button type="button" onClick={() => sendSmsOtp(true)} disabled={resendTimer > 0 || isSubmitting}
                className="w-full py-3 text-gray-600 flex items-center justify-center gap-2 disabled:opacity-50">
                <RefreshCw className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
                {resendTimer > 0 ? `Znova odoslať (${resendTimer}s)` : 'Odoslať SMS znova'}
              </button>
            )}
          </form>
        )}

        {/* Step 5: Set PIN */}
        {step === 5 && (
          <form onSubmit={completeRegistration} className="space-y-4">
            <h2 className="font-bold text-lg">Nastavte si PIN</h2>
            <p className="text-sm text-gray-500 mb-4">4-miestny PIN pre rýchle prihlásenie</p>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="password" 
                inputMode="numeric"
                placeholder="PIN" 
                value={pin} 
                onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} 
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-center text-2xl tracking-widest focus:border-black focus:outline-none" 
                maxLength={4} 
                autoFocus 
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="password"
                inputMode="numeric" 
                placeholder="Potvrďte PIN" 
                value={pinConfirm} 
                onChange={e => setPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 4))} 
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-center text-2xl tracking-widest focus:border-black focus:outline-none" 
                maxLength={4} 
              />
            </div>
            <button type="submit" disabled={isSubmitting || pin.length !== 4 || pinConfirm.length !== 4} className="w-full py-4 bg-black text-white rounded-xl font-semibold disabled:opacity-50">
              {isSubmitting ? 'Registrujem...' : 'Dokončiť registráciu'}
            </button>
          </form>
        )}

        {/* Navigation buttons for steps 1-3 */}
        {step === 1 && (
          <div className="mt-4">
            <Turnstile onVerify={setTurnstileToken} />
          </div>
        )}
        {step <= 3 && (
          <div className="flex gap-3 mt-6">
            {step > 1 && <button type="button" onClick={() => setStep(step - 1)} className="flex-1 py-4 border-2 border-gray-200 rounded-xl font-semibold">Späť</button>}
            {step < 3 ? (
              <button type="button" onClick={nextStep} className="flex-1 py-4 bg-black text-white rounded-xl font-semibold">Ďalej</button>
            ) : (
              <button type="button" onClick={() => sendSmsOtp()} disabled={isSubmitting || !formData.phone} className="flex-1 py-4 bg-black text-white rounded-xl font-semibold disabled:opacity-50">
                {isSubmitting ? 'Posielam...' : 'Overiť telefón'}
              </button>
            )}
          </div>
        )}

        <p className="text-center text-gray-500 text-sm mt-6">
          Už máte účet? <Link href="/prihlasenie" className="text-black underline">Prihlásiť sa</Link>
        </p>
      </div>
    </div>
  )
}
