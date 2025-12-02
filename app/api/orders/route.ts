import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()

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
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Order created:', order.id)

    const { data: availableCourier, error: courierError } = await (supabase
      .from('couriers') as any)
      .select('*')
      .eq('status', 'available')
      .limit(1)
      .single()

    console.log('Courier search result:', availableCourier, courierError)

    if (availableCourier) {
      await (supabase.from('orders') as any)
        .update({ courier_id: availableCourier.id, status: 'assigned' })
        .eq('id', order.id)

      await (supabase.from('couriers') as any)
        .update({ status: 'busy' })
        .eq('id', availableCourier.id)

      console.log('Courier assigned:', availableCourier.id)
    }

    return NextResponse.json({ success: true, order, courierAssigned: !!availableCourier })
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
