import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Check if email exists
    const { data: existing } = await (supabase.from('couriers') as any)
      .select('id')
      .eq('email', body.email)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Email uz je registrovany' }, { status: 400 })
    }

    // Hash password
    const password_hash = await bcrypt.hash(body.password, 10)

    // Insert courier with all fields
    const { data: courier, error } = await (supabase.from('couriers') as any)
      .insert({
        first_name: body.first_name,
        last_name: body.last_name,
        birth_date: body.birth_date,
        nationality: body.nationality,
        id_number: body.id_number,
        email: body.email,
        phone: body.phone,
        street: body.street,
        city: body.city,
        postal_code: body.postal_code,
        password_hash: password_hash,
        vehicle_type: body.vehicle_type,
        drivers_license: body.drivers_license || null,
        vehicle_plate: body.vehicle_plate || null,
        iban: body.iban,
        bank_name: body.bank_name || null,
        experience: body.experience,
        availability: body.availability,
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

    console.log('New courier registered:', courier.email)

    return NextResponse.json({ success: true, courier })
  } catch (error) {
    console.error('Courier registration error:', error)
    return NextResponse.json({ error: 'Failed to register' }, { status: 500 })
  }
}
