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

    // Find courier by phone
    const { data: courier, error } = await supabase
      .from('couriers')
      .select('*')
      .eq('phone', phone)
      .single()

    if (error || !courier) {
      return NextResponse.json({ error: 'Účet nenájdený' }, { status: 404 })
    }

    // Check if approved
    if (courier.status !== 'approved') {
      return NextResponse.json({ error: 'Váš účet ešte nebol schválený' }, { status: 403 })
    }

    // Don't send sensitive data
    const { pin, ...safeCourier } = courier

    return NextResponse.json({ courier: safeCourier })
  } catch (err) {
    console.error('Courier login error:', err)
    return NextResponse.json({ error: 'Chyba servera' }, { status: 500 })
  }
}
