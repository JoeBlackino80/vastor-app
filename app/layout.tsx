import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'VASTOR | Kurýrní služba Praha',
  description: 'Profesionální kurýrní služba pro Prahu. Dokumenty, balíky, nákupy. Doručení do 60 minut.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="cs">
      <body>{children}</body>
    </html>
  )
}
