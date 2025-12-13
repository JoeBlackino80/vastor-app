import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  let phone = searchParams.get('phone')
  const email = searchParams.get('email')

  if (!phone && !email) {
    return NextResponse.json({ error: 'Missing phone or email' }, { status: 400 })
  }

  try {
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false })

    if (phone) {
      const phoneDigits = phone.replace(/\D/g, '')
      query = query.ilike('customer_phone', '%' + phoneDigits.slice(-9) + '%')
    } else if (email) {
      query = query.eq('customer_email', email)
    }

    const { data: orders, error } = await query

    if (error) {
      console.error('Customer orders error:', error)
      return NextResponse.json([])
    }

    return NextResponse.json(orders || [])
  } catch (err) {
    console.error('Customer orders exception:', err)
    return NextResponse.json([])
  }
}
