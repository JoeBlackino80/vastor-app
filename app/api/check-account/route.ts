import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { email, phone, type } = await request.json()
    
    const table = type === 'courier' ? 'couriers' : 'customers'
    
    const identifierField = phone ? 'phone' : 'email'
    const identifierValue = phone ? phone.trim() : email?.toLowerCase().trim()
    
    if (!identifierValue) {
      return NextResponse.json({ exists: false, reason: 'missing_identifier' })
    }

    const { data, error } = await (supabase.from(table) as any)
      .select('id, phone, email')
      .eq(identifierField, identifierValue)
      .single()

    if (error || !data) {
      return NextResponse.json({ exists: false })
    }

    return NextResponse.json({
      exists: true,
      phone: data.phone,
      email: data.email,
      id: data.id
    })
  } catch (error) {
    return NextResponse.json({ exists: false, reason: 'error' })
  }
}
