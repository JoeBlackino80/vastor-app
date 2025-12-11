import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { email, password, step } = await request.json()
    
    console.log('Admin login attempt:', email, step)
    
    // Get admin from database
    const { data: admin, error } = await (supabase.from('admins') as any)
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single()
    
    console.log('DB result:', { admin: !!admin, error })
    
    if (error || !admin) {
      return NextResponse.json({ error: 'Nesprávne údaje', debug: { error, hasAdmin: !!admin } }, { status: 401 })
    }
    
    // Verify password
    const validPassword = await bcrypt.compare(password, admin.password_hash)
    console.log('Password valid:', validPassword)
    
    if (!validPassword) {
      return NextResponse.json({ error: 'Nesprávne heslo' }, { status: 401 })
    }
    
    if (step === 'password') {
      return NextResponse.json({ 
        success: true, 
        phone: admin.phone 
      })
    }
    
    if (step === 'complete') {
      const { password_hash: _, ...safeAdmin } = admin
      return NextResponse.json({ 
        success: true, 
        admin: safeAdmin 
      })
    }
    
    return NextResponse.json({ error: 'Neznáma akcia' }, { status: 400 })
  } catch (error: any) {
    console.log('Admin login error:', error)
    return NextResponse.json({ error: 'Chyba servera', debug: error.message }, { status: 500 })
  }
}
