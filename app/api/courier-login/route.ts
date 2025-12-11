import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = body.email?.trim().toLowerCase()

    if (!email) {
      return NextResponse.json({ message: 'missing_email' }, { status: 400 })
    }

    const { data: courier, error } = await (supabase.from('couriers') as any)
      .select('*')
      .eq('email', email)
      .single()

    if (error || !courier) {
      return NextResponse.json({ message: 'not_found' })
    }

    // If OTP verified, return courier directly
    if (body.otp_verified) {
      return NextResponse.json({ courier })
    }

    // Legacy password check (if needed)
    return NextResponse.json({ message: 'use_otp' })
  } catch (error) {
    return NextResponse.json({ message: 'error' }, { status: 500 })
  }
}
