import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { order_id, courier_id } = await request.json()

    if (!order_id || !courier_id) {
      return NextResponse.json({ error: 'Missing order_id or courier_id' }, { status: 400 })
    }

    // Update order status to delivered
    const { error: orderError } = await (supabase.from('orders') as any)
      .update({ status: 'delivered' })
      .eq('id', order_id)

    if (orderError) {
      console.error('Order update error:', orderError)
      return NextResponse.json({ error: orderError.message }, { status: 500 })
    }

    // Update courier status to available
    const { error: courierError } = await (supabase.from('couriers') as any)
      .update({ status: 'available' })
      .eq('id', courier_id)

    if (courierError) {
      console.error('Courier update error:', courierError)
      return NextResponse.json({ error: courierError.message }, { status: 500 })
    }

    console.log('Delivery completed - Order:', order_id, 'Courier:', courier_id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Complete delivery error:', error)
    return NextResponse.json({ error: 'Failed to complete delivery' }, { status: 500 })
  }
}
