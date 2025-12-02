import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { FileText, Package, ShoppingCart, Zap, MapPin, Clock, Check } from 'lucide-react'

export default function Home() {
  return (
    <>
      <Navigation />
      
      {/* Hero */}
      <section className="min-h-screen flex items-center pt-40 pb-24">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-sm text-gray-600 font-medium mb-8">
                <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
                Aktivní po celé Praze
              </div>
              
              <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight mb-7">
                Doručíme cokoliv. Kamkoliv. Rychle.
              </h1>
              
              <p className="text-xl text-gray-600 mb-12 leading-relaxed">
                Profesionální kurýrní služba pro Prahu. Dokumenty, balíky, nákupy, vzorky. Od odeslání po doručení do 60 minut.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-16">
                <Link href="/objednavka" className="btn btn-primary">
                  Objednat kurýra
                </Link>
                <Link href="#cenik" className="btn btn-secondary">
                  Zobrazit ceník
                </Link>
              </div>
              
              <div className="flex flex-wrap gap-12 pt-12 border-t border-gray-200">
                <div>
                  <div className="text-4xl font-extrabold tracking-tight">60min</div>
                  <div className="text-sm text-gray-500 mt-1">Průměrný čas doručení</div>
                </div>
                <div>
                  <div className="text-4xl font-extrabold tracking-tight">15K+</div>
                  <div className="text-sm text-gray-500 mt-1">Doručených zásilek</div>
                </div>
                <div>
                  <div className="text-4xl font-extrabold tracking-tight">99.2%</div>
                  <div className="text-sm text-gray-500 mt-1">Úspěšnost doručení</div>
                </div>
              </div>
            </div>
            
            <div className="relative h-[500px] bg-gray-100 flex items-center justify-center">
              <div className="text-center p-12">
                <div className="w-20 h-20 bg-black mx-auto mb-8 flex items-center justify-center">
                  <MapPin className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 tracking-tight">Sledování v reálném čase</h3>
                <p className="text-gray-600">Víte přesně, kde je váš kurýr</p>
              </div>
              
              <div className="absolute top-16 -right-8 bg-white p-5 shadow-xl border border-gray-200">
                <div className="text-sm font-bold mb-1">Čas doručení</div>
                <div className="text-2xl font-extrabold">47 min</div>
              </div>
              
              <div className="absolute bottom-20 -left-8 bg-white p-5 shadow-xl border border-gray-200">
                <div className="text-sm font-bold mb-1">Status</div>
                <div className="text-sm text-gray-600">Kurýr vyzvedl zásilku</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="sluzby" className="py-32 bg-gray-100">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-white text-xs text-gray-600 font-semibold uppercase tracking-widest mb-5">
              Služby
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-5">Co pro vás doručíme</h2>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">
              Specializujeme se na rychlé a spolehlivé doručení různých typů zásilek po celé Praze.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card hover:border-black transition-colors">
              <div className="w-14 h-14 bg-black flex items-center justify-center mb-7">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 tracking-tight">Dokumenty</h3>
              <p className="text-gray-600">Smlouvy, faktury, právní dokumenty. Bezpečné a rychlé doručení s potvrzením převzetí.</p>
            </div>
            
            <div className="card hover:border-black transition-colors">
              <div className="w-14 h-14 bg-black flex items-center justify-center mb-7">
                <Package className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 tracking-tight">Balíky</h3>
              <p className="text-gray-600">Malé i větší balíky do 20 kg. E-commerce, B2B zásilky, osobní balíky.</p>
            </div>
            
            <div className="card hover:border-black transition-colors">
              <div className="w-14 h-14 bg-black flex items-center justify-center mb-7">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 tracking-tight">Nákupy</h3>
              <p className="text-gray-600">Vyzvedneme a doručíme vaše nákupy z obchodů, lékáren nebo e-shopů.</p>
            </div>
            
            <div className="card hover:border-black transition-colors">
              <div className="w-14 h-14 bg-black flex items-center justify-center mb-7">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 tracking-tight">Express</h3>
              <p className="text-gray-600">Laboratorní vzorky, urgentní dokumenty. Garantovaný čas doručení.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-32">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-gray-100 text-xs text-gray-600 font-semibold uppercase tracking-widest mb-5">
              Proces
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-5">Jak to funguje</h2>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">
              Objednání kurýra je jednoduché. Tři kroky a vaše zásilka je na cestě.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <div className="text-8xl font-black text-gray-200 leading-none mb-6">01</div>
              <h3 className="text-xl font-bold mb-3 tracking-tight">Zadejte objednávku</h3>
              <p className="text-gray-600 leading-relaxed">Vyplňte adresu vyzvednutí a doručení. Zvolte typ zásilky a preferovaný čas.</p>
            </div>
            
            <div>
              <div className="text-8xl font-black text-gray-200 leading-none mb-6">02</div>
              <h3 className="text-xl font-bold mb-3 tracking-tight">Kurýr vyzvedne zásilku</h3>
              <p className="text-gray-600 leading-relaxed">Nejbližší dostupný kurýr přijede na místo vyzvednutí. Sledujte jeho polohu v reálném čase.</p>
            </div>
            
            <div>
              <div className="text-8xl font-black text-gray-200 leading-none mb-6">03</div>
              <h3 className="text-xl font-bold mb-3 tracking-tight">Doručení příjemci</h3>
              <p className="text-gray-600 leading-relaxed">Zásilka je doručena na cílovou adresu. Obdržíte potvrzení o převzetí.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="cenik" className="py-32 bg-black text-white">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-gray-800 text-xs text-gray-400 font-semibold uppercase tracking-widest mb-5">
              Ceník
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-5">Transparentní ceny</h2>
            <p className="text-lg text-gray-400 max-w-xl mx-auto">
              Žádné skryté poplatky. Platíte pouze za vzdálenost a typ služby.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-gray-900 border border-gray-800 p-10 hover:border-gray-600 transition-colors">
              <div className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">Standard</div>
              <div className="text-5xl font-extrabold tracking-tight mb-2">89 Kč</div>
              <p className="text-gray-500 mb-8 pb-8 border-b border-gray-800">Doručení do 90 minut</p>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-3 text-gray-400">
                  <Check className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  Dokumenty a malé balíky
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <Check className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  Sledování v reálném čase
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <Check className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  Do 5 km v ceně
                </li>
              </ul>
              <Link href="/objednavka?service=standard" className="btn bg-white text-black hover:bg-gray-200 w-full justify-center">
                Vybrat
              </Link>
            </div>
            
            <div className="bg-white text-black p-10">
              <div className="text-sm font-semibold uppercase tracking-widest text-gray-600 mb-4">Express</div>
              <div className="text-5xl font-extrabold tracking-tight mb-2">149 Kč</div>
              <p className="text-gray-600 mb-8 pb-8 border-b border-gray-200">Doručení do 60 minut</p>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-3 text-gray-600">
                  <Check className="w-5 h-5 text-black flex-shrink-0" />
                  Prioritní přiřazení kurýra
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <Check className="w-5 h-5 text-black flex-shrink-0" />
                  Balíky do 10 kg
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <Check className="w-5 h-5 text-black flex-shrink-0" />
                  Do 10 km v ceně
                </li>
              </ul>
              <Link href="/objednavka?service=express" className="btn btn-primary w-full justify-center">
                Vybrat
              </Link>
            </div>
            
            <div className="bg-gray-900 border border-gray-800 p-10 hover:border-gray-600 transition-colors">
              <div className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">Premium</div>
              <div className="text-5xl font-extrabold tracking-tight mb-2">249 Kč</div>
              <p className="text-gray-500 mb-8 pb-8 border-b border-gray-800">Doručení do 45 minut</p>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-3 text-gray-400">
                  <Check className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  Garantovaný čas
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <Check className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  Balíky do 20 kg
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <Check className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  Celá Praha v ceně
                </li>
              </ul>
              <Link href="/objednavka?service=premium" className="btn bg-white text-black hover:bg-gray-200 w-full justify-center">
                Vybrat
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 bg-gray-100">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-5">Potřebujete něco doručit?</h2>
          <p className="text-lg text-gray-600 mb-12 max-w-lg mx-auto">
            Objednejte kurýra online nebo nám zavolejte. Jsme tu pro vás každý den.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/objednavka" className="btn btn-primary">
              Objednat kurýra
            </Link>
            <Link href="/kuryr" className="btn btn-secondary">
              Chci být kurýr
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
