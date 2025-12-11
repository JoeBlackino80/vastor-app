import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { email, password, step } = await request.json()
    
    // Get admin from database
    const { data: admin, error } = await (supabase.from('admins') as any)
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single()
    
    if (error || !admin) {
      return NextResponse.json({ error: 'Nesprávne údaje' }, { status: 401 })
    }
    
    // Verify password
    const validPassword = await bcrypt.compare(password, admin.password_hash)
    if (!validPassword) {
      return NextResponse.json({ error: 'Nesprávne heslo' }, { status: 401 })
    }
    
    if (step === 'password') {
      // First step - return phone for SMS
      return NextResponse.json({ 
        success: true, 
        phone: admin.phone 
      })
    }
    
    if (step === 'complete') {
      // Final step - return admin data
      const { password_hash: _, ...safeAdmin } = admin
      return NextResponse.json({ 
        success: true, 
        admin: safeAdmin 
      })
    }
    
    return NextResponse.json({ error: 'Neznáma akcia' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Chyba servera' }, { status: 500 })
  }
}
