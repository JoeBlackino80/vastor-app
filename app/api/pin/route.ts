import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { action, email, phone, pin, type = 'customer' } = await request.json()
    
    const table = type === 'courier' ? 'couriers' : 'customers'
    
    // Use phone if provided, otherwise email
    const identifierField = phone ? 'phone' : 'email'
    const identifierValue = phone ? phone.trim() : email?.toLowerCase().trim()
    
    if (!identifierValue) {
      return NextResponse.json({ error: 'Chýba telefón alebo email' }, { status: 400 })
    }
    
    if (action === 'set') {
      const pin_hash = await bcrypt.hash(pin, 10)
      
      const { error } = await (supabase.from(table) as any)
        .update({ pin_hash })
        .eq(identifierField, identifierValue)
      
      if (error) throw error
      
      return NextResponse.json({ success: true })
    }
    
    if (action === 'verify') {
      const { data: user, error } = await (supabase.from(table) as any)
        .select('*')
        .eq(identifierField, identifierValue)
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
      const { data: user, error } = await (supabase.from(table) as any)
        .select('id, email, pin_hash, phone')
        .eq(identifierField, identifierValue)
        .single()
      
      if (error || !user) {
        return NextResponse.json({ exists: false })
      }
      
      return NextResponse.json({
        exists: true,
        hasPin: !!user.pin_hash,
        phone: user.phone,
        email: user.email,
        id: user.id
      })
    }
    
    return NextResponse.json({ error: 'Neznáma akcia' }, { status: 400 })
  } catch (error) {
    console.error('PIN API error:', error)
    return NextResponse.json({ error: 'Chyba servera' }, { status: 500 })
  }
}
