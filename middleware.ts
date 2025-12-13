import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''
  const pathname = request.nextUrl.pathname

  // Admin subdoména
  if (host.startsWith('admin.')) {
    if (pathname === '/') {
      return NextResponse.rewrite(new URL('/admin', request.url))
    }
    if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
      return NextResponse.rewrite(new URL('/admin' + pathname, request.url))
    }
    if (pathname.startsWith('/api/')) {
      return NextResponse.next()
    }
    return NextResponse.rewrite(new URL('/admin' + pathname, request.url))
  }

  // Kuriérska subdoména
  if (host.startsWith('kurier.')) {
    if (pathname === '/') {
      return NextResponse.rewrite(new URL('/kuryr', request.url))
    }
    if (pathname === '/registracia') {
      return NextResponse.rewrite(new URL('/kuryr/registracia', request.url))
    }
    if (pathname === '/prihlasenie') {
      return NextResponse.rewrite(new URL('/kuryr/prihlasenie', request.url))
    }
    if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
      return NextResponse.rewrite(new URL('/kuryr' + pathname, request.url))
    }
  }

  // Hlavná doména - presmeruj /kuryr/* na subdoménu
  if (!host.startsWith('kurier.') && !host.startsWith('admin.') && pathname.startsWith('/kuryr')) {
    const newPath = pathname.replace('/kuryr', '') || '/'
    return NextResponse.redirect(new URL(newPath, 'https://kurier.voru.sk'))
  }

  // Hlavná doména - presmeruj /admin/* na subdoménu
  if (!host.startsWith('admin.') && !host.startsWith('kurier.') && pathname.startsWith('/admin')) {
    const newPath = pathname.replace('/admin', '') || '/'
    return NextResponse.redirect(new URL(newPath, 'https://admin.voru.sk'))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/kuryr/:path*', '/admin/:path*', '/registracia', '/prihlasenie', '/dashboard/:path*']
}
