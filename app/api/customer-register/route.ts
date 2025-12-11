import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const phone = body.phone?.trim()
    const email = body.email?.toLowerCase().trim()

    if (!phone) {
      return NextResponse.json({ error: 'Telefón je povinný' }, { status: 400 })
    }

    const { data: existingPhone } = await (supabase.from('customers') as any)
      .select('id').eq('phone', phone).single()
    if (existingPhone) {
      return NextResponse.json({ error: 'Telefón už existuje' }, { status: 400 })
    }

    if (email) {
      const { data: existingEmail } = await (supabase.from('customers') as any)
        .select('id').eq('email', email).single()
      if (existingEmail) {
        return NextResponse.json({ error: 'Email už existuje' }, { status: 400 })
      }
    }

    const customerData: any = {
      account_type: body.accountType || body.account_type || 'individual',
      phone,
      email: email || null,
      street: body.street,
      city: body.city,
      postal_code: body.postalCode || body.postal_code,
      country: body.country || 'Slovensko',
      phone_verified: true
    }

    if (customerData.account_type === 'individual') {
      customerData.first_name = body.firstName || body.first_name
      customerData.last_name = body.lastName || body.last_name
    } else {
      customerData.company_name = body.companyName || body.company_name
      customerData.ico = body.ico
      customerData.dic = body.dic
      customerData.ic_dph = body.icDph || body.ic_dph
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
