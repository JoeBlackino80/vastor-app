import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // 1. Vytvor objednavku
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

    // 2. Najdi dostupneho kuriera
    const { data: availableCourier } = await (supabase
      .from('couriers') as any)
      .select('*')
      .eq('status', 'available')
      .limit(1)
      .single()

    if (availableCourier) {
      // 3. Priraď kuriera k objednavke
      await (supabase.from('orders') as any)
        .update({ 
          courier_id: availableCourier.id,
          status: 'assigned'
        })
        .eq('id', order.id)

      // 4. Zmen status kuriera na busy
      await (supabase.from('couriers') as any)
        .update({ status: 'busy' })
        .eq('id', availableCourier.id)

      console.log(`Order ${order.id} assigned to courier ${availableCourier.id}`)
    }

    // 5. Posli email (ak je nastaveny)
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://vastor-app.vercel.app'}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: body.customer_email,
          orderId: order.id,
          pickupAddress: body.pickup_address,
          deliveryAddress: body.delivery_address
        })
      })
    } catch (emailError) {
      console.error('Email send error:', emailError)
    }

    return NextResponse.json({ 
      success: true, 
      order,
      courierAssigned: !!availableCourier
    })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json({ error: 'Nepodarilo sa vytvorit objednavku' }, { status: 500 })
  }
}

export async function GET() {
  const { data: orders, error } = await (supabase
    .from('orders') as any)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ orders: [] })
  }

  return NextResponse.json({ orders })
}
