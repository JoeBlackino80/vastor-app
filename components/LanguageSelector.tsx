'use client'
import { useState } from 'react'
import { Globe, ChevronDown } from 'lucide-react'
import { Language } from '@/lib/translations'

const languages: { code: Language; name: string; flag: string }[] = [
  { code: 'sk', name: 'Slovenčina', flag: '🇸🇰' },
  { code: 'cz', name: 'Čeština', flag: '🇨🇿' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
]

interface Props {
  currentLang: Language
  onChange: (lang: Language) => void
}

export default function LanguageSelector({ currentLang, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const current = languages.find(l => l.code === currentLang) || languages[0]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <span className="text-lg">{current.flag}</span>
        <span className="text-sm font-medium dark:text-white hidden sm:inline">{current.code.toUpperCase()}</span>
        <ChevronDown className="w-4 h-4 dark:text-white" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => { onChange(lang.code); setIsOpen(false) }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  currentLang === lang.code ? 'bg-gray-50 dark:bg-gray-700' : ''
                }`}
              >
                <span className="text-xl">{lang.flag}</span>
                <span className="text-sm font-medium dark:text-white">{lang.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
