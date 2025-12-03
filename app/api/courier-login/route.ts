import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ courier: null, message: 'missing_fields' })
    }

    const { data: courier, error } = await (supabase.from('couriers') as any)
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (error || !courier) {
      console.log('Courier not found:', email)
      return NextResponse.json({ courier: null, message: 'not_found' })
    }

    // Check password
    if (!courier.password_hash) {
      console.log('No password hash for courier:', email)
      return NextResponse.json({ courier: null, message: 'no_password' })
    }

    const validPassword = await bcrypt.compare(password, courier.password_hash)
    if (!validPassword) {
      console.log('Wrong password for:', email)
      return NextResponse.json({ courier: null, message: 'wrong_password' })
    }

    // Check status
    if (courier.status === 'pending') {
      return NextResponse.json({ courier: null, message: 'pending_approval' })
    }

    if (courier.status === 'rejected') {
      return NextResponse.json({ courier: null, message: 'rejected' })
    }

    console.log('Login successful:', email)
    return NextResponse.json({ courier })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
