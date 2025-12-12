import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, phone, ...updateData } = body

    // Use id if available, otherwise use phone
    let query = supabase.from('customers').update(updateData)
    
    if (id && id !== 'undefined') {
      query = query.eq('id', id)
    } else if (phone) {
      query = query.eq('phone', phone)
    } else {
      return NextResponse.json({ error: 'ID alebo telefón je povinný' }, { status: 400 })
    }

    const { error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Aktualizácia zlyhala' }, { status: 500 })
  }
}
