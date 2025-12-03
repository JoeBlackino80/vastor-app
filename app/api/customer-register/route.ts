import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { data: existing } = await (supabase.from('customers') as any)
      .select('id').eq('email', body.email.toLowerCase().trim()).single()
    if (existing) return NextResponse.json({ error: 'Email už existuje' }, { status: 400 })
    const password_hash = await bcrypt.hash(body.password, 10)
    const customerData: any = {
      account_type: body.account_type,
      email: body.email.toLowerCase().trim(),
      password_hash, phone: body.phone, street: body.street,
      city: body.city, postal_code: body.postal_code, country: body.country || 'Slovensko'
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
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, customer })
  } catch (error) {
    return NextResponse.json({ error: 'Registrácia zlyhala' }, { status: 500 })
  }
}
