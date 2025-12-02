import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - získaj aktívne ponuky pre kuriera
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const courier_id = searchParams.get('courier_id')

  if (!courier_id) {
    return NextResponse.json({ error: 'Missing courier_id' }, { status: 400 })
  }

  // Nájdi ponuky pre tohto kuriera, ktoré ešte nevypršali
  const { data: offers, error } = await (supabase.from('orders') as any)
    .select('*')
    .eq('offered_to', courier_id)
    .eq('status', 'looking_for_courier')
    .gt('offer_expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Fetch offers error:', error)
    return NextResponse.json({ offers: [] })
  }

  return NextResponse.json({ offers: offers || [] })
}
