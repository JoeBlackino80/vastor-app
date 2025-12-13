import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { phone, pin } = await req.json()

    if (!phone || !pin) {
      return NextResponse.json({ error: 'Telefón a PIN sú povinné' }, { status: 400 })
    }

    // Find customer by phone
    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', phone)
      .single()

    if (error || !customer) {
      return NextResponse.json({ error: 'Účet nenájdený' }, { status: 404 })
    }

    // Check PIN
    if (!customer.pin_hash) {
      return NextResponse.json({ error: 'PIN nie je nastavený' }, { status: 400 })
    }

    const validPin = await bcrypt.compare(pin, customer.pin_hash)
    if (!validPin) {
      return NextResponse.json({ error: 'Nesprávny PIN' }, { status: 401 })
    }

    // Return customer without sensitive data
    const { pin_hash, ...safeCustomer } = customer

    return NextResponse.json({ success: true, customer: safeCustomer })
  } catch (err) {
    console.error('Verify PIN error:', err)
    return NextResponse.json({ error: 'Chyba servera' }, { status: 500 })
  }
}
