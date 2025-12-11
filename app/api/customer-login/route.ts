import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { email, otp_verified } = await request.json()
    
    if (!otp_verified) {
      return NextResponse.json({ error: 'OTP overenie potrebné' }, { status: 401 })
    }
    
    const { data: customer, error } = await (supabase.from('customers') as any)
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single()
    
    if (error || !customer) {
      return NextResponse.json({ error: 'Účet neexistuje' }, { status: 401 })
    }
    
    // Remove sensitive fields
    const { password_hash: _, ...safeCustomer } = customer
    
    return NextResponse.json({ success: true, customer: safeCustomer })
  } catch (error) {
    return NextResponse.json({ error: 'Prihlásenie zlyhalo' }, { status: 500 })
  }
}
