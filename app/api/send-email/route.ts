import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

type EmailType = "order_confirmed" | "pickup" | "delivered" | "recipient_notification" | "recipient_on_way"

export async function POST(request: Request) {
  try {
    const { to, orderId, pickupAddress, deliveryAddress, type = "order_confirmed", courierName, recipientName, senderName, deliveryPin } = await request.json()
    const trackingUrl = `https://vastor-app.vercel.app/sledovat/${orderId}`
    let subject = ""
    let content = ""

    switch (type as EmailType) {
      case "order_confirmed":
        subject = "Vaša objednávka bola prijatá - voru"
        content = `<h2>Ďakujeme za vašu objednávku!</h2><p>Kuriér bude priradený čo najskôr.</p><div style="background:#fff;padding:20px;border-radius:10px;margin:20px 0;"><p><strong>Vyzdvihnutie:</strong> ${pickupAddress}</p><p><strong>Doručenie:</strong> ${deliveryAddress}</p></div><a href="${trackingUrl}" style="display:inline-block;background:#000;color:#fff;padding:15px 30px;text-decoration:none;border-radius:10px;font-weight:bold;">Sledovať kuriéra</a>`
        break
      case "pickup":
        subject = "Kuriér vyzdvihol vašu zásielku - voru"
        content = `<h2>Zásielka vyzdvihnutá! 📦</h2><p>Kuriér <strong>${courierName || "voru"}</strong> je na ceste.</p><a href="${trackingUrl}" style="display:inline-block;background:#000;color:#fff;padding:15px 30px;text-decoration:none;border-radius:10px;">Sledovať</a>`
        break
      case "delivered":
        subject = "Zásielka doručená - voru"
        content = `<h2>Zásielka doručená! ✅</h2><p>Doručené na: <strong>${deliveryAddress}</strong></p>`
        break
      case "recipient_notification":
        subject = "Máte zásielku na ceste - voru"
        content = `<h2>Dobrý deň${recipientName ? ", " + recipientName : ""}!</h2><p><strong>${senderName || "Odosielateľ"}</strong> vám posiela zásielku.</p><div style="background:#fff;padding:20px;border-radius:10px;margin:20px 0;"><p><strong>Doručenie na:</strong> ${deliveryAddress}</p></div>${deliveryPin ? "<div style=\"background:#000;color:#fff;padding:25px;border-radius:10px;margin:20px 0;text-align:center;\"><p style=\"margin:0 0 10px 0;\">Váš PIN kód:</p><p style=\"margin:0;font-size:36px;font-weight:bold;letter-spacing:8px;\">" + deliveryPin + "</p><p style=\"margin:15px 0 0 0;font-size:12px;\">Povedzte kurierovi pri prevzatí</p></div>" : ""}<a href="${trackingUrl}" style="display:inline-block;background:#000;color:#fff;padding:15px 30px;text-decoration:none;border-radius:10px;">Sledovať</a>`
        break
      case "recipient_on_way":
        subject = "Kuriér je na ceste - voru"
        content = `<h2>Kuriér je na ceste! 🚗</h2>${deliveryPin ? "<div style=\"background:#000;color:#fff;padding:25px;border-radius:10px;text-align:center;\"><p>PIN: <strong style=\"font-size:36px;letter-spacing:8px;\">" + deliveryPin + "</strong></p></div>" : ""}<a href="${trackingUrl}" style="display:inline-block;background:#000;color:#fff;padding:15px 30px;text-decoration:none;border-radius:10px;">Sledovať</a>`
        break
    }

    const { data, error } = await resend.emails.send({
      from: "voru <onboarding@resend.dev>",
      to: [to],
      subject,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><div style="background:#000;color:#fff;padding:20px;text-align:center;"><h1 style="margin:0;">voru</h1></div><div style="padding:30px;background:#f9f9f9;">${content}<p style="margin-top:30px;color:#666;font-size:12px;">Objednávka: ${orderId}</p></div></div>`
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
