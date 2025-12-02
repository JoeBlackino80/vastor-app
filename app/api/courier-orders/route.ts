import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const courier_id = searchParams.get('courier_id')

  if (!courier_id) {
    return NextResponse.json({ error: 'Missing courier_id' }, { status: 400 })
  }

  const { data: orders, error } = await (supabase.from('orders') as any)
    .select('*')
    .eq('courier_id', courier_id)
    .in('status', ['assigned', 'pending'])
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Fetch courier orders error:', error)
    return NextResponse.json({ orders: [] })
  }

  return NextResponse.json({ orders })
}
