import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { action, email, pin, type = 'customer' } = await request.json()
    
    const table = type === 'courier' ? 'couriers' : 'customers'
    
    if (action === 'set') {
      // Set new PIN
      const pin_hash = await bcrypt.hash(pin, 10)
      
      const { error } = await (supabase.from(table) as any)
        .update({ pin_hash })
        .eq('email', email.toLowerCase().trim())
      
      if (error) throw error
      
      return NextResponse.json({ success: true })
    }
    
    if (action === 'verify') {
      // Verify PIN
      const { data: user, error } = await (supabase.from(table) as any)
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .single()
      
      if (error || !user) {
        return NextResponse.json({ error: 'Účet neexistuje' }, { status: 401 })
      }
      
      if (!user.pin_hash) {
        return NextResponse.json({ error: 'PIN nie je nastavený', needsPin: true }, { status: 401 })
      }
      
      const validPin = await bcrypt.compare(pin, user.pin_hash)
      
      if (!validPin) {
        return NextResponse.json({ error: 'Nesprávny PIN' }, { status: 401 })
      }
      
      const { password_hash: _, pin_hash: __, ...safeUser } = user
      
      return NextResponse.json({ success: true, user: safeUser })
    }
    
    if (action === 'check') {
      // Check if user has PIN set
      const { data: user, error } = await (supabase.from(table) as any)
        .select('id, email, pin_hash, phone')
        .eq('email', email.toLowerCase().trim())
        .single()
      
      if (error || !user) {
        return NextResponse.json({ exists: false })
      }
      
      return NextResponse.json({ 
        exists: true, 
        hasPin: !!user.pin_hash,
        phone: user.phone,
        id: user.id
      })
    }
    
    return NextResponse.json({ error: 'Neznáma akcia' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Chyba servera' }, { status: 500 })
  }
}
