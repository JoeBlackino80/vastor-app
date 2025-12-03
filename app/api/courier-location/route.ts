import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { courier_id, latitude, longitude } = await request.json()

    const { error } = await (supabase.from('couriers') as any)
      .update({
        current_latitude: latitude,
        current_longitude: longitude,
        last_location_update: new Date().toISOString()
      })
      .eq('id', courier_id)

    if (error) {
      console.error('Update location error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Location error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
