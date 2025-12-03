'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Package, Clock, MapPin, Shield, ArrowRight, Phone, Mail, User, FileText, ShoppingCart, Zap, ChevronRight } from 'lucide-react'

export default function Home() {
  const [customer, setCustomer] = useState<any>(null)

  useEffect(() => {
    const saved = localStorage.getItem('customer')
    if (saved) setCustomer(JSON.parse(saved))
  }, [])

  const displayName = customer?.account_type === 'company' ? customer?.company_name : customer?.first_name

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <span className="text-xl font-bold">VASTOR</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#sluzby" className="text-gray-600 hover:text-black">Služby</a>
            <a href="#cenik" className="text-gray-600 hover:text-black">Ceník</a>
            <Link href="/kuryr" className="text-gray-600 hover:text-black">Pro kurýry</Link>
            <Link href="/mal/admin" className="text-gray-600 hover:text-black">Admin</Link>
          </div>
          <div className="flex items-center gap-4">
            {customer ? (
              <>
                <Link href="/moj-ucet" className="flex items-center gap-2 text-gray-700 hover:text-black">
                  <User className="w-5 h-5" />
                  <span className="hidden sm:inline">{displayName}</span>
                </Link>
                <Link href="/objednavka" className="px-6 py-2.5 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
                  Objednať kurýra
                </Link>
              </>
            ) : (
              <>
                <Link href="/prihlasenie" className="text-gray-700 hover:text-black">Prihlásiť</Link>
                <Link href="/registracia" className="px-6 py-2.5 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
                  Registrácia
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
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm mb-6">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Aktívni po celom Slovensku
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Doručíme čokoľvek.<br/>
              <span className="text-gray-600">Kamkoľvek. Rýchle.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Profesionálna kuriérska služba pre Slovensko. Dokumenty, balíky, nákupy, vzorky. Od odoslania po doručenie do 60 minút.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/objednavka" className="px-8 py-4 bg-black text-white rounded-full text-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors">
                Objednať kurýra
              </Link>
              <a href="#cenik" className="px-8 py-4 text-gray-700 text-lg font-medium flex items-center justify-center gap-2 hover:text-black transition-colors">
                Zobraziť cenník
              </a>
            </div>
            <div className="flex gap-12 mt-12 pt-8 border-t border-gray-100">
              <div>
                <p className="text-4xl font-bold">60<span className="text-2xl">min</span></p>
                <p className="text-gray-500 text-sm">Priemerný čas doručenia</p>
              </div>
              <div>
                <p className="text-4xl font-bold">15K+</p>
                <p className="text-gray-500 text-sm">Doručených zásielok</p>
              </div>
              <div>
                <p className="text-4xl font-bold">99.2%</p>
                <p className="text-gray-500 text-sm">Úspešnosť doručenia</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="bg-gray-100 rounded-3xl p-8 relative">
              <div className="absolute top-4 right-4 bg-white rounded-xl p-4 shadow-lg">
                <p className="text-sm text-gray-500">Čas doručenia</p>
                <p className="text-2xl font-bold">47 min</p>
              </div>
              <div className="w-24 h-24 bg-black rounded-2xl flex items-center justify-center mx-auto mt-16 mb-8">
                <MapPin className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-xl font-bold text-center mb-2">Sledovanie v reálnom čase</h3>
              <p className="text-gray-500 text-center">Viete presne, kde je váš kuriér</p>
              <div className="absolute bottom-4 left-4 bg-white rounded-xl p-4 shadow-lg">
                <p className="text-xs text-gray-500">Status</p>
                <p className="font-medium">Kuriér vyzdvihol zásielku</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="sluzby" className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-gray-500 mb-2">SLUŽBY</p>
            <h2 className="text-4xl font-bold mb-4">Čo pre vás doručíme</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Špecializujeme sa na rýchle a spoľahlivé doručenie rôznych typov zásielok po celom Slovensku.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Dokumenty</h3>
              <p className="text-gray-600 text-sm">Zmluvy, faktúry, právne dokumenty. Bezpečné a rýchle doručenie s potvrdením prevzatia.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Balíky</h3>
              <p className="text-gray-600 text-sm">Malé i väčšie balíky do 20 kg. E-commerce, B2B zásielky, osobné balíky.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Nákupy</h3>
              <p className="text-gray-600 text-sm">Vyzdvihneme a doručíme vaše nákupy z obchodov, lekární alebo e-shopov.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Express</h3>
              <p className="text-gray-600 text-sm">Laboratórne vzorky, urgentné dokumenty. Garantovaný čas doručenia.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-gray-500 mb-2">PROCES</p>
            <h2 className="text-4xl font-bold mb-4">Ako to funguje</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Objednanie kurýra je jednoduché. Tri kroky a vaša zásielka je na ceste.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <p className="text-8xl font-bold text-gray-100 mb-4">01</p>
              <h3 className="text-xl font-bold mb-2">Zadajte objednávku</h3>
              <p className="text-gray-600">Vyplňte adresu vyzdvihnutia a doručenia. Zvoľte typ zásielky a preferovaný čas.</p>
            </div>
            <div>
              <p className="text-8xl font-bold text-gray-100 mb-4">02</p>
              <h3 className="text-xl font-bold mb-2">Kuriér vyzdvihne zásielku</h3>
              <p className="text-gray-600">Najbližší dostupný kuriér príde na miesto vyzdvihnutia. Sledujte jeho polohu v reálnom čase.</p>
            </div>
            <div>
              <p className="text-8xl font-bold text-gray-100 mb-4">03</p>
              <h3 className="text-xl font-bold mb-2">Doručenie príjemcovi</h3>
              <p className="text-gray-600">Zásielka je doručená na cieľovú adresu. Obdržíte potvrdenie o prevzatí.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="cenik" className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-gray-500 mb-2">CENNÍK</p>
            <h2 className="text-4xl font-bold mb-4">Transparentné ceny</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Žiadne skryté poplatky. Cena závisí od vzdialenosti a typu služby.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl">
              <h3 className="text-xl font-bold mb-2">Štandard</h3>
              <p className="text-gray-500 mb-4">Doručenie do 120 minút</p>
              <p className="text-4xl font-bold mb-6">od 4,90€</p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4" /> Do 5 km</li>
                <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4" /> Sledovanie v reálnom čase</li>
                <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4" /> SMS notifikácie</li>
              </ul>
            </div>
            <div className="bg-black text-white p-8 rounded-2xl relative">
              <div className="absolute top-4 right-4 bg-white text-black px-3 py-1 rounded-full text-xs font-medium">
                Najobľúbenejšie
              </div>
              <h3 className="text-xl font-bold mb-2">Express</h3>
              <p className="text-gray-400 mb-4">Doručenie do 60 minút</p>
              <p className="text-4xl font-bold mb-6">od 7,90€</p>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4" /> Do 10 km</li>
                <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4" /> Prioritné spracovanie</li>
                <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4" /> Poistenie do 500€</li>
              </ul>
            </div>
            <div className="bg-white p-8 rounded-2xl">
              <h3 className="text-xl font-bold mb-2">Premium</h3>
              <p className="text-gray-500 mb-4">Doručenie do 45 minút</p>
              <p className="text-4xl font-bold mb-6">od 12,90€</p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4" /> Bez limitu vzdialenosti</li>
                <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4" /> Dedikovaný kuriér</li>
                <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4" /> Poistenie do 2000€</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Staň sa kuriérom</h2>
          <p className="text-xl text-gray-600 mb-8">
            Zarábaj flexibilne, pracuj kedy chceš. Pridaj sa k tímu VASTOR.
          </p>
          <Link href="/kuryr/registracia" className="inline-flex items-center gap-2 px-8 py-4 border-2 border-black rounded-full text-lg font-medium hover:bg-black hover:text-white transition-colors">
            Registrovať sa ako kuriér <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
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
