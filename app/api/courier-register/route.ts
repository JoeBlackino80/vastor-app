import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    console.log('Registration attempt:', body.email)

    // Check if email exists
    const { data: existing } = await (supabase.from('couriers') as any)
      .select('id')
      .eq('email', body.email.toLowerCase().trim())
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Email uz existuje' }, { status: 400 })
    }

    // Hash password
    const password_hash = await bcrypt.hash(body.password, 10)

    const { data: courier, error } = await (supabase.from('couriers') as any)
      .insert({
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email.toLowerCase().trim(),
        phone: body.phone,
        vehicle_type: body.vehicle_type,
        password_hash: password_hash,
        status: 'pending',
        rating: 5.00,
        total_deliveries: 0
      })
      .select()
      .single()

    if (error) {
      console.error('Registration error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Registration successful:', courier.email)
    return NextResponse.json({ success: true, courier })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Failed to register' }, { status: 500 })
  }
}
