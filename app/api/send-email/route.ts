import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

type EmailType = 'order_confirmed' | 'pickup' | 'delivered'

export async function POST(request: Request) {
  try {
    const { to, orderId, pickupAddress, deliveryAddress, type = 'order_confirmed', courierName } = await request.json()

    const trackingUrl = `https://vastor-app.vercel.app/sledovat/${orderId}`

    let subject = ''
    let content = ''

    switch (type as EmailType) {
      case 'order_confirmed':
        subject = 'Vaša objednávka bola prijatá - VASTOR'
        content = `
          <h2>Ďakujeme za vašu objednávku!</h2>
          <p>Vaša objednávka bola úspešne prijatá a kuriér bude priradený čo najskôr.</p>
          <div style="background: #fff; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p><strong>Vyzdvihnutie:</strong> ${pickupAddress}</p>
            <p><strong>Doručenie:</strong> ${deliveryAddress}</p>
          </div>
          <p>Sledujte polohu kuriéra v reálnom čase:</p>
          <a href="${trackingUrl}" style="display: inline-block; background: #000; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: bold;">
            Sledovať kuriéra
          </a>
        `
        break

      case 'pickup':
        subject = 'Kuriér vyzdvihol vašu zásielku - VASTOR'
        content = `
          <h2>Zásielka bola vyzdvihnutá! 📦</h2>
          <p>Kuriér <strong>${courierName || 'VASTOR'}</strong> vyzdvihol vašu zásielku a je na ceste k doručeniu.</p>
          <div style="background: #fff; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p><strong>Doručenie na:</strong> ${deliveryAddress}</p>
          </div>
          <p>Sledujte polohu kuriéra v reálnom čase:</p>
          <a href="${trackingUrl}" style="display: inline-block; background: #000; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: bold;">
            Sledovať kuriéra
          </a>
        `
        break

      case 'delivered':
        subject = 'Vaša zásielka bola doručená - VASTOR'
        content = `
          <h2>Zásielka doručená! ✅</h2>
          <p>Vaša zásielka bola úspešne doručená na adresu:</p>
          <div style="background: #fff; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p><strong>${deliveryAddress}</strong></p>
          </div>
          <p>Ďakujeme, že ste využili služby VASTOR!</p>
          <p style="margin-top: 20px;">
            <a href="https://vastor-app.vercel.app/objednavka" style="display: inline-block; background: #000; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: bold;">
              Objednať znova
            </a>
          </p>
        `
        break
    }

    const { data, error } = await resend.emails.send({
      from: 'VASTOR <onboarding@resend.dev>',
      to: [to],
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #000; color: #fff; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">VASTOR</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            ${content}
            <p style="margin-top: 30px; color: #666; font-size: 12px;">Číslo objednávky: ${orderId}</p>
          </div>
          <div style="padding: 20px; text-align: center; color: #999; font-size: 12px;">
            © 2024 VASTOR - Kuriérske služby
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
