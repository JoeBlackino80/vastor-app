import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const phone = searchParams.get('phone')
  const email = searchParams.get('email')

  if (!phone && !email) {
    return NextResponse.json({ error: 'Missing phone or email' }, { status: 400 })
  }

  let query = supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (phone) {
    query = query.eq('customer_phone', phone)
  } else if (email) {
    query = query.eq('customer_email', email)
  }

  const { data: orders, error } = await query

  if (error) {
    console.error('Customer orders error:', error)
    return NextResponse.json([])
  }

  return NextResponse.json(orders || [])
}
