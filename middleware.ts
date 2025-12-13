import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''
  const pathname = request.nextUrl.pathname

  // Kuriérska subdoména
  if (host.startsWith('kurier.')) {
    if (pathname === '/') {
      return NextResponse.rewrite(new URL('/kuryr', request.url))
    }
    if (pathname === '/registracia') {
      return NextResponse.rewrite(new URL('/kuryr/registracia', request.url))
    }
    if (pathname === '/prihlasenie') {
      return NextResponse.rewrite(new URL('/kuryr', request.url))
    }
    if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
      return NextResponse.rewrite(new URL('/kuryr' + pathname, request.url))
    }
  }

  // Hlavná doména - presmeruj /kuryr/* na subdoménu
  if (!host.startsWith('kurier.') && pathname.startsWith('/kuryr')) {
    const protocol = request.headers.get('x-forwarded-proto') || 'https'
    const newPath = pathname.replace('/kuryr', '') || '/'
    return NextResponse.redirect(new URL(newPath, 'https://kurier.voru.sk'))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/kuryr/:path*', '/registracia', '/prihlasenie', '/dashboard/:path*']
}
