import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    
    // Check if customer exists
    const { data: customer } = await (supabase.from('customers') as any)
      .select('id, email')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (!customer) {
      // Don't reveal if email exists
      return NextResponse.json({ success: true })
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex')
    const expires_at = new Date(Date.now() + 3600000).toISOString() // 1 hour

    // Save to database
    await (supabase.from('password_resets') as any).insert({
      email: customer.email,
      token,
      expires_at
    })

    // Send email
    const resetUrl = `https://vastor-app.vercel.app/reset-hesla/${token}`
    
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://vastor-app.vercel.app'}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: customer.email,
        subject: 'Reset hesla - voru',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #000; color: #fff; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">voru</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
              <h2>Reset hesla</h2>
              <p>Kliknite na tlačidlo nižšie pre nastavenie nového hesla:</p>
              <a href="${resetUrl}" style="display: inline-block; background: #000; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; margin: 20px 0;">
                Resetovať heslo
              </a>
              <p style="color: #666; font-size: 12px;">Odkaz je platný 1 hodinu.</p>
            </div>
          </div>
        `
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Nepodarilo sa odoslať email' }, { status: 500 })
  }
}
