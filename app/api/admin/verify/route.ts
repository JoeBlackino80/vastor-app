import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const JWT_SECRET = process.env.JWT_SECRET || 'voru-admin-secret-key-2024'

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json({ error: 'Email a kód sú povinné' }, { status: 400 })
    }

    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()

    if (error || !admin) {
      return NextResponse.json({ error: 'Admin nenájdený' }, { status: 401 })
    }

    if (admin.login_code !== code) {
      return NextResponse.json({ error: 'Nesprávny kód' }, { status: 401 })
    }

    if (new Date(admin.login_code_expires) < new Date()) {
      return NextResponse.json({ error: 'Kód vypršal' }, { status: 401 })
    }

    await supabase
      .from('admins')
      .update({ login_code: null, login_code_expires: null, last_login: new Date().toISOString() })
      .eq('id', admin.id)

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    return NextResponse.json({
      success: true,
      token,
      admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role }
    })
  } catch (err) {
    console.error('Admin verify error:', err)
    return NextResponse.json({ error: 'Chyba servera' }, { status: 500 })
  }
}
