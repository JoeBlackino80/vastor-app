import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = body.email.toLowerCase().trim()

    // Check if email already exists
    const { data: existing } = await (supabase.from('customers') as any)
      .select('id').eq('email', email).single()
    if (existing) {
      return NextResponse.json({ error: 'Email už existuje' }, { status: 400 })
    }

    // Build customer data (no password)
    const customerData: any = {
      account_type: body.account_type,
      email,
      phone: body.phone,
      street: body.street,
      city: body.city,
      postal_code: body.postal_code,
      country: body.country || 'Slovensko',
      email_verified: true // Verified via OTP
    }

    if (body.account_type === 'individual') {
      customerData.first_name = body.first_name
      customerData.last_name = body.last_name
    } else {
      customerData.company_name = body.company_name
      customerData.ico = body.ico
      customerData.dic = body.dic
      customerData.ic_dph = body.ic_dph
    }

    const { data: customer, error } = await (supabase.from('customers') as any)
      .insert(customerData).select().single()

    if (error) {
      console.error('Registration error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, customer })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Registrácia zlyhala' }, { status: 500 })
  }
}
