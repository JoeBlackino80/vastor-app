import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Creating order with body:', JSON.stringify(body))

    const { data: order, error } = await (supabase
      .from('orders') as any)
      .insert({
        customer_name: body.customer_name,
        customer_email: body.customer_email,
        customer_phone: body.customer_phone,
        pickup_address: body.pickup_address,
        pickup_notes: body.pickup_notes || null,
        delivery_address: body.delivery_address,
        delivery_notes: body.delivery_notes || null,
        package_type: body.package_type,
        service_type: body.service_type,
        price: body.price,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Order insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Order created:', order.id)

    // Hladaj dostupneho kuriera
    const { data: couriers, error: courierError } = await (supabase
      .from('couriers') as any)
      .select('*')
      .eq('status', 'available')

    console.log('Available couriers:', couriers, 'Error:', courierError)

    if (couriers && couriers.length > 0) {
      const courier = couriers[0]
      console.log('Assigning courier:', courier.id)

      // Update order
      const { error: orderUpdateError } = await (supabase.from('orders') as any)
        .update({ courier_id: courier.id, status: 'assigned' })
        .eq('id', order.id)

      if (orderUpdateError) {
        console.error('Order update error:', orderUpdateError)
      } else {
        console.log('Order updated to assigned')
      }

      // Update courier
      const { error: courierUpdateError } = await (supabase.from('couriers') as any)
        .update({ status: 'busy' })
        .eq('id', courier.id)

      if (courierUpdateError) {
        console.error('Courier update error:', courierUpdateError)
      } else {
        console.log('Courier updated to busy')
      }
    } else {
      console.log('No available couriers found')
    }

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json({ error: 'Nepodarilo sa vytvorit objednavku' }, { status: 500 })
  }
}

export async function GET() {
  const { data: orders, error } = await (supabase.from('orders') as any)
    .select('*')
    .order('created_at', { ascending: false })

  return NextResponse.json({ orders: orders || [] })
}
