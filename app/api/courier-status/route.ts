import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { courier_id, is_online } = await req.json()

    if (!courier_id) {
      return NextResponse.json({ error: 'Courier ID je povinný' }, { status: 400 })
    }

    const { error } = await supabase
      .from('couriers')
      .update({ 
        is_online,
        last_online_at: is_online ? new Date().toISOString() : undefined
      })
      .eq('id', courier_id)

    if (error) {
      console.error('Update error:', error)
      return NextResponse.json({ error: 'Chyba pri aktualizácii' }, { status: 500 })
    }

    return NextResponse.json({ success: true, is_online })
  } catch (err) {
    console.error('Courier status error:', err)
    return NextResponse.json({ error: 'Chyba servera' }, { status: 500 })
  }
}
