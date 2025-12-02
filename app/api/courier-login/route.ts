import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 })
    }

    const { data: courier, error } = await (supabase.from('couriers') as any)
      .select('*')
      .eq('email', email)
      .single()

    if (error || !courier) {
      return NextResponse.json({ courier: null, message: 'not_found' })
    }

    // Check password
    const validPassword = await bcrypt.compare(password, courier.password_hash || '')
    if (!validPassword) {
      return NextResponse.json({ courier: null, message: 'wrong_password' })
    }

    // Check if approved
    if (courier.status === 'pending') {
      return NextResponse.json({ courier: null, message: 'pending_approval' })
    }

    if (courier.status === 'rejected') {
      return NextResponse.json({ courier: null, message: 'rejected' })
    }

    return NextResponse.json({ courier })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
