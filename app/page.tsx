'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import LocationMap from '@/components/LocationMap'
import { Package, Clock, MapPin, Shield, ArrowRight, Phone, Mail, User, FileText, ShoppingCart, Zap, ChevronRight } from 'lucide-react'
import { useTranslation } from '@/lib/useTranslation'
import ThemeToggle from '@/components/ThemeToggle'
import LanguageSelector from '@/components/LanguageSelector'

export default function Home() {
  const { t, lang, changeLanguage } = useTranslation()
  const [customer, setCustomer] = useState<any>(null)

  useEffect(() => {
    const saved = localStorage.getItem('customer')
    if (saved) setCustomer(JSON.parse(saved))
  }, [])

  const displayName = customer?.account_type === 'company' ? customer?.company_name : customer?.first_name

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-50 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="voru" className="h-[80px] w-auto" />
            <span className="text-xl font-bold dark:text-white">voru</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#sluzby" className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">{t.nav.services}</a>
            <a href="#cenik" className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">{t.nav.pricing}</a>
            <Link href="/kuryr" className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">{t.nav.forCouriers}</Link>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector currentLang={lang} onChange={changeLanguage} />
            <ThemeToggle />
            {customer ? (
              <>
                <Link href="/moj-ucet" className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white">
                  <User className="w-5 h-5" />
                  <span className="hidden sm:inline">{displayName}</span>
                </Link>
                <Link href="/objednavka" className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                  {t.nav.orderCourier}
                </Link>
              </>
            ) : (
              <>
                <Link href="/prihlasenie" className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hidden sm:block">{t.nav.login}</Link>
                <Link href="/registracia" className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                  {t.nav.register}
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight dark:text-white">
              {t.hero.title}<br/>
              <span className="text-gray-600 dark:text-gray-400">{t.hero.subtitle}</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              {t.hero.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/objednavka" className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-full text-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                {t.hero.cta} <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="#cenik" className="px-8 py-4 text-gray-700 dark:text-gray-300 text-lg font-medium flex items-center justify-center gap-2 hover:text-black dark:hover:text-white transition-colors">
                {t.hero.viewPricing}
              </a>
            </div>
            <div className="flex gap-12 mt-12 pt-8 border-t border-gray-100 dark:border-gray-800">
              <div>
                <p className="text-4xl font-bold dark:text-white">60<span className="text-2xl">min</span></p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{t.hero.avgDelivery}</p>
              </div>
              <div>
                <p className="text-4xl font-bold dark:text-white">15K+</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{t.hero.deliveredPackages}</p>
              </div>
              <div>
                <p className="text-4xl font-bold dark:text-white">99.2%</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{t.hero.successRate}</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-3xl p-8 relative">
              <div className="absolute top-4 right-4 bg-white dark:bg-gray-700 rounded-xl p-4 shadow-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Express doručenie</p>
                <p className="text-2xl font-bold dark:text-white">do 60 min</p>
              </div>
              <div className="mx-auto mt-8 mb-8 rounded-xl overflow-hidden"><LocationMap /></div>
              <h3 className="text-xl font-bold text-center mb-2 dark:text-white">Sledovanie v reálnom čase</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center">Viete presne, kde je váš kuriér</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="sluzby" className="py-20 px-6 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{t.nav.services.toUpperCase()}</p>
            <h2 className="text-4xl font-bold mb-4 dark:text-white">{t.services.title}</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{t.services.subtitle}</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-700 p-6 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-600 rounded-xl flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 dark:text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 dark:text-white">{t.services.documents}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{t.services.documentsDesc}</p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-6 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-600 rounded-xl flex items-center justify-center mb-4">
                <Package className="w-6 h-6 dark:text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 dark:text-white">{t.services.packages}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{t.services.packagesDesc}</p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-6 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-600 rounded-xl flex items-center justify-center mb-4">
                <ShoppingCart className="w-6 h-6 dark:text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 dark:text-white">{t.services.shopping}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{t.services.shoppingDesc}</p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-6 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-600 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 dark:text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 dark:text-white">{t.services.express}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{t.services.expressDesc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">PROCES</p>
            <h2 className="text-4xl font-bold mb-4 dark:text-white">{t.howItWorks.title}</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{t.howItWorks.subtitle}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <p className="text-8xl font-bold text-gray-100 dark:text-gray-800 mb-4">01</p>
              <h3 className="text-xl font-bold mb-2 dark:text-white">{t.howItWorks.step1}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t.howItWorks.step1Desc}</p>
            </div>
            <div>
              <p className="text-8xl font-bold text-gray-100 dark:text-gray-800 mb-4">02</p>
              <h3 className="text-xl font-bold mb-2 dark:text-white">{t.howItWorks.step2}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t.howItWorks.step2Desc}</p>
            </div>
            <div>
              <p className="text-8xl font-bold text-gray-100 dark:text-gray-800 mb-4">03</p>
              <h3 className="text-xl font-bold mb-2 dark:text-white">{t.howItWorks.step3}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t.howItWorks.step3Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="cenik" className="py-20 px-6 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{t.nav.pricing.toUpperCase()}</p>
            <h2 className="text-4xl font-bold mb-4 dark:text-white">{t.pricing.title}</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{t.pricing.subtitle}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-700 p-8 rounded-2xl">
              <h3 className="text-xl font-bold mb-2 dark:text-white">{t.pricing.standard}</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">{t.pricing.standardTime}</p>
              <p className="text-4xl font-bold mb-6 dark:text-white">{t.pricing.from} 4,90€</p>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4" /> Do 5 km</li>
                <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4" /> Live tracking</li>
                <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4" /> SMS notifikácie</li>
              </ul>
            </div>
            <div className="bg-black dark:bg-white text-white dark:text-black p-8 rounded-2xl relative">
              <div className="absolute top-4 right-4 bg-white dark:bg-black text-black dark:text-white px-3 py-1 rounded-full text-xs font-medium">
                {t.pricing.mostPopular}
              </div>
              <h3 className="text-xl font-bold mb-2">{t.pricing.express}</h3>
              <p className="text-gray-400 dark:text-gray-600 mb-4">{t.pricing.expressTime}</p>
              <p className="text-4xl font-bold mb-6">{t.pricing.from} 7,90€</p>
              <ul className="space-y-3 text-gray-300 dark:text-gray-600">
                <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4" /> Do 10 km</li>
                <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4" /> Prioritné spracovanie</li>
                <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4" /> Poistenie do 500€</li>
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-700 p-8 rounded-2xl">
              <h3 className="text-xl font-bold mb-2 dark:text-white">{t.pricing.premium}</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">{t.pricing.premiumTime}</p>
              <p className="text-4xl font-bold mb-6 dark:text-white">{t.pricing.from} 12,90€</p>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4" /> Bez limitu</li>
                <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4" /> Dedikovaný kuriér</li>
                <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4" /> Poistenie do 2000€</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 dark:text-white">Staň sa kuriérom</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Zarábaj flexibilne, pracuj kedy chceš. Pridaj sa k tímu voru.
          </p>
          <Link href="/kuryr/registracia" className="inline-flex items-center gap-2 px-8 py-4 border-2 border-black dark:border-white dark:text-white rounded-full text-lg font-medium hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
            {t.nav.forCouriers} <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black dark:bg-gray-950 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">voru</h3>
              <p className="text-gray-400">Kuriérske služby novej generácie</p>
            </div>
            <div className="flex items-center gap-6">
              <a href="tel:+421900000000" className="flex items-center gap-2 text-gray-400 hover:text-white">
                <Phone className="w-5 h-5" /> +421 900 000 000
              </a>
              <a href="mailto:info@vastor.sk" className="flex items-center gap-2 text-gray-400 hover:text-white">
                <Mail className="w-5 h-5" /> info@vastor.sk
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
            © 2024 voru. Všetky práva vyhradené.
          </div>
        </div>
      </footer>
    </div>
  )
}
