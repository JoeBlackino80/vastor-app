import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { calculateDistance } from '@/lib/distance'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // 1. Vytvor objednávku
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
        status: 'pending'
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
      if (geoData && geoData.length > 0) {
        pickupLat = parseFloat(geoData[0].lat)
        pickupLng = parseFloat(geoData[0].lon)
        console.log('Pickup location:', pickupLat, pickupLng)
      }
    } catch (geoError) {
      console.error('Geocoding error:', geoError)
    }

    // 3. Nájdi dostupných kurierov s ich polohou
    const { data: availableCouriers } = await (supabase.from('couriers') as any)
      .select('id, first_name, last_name')
      .eq('status', 'available')

    let assignedCourier = null

    if (availableCouriers && availableCouriers.length > 0) {
      // 4. Získaj posledné polohy kurierov
      const courierIds = availableCouriers.map((c: any) => c.id)
      
      const { data: locations } = await (supabase.from('courier_locations') as any)
        .select('courier_id, latitude, longitude, updated_at')
        .in('courier_id', courierIds)
        .order('updated_at', { ascending: false })

      // Vytvor mapu posledných polôh
      const courierLocations: Record<string, { lat: number, lng: number }> = {}
      if (locations) {
        for (const loc of locations) {
          if (!courierLocations[loc.courier_id]) {
            courierLocations[loc.courier_id] = { lat: loc.latitude, lng: loc.longitude }
          }
        }
      }

      // 5. Ak máme GPS pickup adresy, nájdi najbližšieho kuriera
      if (pickupLat && pickupLng && Object.keys(courierLocations).length > 0) {
        let minDistance = Infinity
        let nearestCourierId: string | null = null

        for (const courier of availableCouriers) {
          const loc = courierLocations[courier.id]
          if (loc) {
            const distance = calculateDistance(pickupLat, pickupLng, loc.lat, loc.lng)
            console.log(`Courier ${courier.first_name}: ${distance.toFixed(2)} km`)
            if (distance < minDistance) {
              minDistance = distance
              nearestCourierId = courier.id
            }
          }
        }

        if (nearestCourierId) {
          assignedCourier = availableCouriers.find((c: any) => c.id === nearestCourierId)
          console.log(`Nearest courier: ${assignedCourier?.first_name} (${minDistance.toFixed(2)} km)`)
        }
      }

      // 6. Ak nemáme GPS, použi prvého dostupného
      if (!assignedCourier) {
        assignedCourier = availableCouriers[0]
        console.log('No GPS data, using first available:', assignedCourier.first_name)
      }

      // 7. Priraď kuriera
      if (assignedCourier) {
        await (supabase.from('orders') as any)
          .update({ courier_id: assignedCourier.id, status: 'assigned' })
          .eq('id', order.id)

        await (supabase.from('couriers') as any)
          .update({ status: 'busy' })
          .eq('id', assignedCourier.id)

        console.log('Courier assigned:', assignedCourier.id)
      }
    } else {
      console.log('No available couriers')
    }

    // 8. Pošli email
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
    } catch (emailError) {
      console.error('Email error:', emailError)
    }

    return NextResponse.json({ 
      success: true, 
      order,
      courierAssigned: !!assignedCourier,
      courierName: assignedCourier ? `${assignedCourier.first_name} ${assignedCourier.last_name}` : null
    })
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
