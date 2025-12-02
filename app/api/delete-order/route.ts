import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { order_id } = await request.json()

    if (!order_id) {
      return NextResponse.json({ error: 'Missing order_id' }, { status: 400 })
    }

    // Get order to check if courier is assigned
    const { data: order } = await (supabase.from('orders') as any)
      .select('courier_id')
      .eq('id', order_id)
      .single()

    // If courier was assigned, set them back to available
    if (order?.courier_id) {
      await (supabase.from('couriers') as any)
        .update({ status: 'available' })
        .eq('id', order.courier_id)
    }

    // Delete the order
    const { error } = await (supabase.from('orders') as any)
      .delete()
      .eq('id', order_id)

    if (error) {
      console.error('Delete order error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Order deleted:', order_id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete order error:', error)
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 })
  }
}
