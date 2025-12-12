import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { phone } = await req.json()

    if (!phone) {
      return NextResponse.json({ error: 'Telefón je povinný' }, { status: 400 })
    }

    // Find customer by phone
    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', phone)
      .single()

    if (error || !customer) {
      return NextResponse.json({ error: 'Účet nenájdený' }, { status: 404 })
    }

    // Don't send sensitive data
    const { pin, ...safeUser } = customer

    return NextResponse.json({ user: safeUser })
  } catch (err) {
    console.error('Customer login error:', err)
    return NextResponse.json({ error: 'Chyba servera' }, { status: 500 })
  }
}
