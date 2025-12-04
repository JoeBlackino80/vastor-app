'use client'
import { useState, useEffect } from 'react'
import { translations, Language } from './translations'

// Mapovanie browser jazykov na naše jazyky
function detectLanguage(): Language {
  if (typeof navigator === 'undefined') return 'sk'
  
  const browserLang = navigator.language.toLowerCase()
  
  // sk, sk-sk → slovenčina
  if (browserLang.startsWith('sk')) return 'sk'
  // cs, cs-cz → čeština (browser používa "cs" nie "cz")
  if (browserLang.startsWith('cs')) return 'cz'
  // de, de-de, de-at → nemčina
  if (browserLang.startsWith('de')) return 'de'
  // en, en-us, en-gb → angličtina
  if (browserLang.startsWith('en')) return 'en'
  
  // Default slovenčina
  return 'sk'
}

export function useTranslation() {
  const [lang, setLang] = useState<Language>('sk')

  useEffect(() => {
    // Najprv skontroluj uložený jazyk
    const saved = localStorage.getItem('language') as Language
    if (saved && translations[saved]) {
      setLang(saved)
    } else {
      // Ak nie je uložený, detekuj z prehliadača
      const detected = detectLanguage()
      setLang(detected)
      localStorage.setItem('language', detected)
    }
  }, [])

  const t = translations[lang]

  const changeLanguage = (newLang: Language) => {
    setLang(newLang)
    localStorage.setItem('language', newLang)
  }

  return { t, lang, changeLanguage }
}
