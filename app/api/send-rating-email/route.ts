import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { to, orderId, customerName } = await request.json()

    const ratingUrl = `https://vastor-app.vercel.app/hodnotenie/${orderId}`

    const { data, error } = await resend.emails.send({
      from: 'VASTOR <onboarding@resend.dev>',
      to: [to],
      subject: 'Ohodnoťte nášho kuriéra - VASTOR',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #000; color: #fff; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">VASTOR</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2>Dobrý deň${customerName ? `, ${customerName}` : ''}!</h2>
            <p>Vaša zásielka bola úspešne doručená. 🎉</p>
            <p>Boli by sme radi, keby ste ohodnotili nášho kuriéra. Vaše hodnotenie nám pomáha zlepšovať naše služby.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${ratingUrl}" style="display: inline-block; background: #000; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: bold;">
                ⭐ Ohodnotiť kuriéra
              </a>
            </div>
            
            <p style="color: #666; font-size: 12px;">Ďakujeme, že používate VASTOR!</p>
          </div>
        </div>
      `
    })

    if (error) {
      console.error('Email error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Send rating email error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
