'use client'
import { useState, useEffect } from 'react'
import { translations, Language } from './translations'

export function useTranslation() {
  const [lang, setLang] = useState<Language>('sk')

  useEffect(() => {
    const saved = localStorage.getItem('language') as Language
    if (saved && translations[saved]) {
      setLang(saved)
    }
  }, [])

  const t = translations[lang]

  const changeLanguage = (newLang: Language) => {
    setLang(newLang)
    localStorage.setItem('language', newLang)
  }

  return { t, lang, changeLanguage }
}
