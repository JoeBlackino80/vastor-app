import { NextRequest, NextResponse } from 'next/server'
import { courierSchema } from '@/lib/validations'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validace
    const validatedData = courierSchema.safeParse(body)
    
    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.errors[0].message },
        { status: 400 }
      )
    }

    // Kontrola duplicitního emailu
    const { data: existing } = await supabase
      .from('couriers')
      .select('id')
      .eq('email', validatedData.data.email)
      .single()
    
    if (existing) {
      return NextResponse.json(
        { error: 'Email je již registrován' },
        { status: 400 }
      )
    }

    // Vytvoření kurýra v Supabase
    const { data: courier, error } = await supabase
      .from('couriers')
      .insert({
        first_name: validatedData.data.first_name,
        last_name: validatedData.data.last_name,
        email: validatedData.data.email,
        phone: validatedData.data.phone,
        vehicle_type: validatedData.data.vehicle_type,
        status: 'pending',
        rating: 5.00,
        total_deliveries: 0,
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Email je již registrován' },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: 'Nepodařilo se dokončit registraci' },
        { status: 500 }
      )
    }

    console.log('New courier registered:', courier)

    return NextResponse.json({ 
      success: true, 
      courier,
      message: 'Registrace byla úspěšná'
    })
  } catch (error) {
    console.error('Courier registration error:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se dokončit registraci' },
      { status: 500 }
    )
  }
}

export async function GET() {
  const { data: couriers, error } = await supabase
    .from('couriers')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ couriers: [] })
  }

  return NextResponse.json({ couriers })
}
