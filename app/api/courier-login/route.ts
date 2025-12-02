import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')

  if (!email) {
    return NextResponse.json({ error: 'Missing email' }, { status: 400 })
  }

  const { data: courier, error } = await (supabase.from('couriers') as any)
    .select('*')
    .eq('email', email)
    .single()

  if (error || !courier) {
    return NextResponse.json({ courier: null })
  }

  return NextResponse.json({ courier })
}
