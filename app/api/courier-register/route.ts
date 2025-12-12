import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const phone = body.phone?.trim()

    if (!phone) {
      return NextResponse.json({ success: false, error: 'Telefón je povinný' }, { status: 400 })
    }

    const { data: existingPhone } = await (supabase.from('couriers') as any)
      .select('id').eq('phone', phone).single()
    if (existingPhone) {
      return NextResponse.json({ success: false, error: 'Telefón už existuje' }, { status: 400 })
    }

    const courierData: any = {
      phone,
      first_name: body.first_name,
      last_name: body.last_name,
      birth_date: body.birth_date || null,
      nationality: body.nationality || 'SK',
      id_number: body.id_number || null,
      street: body.street,
      city: body.city,
      postal_code: body.postal_code,
      vehicle_type: body.vehicle_type || 'bike',
      drivers_license: body.drivers_license || null,
      license_group: body.license_group || null,
      vehicle_plate: body.vehicle_plate || null,
      iban: body.iban,
      bank_name: body.bank_name || null,
      terms_accepted: body.terms_accepted || false,
      gdpr_accepted: body.gdpr_accepted || false,
      id_document_front_url: body.id_document_front_url || null,
      id_document_back_url: body.id_document_back_url || null,
      selfie_url: body.selfie_url || null,
      documents_verified: false,
      status: 'pending',
      rating: 5.00,
      total_deliveries: 0
    }

    const { data: courier, error } = await (supabase.from('couriers') as any)
      .insert(courierData).select().single()

    if (error) {
      console.error('Courier registration error:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, courier })
  } catch (error) {
    console.error('Courier registration error:', error)
    return NextResponse.json({ success: false, error: 'Registrácia zlyhala' }, { status: 500 })
  }
}
