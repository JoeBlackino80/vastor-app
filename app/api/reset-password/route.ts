import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()

    // Find valid token
    const { data: resetRecord } = await (supabase.from('password_resets') as any)
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (!resetRecord) {
      return NextResponse.json({ error: 'Neplatný alebo expirovaný odkaz' }, { status: 400 })
    }

    // Hash new password
    const password_hash = await bcrypt.hash(password, 10)

    // Update customer password
    const { error: updateError } = await (supabase.from('customers') as any)
      .update({ password_hash })
      .eq('email', resetRecord.email)

    if (updateError) {
      return NextResponse.json({ error: 'Nepodarilo sa zmeniť heslo' }, { status: 500 })
    }

    // Mark token as used
    await (supabase.from('password_resets') as any)
      .update({ used: true })
      .eq('id', resetRecord.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Zmena hesla zlyhala' }, { status: 500 })
  }
}
