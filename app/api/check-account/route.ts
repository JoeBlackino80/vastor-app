import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { email, type } = await request.json()
    
    if (!email) {
      return NextResponse.json({ exists: false, reason: 'missing_email' })
    }

    const table = type === 'courier' ? 'couriers' : 'customers'
    const normalizedEmail = email.trim().toLowerCase()

    const { data, error } = await (supabase.from(table) as any)
      .select('id, phone')
      .eq('email', normalizedEmail)
      .single()

    if (error || !data) {
      return NextResponse.json({ exists: false })
    }

    return NextResponse.json({ 
      exists: true, 
      phone: data.phone,
      id: data.id
    })
  } catch (error) {
    return NextResponse.json({ exists: false, reason: 'error' })
  }
}
