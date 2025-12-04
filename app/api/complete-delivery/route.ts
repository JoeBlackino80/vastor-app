import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { order_id, courier_id, pin } = await request.json()

    if (!order_id || !courier_id) {
      return NextResponse.json({ error: 'Missing order_id or courier_id' }, { status: 400 })
    }

    // Get order details
    const { data: order } = await (supabase.from('orders') as any)
      .select('*')
      .eq('id', order_id)
      .single()

    if (!order) {
      return NextResponse.json({ error: 'Objednávka nenájdená' }, { status: 404 })
    }

    // PIN verification
    if (order.delivery_pin && order.delivery_pin !== pin) {
      return NextResponse.json({ error: 'Nesprávny PIN kód' }, { status: 400 })
    }

    // Calculate courier earnings (70% of order price)
    const courierEarnings = order ? Math.round(order.price * 0.7) : 0

    // Update order status to delivered
    const { error: orderError } = await (supabase.from('orders') as any)
      .update({
        status: 'delivered',
        completed_at: new Date().toISOString(),
        courier_earnings: courierEarnings
      })
      .eq('id', order_id)

    if (orderError) {
      console.error('Order update error:', orderError)
      return NextResponse.json({ error: orderError.message }, { status: 500 })
    }

    // Update courier status to available and increment deliveries
    const { data: courier } = await (supabase.from('couriers') as any)
      .select('total_deliveries')
      .eq('id', courier_id)
      .single()

    await (supabase.from('couriers') as any)
      .update({
        status: 'available',
        total_deliveries: (courier?.total_deliveries || 0) + 1
      })
      .eq('id', courier_id)

    // Send delivered email
    if (order?.customer_email) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://vastor-app.vercel.app'}/api/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: order.customer_email,
            orderId: order_id,
            deliveryAddress: order.delivery_address,
            type: 'delivered'
          })
        })
      } catch (e) {
        console.error('Email error:', e)
      }
    }

    return NextResponse.json({ success: true, earnings: courierEarnings })
  } catch (error) {
    console.error('Complete delivery error:', error)
    return NextResponse.json({ error: 'Failed to complete delivery' }, { status: 500 })
  }
}
