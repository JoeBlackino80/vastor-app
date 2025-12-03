import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    const { data: customer, error } = await (supabase.from('customers') as any)
      .select('*').eq('email', email.toLowerCase().trim()).single()
    if (error || !customer) return NextResponse.json({ error: 'Účet neexistuje' }, { status: 401 })
    const validPassword = await bcrypt.compare(password, customer.password_hash)
    if (!validPassword) return NextResponse.json({ error: 'Nesprávne heslo' }, { status: 401 })
    const { password_hash: _, ...safeCustomer } = customer
    return NextResponse.json({ success: true, customer: safeCustomer })
  } catch (error) {
    return NextResponse.json({ error: 'Prihlásenie zlyhalo' }, { status: 500 })
  }
}
