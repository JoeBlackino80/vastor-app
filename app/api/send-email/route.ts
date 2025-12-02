import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { to, orderId, pickupAddress, deliveryAddress } = await request.json()

    const trackingUrl = `https://vastor-app.vercel.app/sledovat/${orderId}`

    const { data, error } = await resend.emails.send({
      from: 'VASTOR <onboarding@resend.dev>',
      to: [to],
      subject: 'Vase objednavka bola prijata - VASTOR',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #000; color: #fff; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">VASTOR</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2>Dakujeme za vasu objednavku!</h2>
            <p>Vasa objednavka bola uspesne prijata a kurier bude priradeny co najskor.</p>
            <div style="background: #fff; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <p><strong>Vyzdvihnutie:</strong> ${pickupAddress}</p>
              <p><strong>Dorucenie:</strong> ${deliveryAddress}</p>
            </div>
            <p>Sledujte polohu kuriera v realnom case:</p>
            <a href="${trackingUrl}" style="display: inline-block; background: #000; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: bold;">
              Sledovat kuriera
            </a>
            <p style="margin-top: 30px; color: #666; font-size: 12px;">Cislo objednavky: ${orderId}</p>
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
    console.error('Send email error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
