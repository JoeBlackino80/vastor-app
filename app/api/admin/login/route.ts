import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const RESEND_API_KEY = process.env.RESEND_API_KEY

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email a heslo sú povinné' }, { status: 400 })
    }

    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()

    if (error || !admin) {
      return NextResponse.json({ error: 'Nesprávne prihlasovacie údaje' }, { status: 401 })
    }

    if (admin.is_active === false) {
      return NextResponse.json({ error: 'Účet je deaktivovaný' }, { status: 401 })
    }

    const validPassword = await bcrypt.compare(password, admin.password_hash)
    if (!validPassword) {
      return NextResponse.json({ error: 'Nesprávne prihlasovacie údaje' }, { status: 401 })
    }

    const code = generateCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    await supabase
      .from('admins')
      .update({ login_code: code, login_code_expires: expiresAt.toISOString() })
      .eq('id', admin.id)

    if (RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + RESEND_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'VORU <noreply@voru.sk>',
          to: email,
          subject: 'Prihlasovací kód - VORU Admin',
          html: '<div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:20px;"><h2 style="color:#f59e0b;">VORU Admin</h2><p>Váš prihlasovací kód:</p><div style="background:#fef3c7;padding:20px;border-radius:10px;text-align:center;margin:20px 0;"><span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#d97706;">' + code + '</span></div><p style="color:#666;font-size:14px;">Kód platí 10 minút.</p></div>'
        })
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Admin login error:', err)
    return NextResponse.json({ error: 'Chyba servera' }, { status: 500 })
  }
}
