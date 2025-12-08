'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 py-5 bg-white/95 backdrop-blur-xl border-b border-gray-200">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 flex justify-between items-center">
        <Link href="/">
  <img src="/logo.png" alt="voru" style={{height: "100px"}} />
</Link>

        <ul className="hidden md:flex gap-10 list-none">
          <li><Link href="/#sluzby" className="text-gray-600 font-medium text-sm hover:text-black transition-colors">Služby</Link></li>
          <li><Link href="/#cenik" className="text-gray-600 font-medium text-sm hover:text-black transition-colors">Ceník</Link></li>
          <li><Link href="/kuryr" className="text-gray-600 font-medium text-sm hover:text-black transition-colors">Pre kuriérov</Link></li>
          <li><Link href="/admin" className="text-gray-600 font-medium text-sm hover:text-black transition-colors">Admin</Link></li>
        </ul>

        <div className="hidden md:flex gap-4">
          <Link href="/objednavka" className="btn btn-primary">Objednať kuriéra</Link>
        </div>

        <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 py-6 px-6">
          <ul className="flex flex-col gap-4 list-none mb-6">
            <li><Link href="/#sluzby" className="text-gray-600 font-medium" onClick={() => setMobileMenuOpen(false)}>Služby</Link></li>
            <li><Link href="/#cenik" className="text-gray-600 font-medium" onClick={() => setMobileMenuOpen(false)}>Ceník</Link></li>
            <li><Link href="/kuryr" className="text-gray-600 font-medium" onClick={() => setMobileMenuOpen(false)}>Pre kuriérov</Link></li>
          </ul>
          <Link href="/objednavka" className="btn btn-primary w-full justify-center" onClick={() => setMobileMenuOpen(false)}>Objednať kuriéra</Link>
        </div>
      )}
    </nav>
  )
}
