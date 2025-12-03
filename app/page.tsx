'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Package, Clock, MapPin, Shield, ArrowRight, Phone, Mail, User } from 'lucide-react'

export default function Home() {
  const [customer, setCustomer] = useState<any>(null)

  useEffect(() => {
    const saved = localStorage.getItem('customer')
    if (saved) setCustomer(JSON.parse(saved))
  }, [])

  const displayName = customer?.account_type === 'company' ? customer?.company_name : customer?.first_name

  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">VASTOR</Link>
          <div className="flex items-center gap-4">
            {customer ? (
              <>
                <Link href="/moj-ucet" className="flex items-center gap-2 text-gray-700 hover:text-black">
                  <User className="w-5 h-5" />
                  <span className="hidden sm:inline">{displayName}</span>
                </Link>
                <Link href="/objednavka" className="px-6 py-2 bg-black text-white rounded-full text-sm font-medium">
                  Objednať
                </Link>
              </>
            ) : (
              <>
                <Link href="/prihlasenie" className="text-gray-700 hover:text-black">Prihlásiť</Link>
                <Link href="/registracia" className="px-6 py-2 bg-black text-white rounded-full text-sm font-medium">
                  Registrácia
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">Doručíme čokoľvek, kamkoľvek</h1>
          <p className="text-xl text-gray-600 mb-8">Rýchle a spoľahlivé kuriérske služby pre váš biznis aj súkromné potreby.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/objednavka" className="px-8 py-4 bg-black text-white rounded-full text-lg font-medium flex items-center justify-center gap-2">
              Objednať kuriéra <ArrowRight className="w-5 h-5" />
            </Link>
            {!customer && (
              <Link href="/registracia" className="px-8 py-4 border-2 border-black rounded-full text-lg font-medium">
                Registrovať sa
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Prečo VASTOR?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <Clock className="w-12 h-12 mb-4" />
              <h3 className="text-xl font-bold mb-2">Rýchle doručenie</h3>
              <p className="text-gray-600">Doručenie do 60 minút v rámci mesta.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <MapPin className="w-12 h-12 mb-4" />
              <h3 className="text-xl font-bold mb-2">Live tracking</h3>
              <p className="text-gray-600">Sledujte kuriéra v reálnom čase.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <Shield className="w-12 h-12 mb-4" />
              <h3 className="text-xl font-bold mb-2">Poistenie zásielky</h3>
              <p className="text-gray-600">Každá zásielka je automaticky poistená.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Staň sa kuriérom</h2>
          <p className="text-gray-600 mb-8">Zarábaj flexibilne, pracuj kedy chceš.</p>
          <Link href="/kuryr/registracia" className="inline-flex items-center gap-2 px-8 py-4 border-2 border-black rounded-full text-lg font-medium hover:bg-black hover:text-white transition-colors">
            Registrovať sa ako kuriér <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <footer className="bg-black text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">VASTOR</h3>
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
            © 2024 VASTOR. Všetky práva vyhradené.
          </div>
        </div>
      </footer>
    </div>
  )
}
