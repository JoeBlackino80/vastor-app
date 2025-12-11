import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const DEV_PHONES = ['+421909188881']

export async function POST(request: Request) {
  try {
    const { phone } = await request.json()
    
    // Only allow dev phones
    if (!DEV_PHONES.includes(phone)) {
      return NextResponse.json({ error: 'Not allowed' }, { status: 403 })
    }

    // Delete customer with this phone
    await (supabase.from('customers') as any).delete().eq('phone', phone)
    
    // Delete courier with this phone
    await (supabase.from('couriers') as any).delete().eq('phone', phone)
    
    // Delete OTP codes
    await (supabase.from('auth_otp_codes') as any).delete().eq('email', phone)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Reset failed' }, { status: 500 })
  }
}
