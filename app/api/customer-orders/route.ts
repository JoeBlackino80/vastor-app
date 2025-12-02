import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')
  if (!email) {
    return NextResponse.json({ error: 'Missing email' }, { status: 400 })
  }
  const { data: orders, error } = await (supabase.from('orders') as any)
    .select('*')
    .eq('customer_email', email)
    .order('created_at', { ascending: false })
  if (error) {
    return NextResponse.json({ orders: [] })
  }
  return NextResponse.json({ orders: orders || [] })
}
