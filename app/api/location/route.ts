import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { courier_id, order_id, latitude, longitude } = body

    console.log('Saving location:', { courier_id, order_id, latitude, longitude })

    const { data, error } = await supabase
      .from('courier_locations')
      .insert({
        courier_id,
        order_id,
        latitude,
        longitude,
        updated_at: new Date().toISOString()
      })
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, location: data })
  } catch (error) {
    console.error('Location update error:', error)
    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const order_id = searchParams.get('order_id')

  if (!order_id) {
    return NextResponse.json({ error: 'Missing order_id' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('courier_locations')
    .select('*')
    .eq('order_id', order_id)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    return NextResponse.json({ location: null })
  }

  return NextResponse.json({ location: data })
}
