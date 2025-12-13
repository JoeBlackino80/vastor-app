import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function generatePIN(): string {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const deliveryPin = generatePIN()

    // Priprav dáta - prázdne stringy zmeň na null
    const orderData = {
      customer_name: body.customer_name || 'Zákazník',
      customer_email: body.customer_email || null,
      customer_phone: body.customer_phone || null,
      pickup_address: body.pickup_address,
      pickup_notes: body.pickup_notes || null,
      pickup_floor: body.pickup_floor || null,
      pickup_doorbell: body.pickup_doorbell || null,
      delivery_address: body.delivery_address,
      delivery_notes: body.delivery_notes || null,
      delivery_floor: body.delivery_floor || null,
      delivery_doorbell: body.delivery_doorbell || null,
      recipient_name: body.recipient_name || null,
      recipient_surname: body.recipient_surname || null,
      recipient_company: body.recipient_company || null,
      recipient_phone: body.recipient_phone || null,
      recipient_email: body.recipient_email || null,
      order_notes: body.order_notes || null,
      delivery_pin: deliveryPin,
      package_type: body.package_type || 'small',
      package_description: body.package_description || null,
      service_type: body.service_type || 'standard',
      insurance: body.insurance || 0,
      reverse_delivery: body.reverse_delivery || false,
      photo_confirmation: body.photo_confirmation || false,
      price: body.price || 0,
      allowed_vehicles: body.allowed_vehicles || ['car'],
      pickup_time: body.pickup_time || 'asap',
      scheduled_pickup: body.scheduled_pickup || null,
      status: 'looking_for_courier'
    }

    const { data: order, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Order created:', order.id, 'PIN:', deliveryPin)

    // Geocoding pickup adresy
    let pickupLat: number | null = null
    let pickupLng: number | null = null

    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(body.pickup_address)}&limit=1`,
        { headers: { 'User-Agent': 'voru-App/1.0' } }
      )
      const geoData = await geoRes.json()
      if (geoData?.[0]) {
        pickupLat = parseFloat(geoData[0].lat)
        pickupLng = parseFloat(geoData[0].lon)
      }
    } catch (e) {
      console.error('Geocoding error:', e)
    }

    // Nájdi dostupných kurierov
    const { data: couriers } = await supabase
      .from('couriers')
      .select('id, first_name, vehicle_type')
      .eq('status', 'approved')
      .eq('is_online', true)

    if (couriers && couriers.length > 0) {
      // Filter by allowed vehicles
      const allowedVehicles = body.allowed_vehicles || ['car']
      const eligibleCouriers = couriers.filter((c: any) => 
        allowedVehicles.includes(c.vehicle_type)
      )

      if (eligibleCouriers.length > 0) {
        const courierIds = eligibleCouriers.map((c: any) => c.id)
        const { data: locations } = await supabase
          .from('courier_locations')
          .select('courier_id, latitude, longitude')
          .in('courier_id', courierIds)
          .order('updated_at', { ascending: false })

        let selectedCourier = eligibleCouriers[0]
        let distance = null

        if (pickupLat && pickupLng && locations?.length) {
          const courierLocs: Record<string, { lat: number, lng: number }> = {}
          for (const loc of locations) {
            if (!courierLocs[loc.courier_id]) {
              courierLocs[loc.courier_id] = { lat: loc.latitude, lng: loc.longitude }
            }
          }

          let minDist = Infinity
          for (const c of eligibleCouriers) {
            const loc = courierLocs[c.id]
            if (loc) {
              const dist = calculateDistance(pickupLat, pickupLng, loc.lat, loc.lng)
              if (dist < minDist) {
                minDist = dist
                selectedCourier = c
                distance = dist
              }
            }
          }
        }

        await supabase
          .from('orders')
          .update({
            offered_to: selectedCourier.id,
            offer_expires_at: new Date(Date.now() + 30000).toISOString(),
            offer_distance: distance
          })
          .eq('id', order.id)
      }
    }

    // Pošli email objednávateľovi
    if (body.customer_email) {
      try {
        await fetch(new URL('/api/send-email', request.url).toString(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: body.customer_email,
            orderId: order.id,
            pickupAddress: body.pickup_address,
            deliveryAddress: body.delivery_address,
            type: 'order_confirmed'
          })
        })
      } catch (e) {
        console.error('Customer email error:', e)
      }
    }

    // Pošli email príjemcovi s PIN kódom
    if (body.recipient_email) {
      try {
        await fetch(new URL('/api/send-email', request.url).toString(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: body.recipient_email,
            orderId: order.id,
            deliveryAddress: body.delivery_address,
            recipientName: `${body.recipient_name || ''} ${body.recipient_surname || ''}`.trim(),
            senderName: body.customer_name,
            deliveryPin: deliveryPin,
            type: 'recipient_notification'
          })
        })
      } catch (e) {
        console.error('Recipient email error:', e)
      }
    }

    // Posli SMS zakaznikovi
    if (body.customer_phone) {
      try {
        const trackingUrl = `https://voru.sk/sledovat/${order.id}`
        await fetch(new URL('/api/send-sms', request.url).toString(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: body.customer_phone,
            message: `voru: Objednavka prijata! Kurier bude priradeny. Sledujte: ${trackingUrl}`,
            order_id: order.id,
            type: 'confirmed'
          })
        })
      } catch (e) {
        console.error('Customer SMS error:', e)
      }
    }

    // Posli SMS prijemcovi s PIN
    if (body.recipient_phone) {
      try {
        const trackingUrl = `https://voru.sk/sledovat/${order.id}`
        await fetch(new URL('/api/send-sms', request.url).toString(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: body.recipient_phone,
            message: `voru: Mate zasielku na ceste! PIN: ${deliveryPin}. Sledujte: ${trackingUrl}`,
            order_id: order.id,
            type: 'delivery'
          })
        })
      } catch (e) {
        console.error('Recipient SMS error:', e)
      }
    }

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error('Order error:', error)
    return NextResponse.json({ error: 'Nepodarilo sa vytvorit objednavku' }, { status: 500 })
  }
}

export async function GET() {
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
  return NextResponse.json({ orders: orders || [] })
}
