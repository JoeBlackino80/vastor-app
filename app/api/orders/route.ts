import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { calculateDistance } from '@/lib/distance'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // 1. Vytvor objednávku so statusom 'looking_for_courier'
    const { data: order, error } = await (supabase.from('orders') as any)
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
        status: 'looking_for_courier'
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Order created:', order.id)

    // 2. Geocoding pickup adresy
    let pickupLat: number | null = null
    let pickupLng: number | null = null

    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(body.pickup_address)}&limit=1`,
        { headers: { 'User-Agent': 'VASTOR-App/1.0' } }
      )
      const geoData = await geoRes.json()
      if (geoData?.[0]) {
        pickupLat = parseFloat(geoData[0].lat)
        pickupLng = parseFloat(geoData[0].lon)
      }
    } catch (e) {
      console.error('Geocoding error:', e)
    }

    // 3. Nájdi dostupných kurierov
    const { data: couriers } = await (supabase.from('couriers') as any)
      .select('id, first_name')
      .eq('status', 'available')

    if (couriers && couriers.length > 0) {
      // Získaj polohy
      const courierIds = couriers.map((c: any) => c.id)
      const { data: locations } = await (supabase.from('courier_locations') as any)
        .select('courier_id, latitude, longitude')
        .in('courier_id', courierIds)
        .order('updated_at', { ascending: false })

      let selectedCourier = null
      let distance = null

      if (pickupLat && pickupLng && locations?.length > 0) {
        // Nájdi najbližšieho
        const courierLocs: Record<string, { lat: number, lng: number }> = {}
        for (const loc of locations) {
          if (!courierLocs[loc.courier_id]) {
            courierLocs[loc.courier_id] = { lat: loc.latitude, lng: loc.longitude }
          }
        }

        let minDist = Infinity
        for (const c of couriers) {
          const loc = courierLocs[c.id]
          if (loc) {
            const dist = calculateDistance(pickupLat, pickupLng, loc.lat, loc.lng)
            console.log(`Courier ${c.first_name}: ${dist.toFixed(2)} km`)
            if (dist < minDist) {
              minDist = dist
              selectedCourier = c
              distance = dist
            }
          }
        }
      }

      // Ak nemáme GPS, použi prvého
      if (!selectedCourier) {
        selectedCourier = couriers[0]
      }

      // Ponúkni objednávku kurierovi (30 sekúnd na odpoveď)
      await (supabase.from('orders') as any)
        .update({
          offered_to: selectedCourier.id,
          offer_expires_at: new Date(Date.now() + 30000).toISOString(),
          offer_distance: distance
        })
        .eq('id', order.id)

      console.log('Offered to courier:', selectedCourier.first_name)
    }

    // 4. Pošli email
    try {
      await fetch(new URL('/api/send-email', request.url).toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: body.customer_email,
          orderId: order.id,
          pickupAddress: body.pickup_address,
          deliveryAddress: body.delivery_address
        })
      })
    } catch (e) {}

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error('Order error:', error)
    return NextResponse.json({ error: 'Nepodarilo sa vytvorit objednavku' }, { status: 500 })
  }
}

export async function GET() {
  const { data: orders } = await (supabase.from('orders') as any)
    .select('*')
    .order('created_at', { ascending: false })
  return NextResponse.json({ orders: orders || [] })
}
