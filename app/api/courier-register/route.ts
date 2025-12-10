import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = body.email.toLowerCase().trim()

    // Check if email already exists
    const { data: existing } = await (supabase.from('couriers') as any)
      .select('id')
      .eq('email', email)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Email už existuje' }, { status: 400 })
    }

    // Insert courier (no password, pending approval)
    const { data: courier, error } = await (supabase.from('couriers') as any)
      .insert({
        first_name: body.first_name,
        last_name: body.last_name,
        email,
        phone: body.phone,
        vehicle_type: body.vehicle_type,
        status: 'pending',
        rating: 5.00,
        total_deliveries: 0,
        email_verified: true // Verified via OTP
      })
      .select()
      .single()

    if (error) {
      console.error('Registration error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, courier })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Registrácia zlyhala' }, { status: 500 })
  }
}
