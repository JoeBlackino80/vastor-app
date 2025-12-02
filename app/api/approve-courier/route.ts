import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { courier_id, action } = await request.json()

    if (!courier_id || !action) {
      return NextResponse.json({ error: 'Missing courier_id or action' }, { status: 400 })
    }

    const newStatus = action === 'approve' ? 'available' : 'rejected'

    const { error } = await (supabase.from('couriers') as any)
      .update({ status: newStatus })
      .eq('id', courier_id)

    if (error) {
      console.error('Approve courier error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`Courier ${courier_id} ${action}d`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Approve courier error:', error)
    return NextResponse.json({ error: 'Failed to approve courier' }, { status: 500 })
  }
}
