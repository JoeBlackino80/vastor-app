import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="py-20 border-t border-gray-200">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-3 font-extrabold text-xl tracking-tight mb-5">
              <div className="w-10 h-10 bg-black flex items-center justify-center text-white font-black">
                V
              </div>
              voru
            </Link>
            <p className="text-gray-600 text-sm leading-relaxed">
              Profesionální kurýrní služba pro Prahu. Rychle, spolehlivě, transparentně.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-6">Služby</h4>
            <ul className="list-none space-y-3">
              <li><Link href="#" className="text-gray-600 text-sm hover:text-black transition-colors">Dokumenty</Link></li>
              <li><Link href="#" className="text-gray-600 text-sm hover:text-black transition-colors">Balíky</Link></li>
              <li><Link href="#" className="text-gray-600 text-sm hover:text-black transition-colors">Nákupy</Link></li>
              <li><Link href="#" className="text-gray-600 text-sm hover:text-black transition-colors">Express</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-6">Společnost</h4>
            <ul className="list-none space-y-3">
              <li><Link href="#" className="text-gray-600 text-sm hover:text-black transition-colors">O nás</Link></li>
              <li><Link href="/kuryr" className="text-gray-600 text-sm hover:text-black transition-colors">Pro kurýry</Link></li>
              <li><Link href="#" className="text-gray-600 text-sm hover:text-black transition-colors">Kontakt</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-6">Podpora</h4>
            <ul className="list-none space-y-3">
              <li><Link href="#" className="text-gray-600 text-sm hover:text-black transition-colors">FAQ</Link></li>
              <li><Link href="#" className="text-gray-600 text-sm hover:text-black transition-colors">Reklamace</Link></li>
              <li><Link href="#" className="text-gray-600 text-sm hover:text-black transition-colors">API</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-10 border-t border-gray-200 gap-4">
          <p className="text-gray-500 text-sm">
            2025 voru CAPITAL s.r.o. Všechna práva vyhrazena.
          </p>
          <div className="flex gap-8">
            <Link href="#" className="text-gray-500 text-sm hover:text-black transition-colors">Ochrana soukromí</Link>
            <Link href="#" className="text-gray-500 text-sm hover:text-black transition-colors">Obchodní podmínky</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
