import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''
  const pathname = request.nextUrl.pathname

  // Kuriérska subdoména
  if (host.startsWith('kurier.')) {
    // Presmeruj root na kuriérsku hlavnú stránku
    if (pathname === '/') {
      return NextResponse.rewrite(new URL('/kuryr', request.url))
    }
    // /registracia na kurier.voru.sk → /kuryr/registracia
    if (pathname === '/registracia') {
      return NextResponse.rewrite(new URL('/kuryr/registracia', request.url))
    }
    // /prihlasenie na kurier.voru.sk → /kuryr (má prihlásenie)
    if (pathname === '/prihlasenie') {
      return NextResponse.rewrite(new URL('/kuryr', request.url))
    }
    // /dashboard na kurier.voru.sk → /kuryr/dashboard
    if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
      return NextResponse.rewrite(new URL('/kuryr' + pathname, request.url))
    }
  }

  // Hlavná doména - presmeruj /kuryr/* na subdoménu
  if (!host.startsWith('kurier.') && pathname.startsWith('/kuryr')) {
    const kurierHost = host.replace('voru.sk', 'kurier.voru.sk').replace('vastor-app.vercel.app', 'kurier.voru.sk')
    const newPath = pathname.replace('/kuryr', '') || '/'
    return NextResponse.redirect(new URL(newPath, `https://${kurierHost}`))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/kuryr/:path*', '/registracia', '/prihlasenie', '/dashboard/:path*']
}
