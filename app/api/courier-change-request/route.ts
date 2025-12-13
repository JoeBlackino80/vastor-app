import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { courier_id, courier_phone, courier_name, message } = await req.json()

    const { error } = await supabase
      .from('courier_change_requests')
      .insert({
        courier_id,
        courier_phone,
        courier_name,
        message,
        status: 'pending'
      })

    if (error) {
      console.log('Change request:', { courier_phone, courier_name, message })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Change request error:', err)
    return NextResponse.json({ error: 'Chyba servera' }, { status: 500 })
  }
}
