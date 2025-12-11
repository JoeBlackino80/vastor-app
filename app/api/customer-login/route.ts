import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { email, phone, otp_verified } = await request.json()
    
    const identifierField = phone ? 'phone' : 'email'
    const identifierValue = phone ? phone.trim() : email?.toLowerCase().trim()
    
    if (!identifierValue) {
      return NextResponse.json({ error: 'Chýba telefón alebo email' }, { status: 400 })
    }

    const { data: customer, error } = await (supabase.from('customers') as any)
      .select('*')
      .eq(identifierField, identifierValue)
      .single()

    if (error || !customer) {
      return NextResponse.json({ error: 'Účet neexistuje' }, { status: 401 })
    }

    if (!otp_verified) {
      return NextResponse.json({ error: 'OTP overenie vyžadované' }, { status: 401 })
    }

    const { password_hash: _, pin_hash: __, ...safeCustomer } = customer

    return NextResponse.json({ success: true, customer: safeCustomer })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Prihlásenie zlyhalo' }, { status: 500 })
  }
}
