import { NextRequest, NextResponse } from 'next/server'
import { orderSchema } from '@/lib/validations'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validace
    const validatedData = orderSchema.safeParse(body)
    
    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.errors[0].message },
        { status: 400 }
      )
    }

    // Vytvoření objednávky v Supabase
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        customer_name: validatedData.data.customer_name,
        customer_email: validatedData.data.customer_email,
        customer_phone: validatedData.data.customer_phone,
        pickup_address: validatedData.data.pickup_address,
        pickup_notes: validatedData.data.pickup_notes || null,
        delivery_address: validatedData.data.delivery_address,
        delivery_notes: validatedData.data.delivery_notes || null,
        package_type: validatedData.data.package_type,
        service_type: validatedData.data.service_type,
        price: body.price,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Nepodařilo se vytvořit objednávku' },
        { status: 500 }
      )
    }

    console.log('New order created:', order)

    return NextResponse.json({ 
      success: true, 
      order,
      message: 'Objednávka byla úspěšně vytvořena'
    })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se vytvořit objednávku' },
      { status: 500 }
    )
  }
}

export async function GET() {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ orders: [] })
  }

  return NextResponse.json({ orders })
}
