import Link from 'next/link'
import { Package, Truck, Clock, Shield, ArrowRight, Phone, Mail } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">VASTOR</Link>
          <div className="flex items-center gap-4">
            <Link href="/moje-objednavky" className="text-gray-600 hover:text-black">Moje objednávky</Link>
            <Link href="/kuryr" className="text-gray-600 hover:text-black">Pre kuriérov</Link>
            <Link href="/objednavka" className="px-4 py-2 bg-black text-white rounded-full text-sm font-medium">
              Objednať
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-6xl font-bold mb-6">Doručíme čokoľvek.<br/>Kdekoľvek.</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Rýchle a spoľahlivé kuriérske služby pre vašu firmu aj domácnosť.
          </p>
          <Link href="/objednavka" className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white rounded-full text-lg font-medium hover:bg-gray-800 transition-colors">
            Vytvoriť objednávku <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Prečo VASTOR?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <Clock className="w-10 h-10 mb-4" />
              <h3 className="text-xl font-bold mb-2">Rýchle doručenie</h3>
              <p className="text-gray-600">Express doručenie do 2 hodín alebo štandardné do konca dňa.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <Shield className="w-10 h-10 mb-4" />
              <h3 className="text-xl font-bold mb-2">Bezpečné</h3>
              <p className="text-gray-600">Všetky zásielky sú poistené a sledované v reálnom čase.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <Truck className="w-10 h-10 mb-4" />
              <h3 className="text-xl font-bold mb-2">Profesionálni kuriéri</h3>
              <p className="text-gray-600">Overení a vyškolení kuriéri s vysokým hodnotením.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Staň sa kuriérom</h2>
          <p className="text-gray-600 mb-8">Zarábaj flexibilne, pracuj kedy chceš. Pridaj sa k tímu VASTOR.</p>
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
