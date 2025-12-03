import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    const { data: courier, error } = await (supabase.from('couriers') as any)
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (error || !courier) {
      return NextResponse.json({ courier: null, message: 'not_found' })
    }

    if (!courier.password_hash) {
      return NextResponse.json({ courier: null, message: 'no_password' })
    }

    const validPassword = await bcrypt.compare(password, courier.password_hash)
    if (!validPassword) {
      return NextResponse.json({ courier: null, message: 'wrong_password' })
    }

    if (courier.status === 'pending') {
      return NextResponse.json({ courier: null, message: 'pending_approval' })
    }

    return NextResponse.json({ courier })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
