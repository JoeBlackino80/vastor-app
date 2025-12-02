import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { courier_id, subscription } = await request.json()
    if (!courier_id || !subscription) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 })
    }
    const { error } = await (supabase.from('couriers') as any)
      .update({ push_subscription: subscription })
      .eq('id', courier_id)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
