import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { order_id, courier_id } = await request.json()

    if (!order_id || !courier_id) {
      return NextResponse.json({ error: 'Missing order_id or courier_id' }, { status: 400 })
    }

    // Update order
    const { error: orderError } = await (supabase.from('orders') as any)
      .update({ courier_id, status: 'assigned' })
      .eq('id', order_id)

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 500 })
    }

    // Update courier to busy
    const { error: courierError } = await (supabase.from('couriers') as any)
      .update({ status: 'busy' })
      .eq('id', courier_id)

    if (courierError) {
      return NextResponse.json({ error: courierError.message }, { status: 500 })
    }

    console.log('Manually assigned courier:', courier_id, 'to order:', order_id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Assign courier error:', error)
    return NextResponse.json({ error: 'Failed to assign courier' }, { status: 500 })
  }
}
