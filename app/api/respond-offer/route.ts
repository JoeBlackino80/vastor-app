import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { calculateDistance } from '@/lib/distance'

export async function POST(request: Request) {
  try {
    const { order_id, courier_id, action } = await request.json()

    if (!order_id || !courier_id || !action) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 })
    }

    // Získaj objednávku
    const { data: order } = await (supabase.from('orders') as any)
      .select('*')
      .eq('id', order_id)
      .single()

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Skontroluj či ponuka ešte platí
    if (order.offered_to !== courier_id || order.status !== 'looking_for_courier') {
      return NextResponse.json({ error: 'Offer expired or already taken' }, { status: 400 })
    }

    if (action === 'accept') {
      // Kurýr prijal - priraď ho
      await (supabase.from('orders') as any)
        .update({ 
          courier_id: courier_id, 
          status: 'assigned',
          offered_to: null,
          offer_expires_at: null
        })
        .eq('id', order_id)

      await (supabase.from('couriers') as any)
        .update({ status: 'busy' })
        .eq('id', courier_id)

      console.log('Order accepted by courier:', courier_id)

      return NextResponse.json({ success: true, message: 'accepted' })

    } else if (action === 'reject') {
      // Kurýr odmietol - ponúkni ďalšiemu
      console.log('Order rejected by courier:', courier_id)

      // Nájdi ďalšieho najbližšieho kuriera
      const nextCourier = await findNextCourier(order, courier_id)

      if (nextCourier) {
        await (supabase.from('orders') as any)
          .update({ 
            offered_to: nextCourier.id,
            offer_expires_at: new Date(Date.now() + 30000).toISOString(), // 30 sekúnd
            offer_distance: nextCourier.distance
          })
          .eq('id', order_id)

        console.log('Offered to next courier:', nextCourier.id)
      } else {
        // Žiadny ďalší kurýr - nechaj ako pending
        await (supabase.from('orders') as any)
          .update({ 
            offered_to: null,
            offer_expires_at: null,
            status: 'pending'
          })
          .eq('id', order_id)

        console.log('No more couriers available')
      }

      return NextResponse.json({ success: true, message: 'rejected' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Respond offer error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

async function findNextCourier(order: any, excludeCourierId: string) {
  // Získaj dostupných kurierov okrem toho čo odmietol
  const { data: couriers } = await (supabase.from('couriers') as any)
    .select('id, first_name')
    .eq('status', 'available')
    .neq('id', excludeCourierId)

  if (!couriers || couriers.length === 0) return null

  // Získaj ich polohy
  const courierIds = couriers.map((c: any) => c.id)
  const { data: locations } = await (supabase.from('courier_locations') as any)
    .select('courier_id, latitude, longitude')
    .in('courier_id', courierIds)
    .order('updated_at', { ascending: false })

  if (!locations) return couriers[0]

  // Geocode pickup adresu
  let pickupLat = null, pickupLng = null
  try {
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(order.pickup_address)}&limit=1`,
      { headers: { 'User-Agent': 'VASTOR-App/1.0' } }
    )
    const geoData = await geoRes.json()
    if (geoData?.[0]) {
      pickupLat = parseFloat(geoData[0].lat)
      pickupLng = parseFloat(geoData[0].lon)
    }
  } catch (e) {}

  if (!pickupLat) return { id: couriers[0].id, distance: null }

  // Nájdi najbližšieho
  const courierLocs: Record<string, { lat: number, lng: number }> = {}
  for (const loc of locations) {
    if (!courierLocs[loc.courier_id]) {
      courierLocs[loc.courier_id] = { lat: loc.latitude, lng: loc.longitude }
    }
  }

  let minDist = Infinity
  let nearest = null
  for (const c of couriers) {
    const loc = courierLocs[c.id]
    if (loc) {
      const dist = calculateDistance(pickupLat, pickupLng, loc.lat, loc.lng)
      if (dist < minDist) {
        minDist = dist
        nearest = { id: c.id, distance: dist }
      }
    }
  }

  return nearest || { id: couriers[0].id, distance: null }
}
