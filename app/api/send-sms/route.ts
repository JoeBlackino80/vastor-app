import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Pre SMS môžeš použiť Twilio, MessageBird, alebo slovenský GoSMS
// Toto je príklad s fetch na SMS API

export async function POST(request: Request) {
  try {
    const { phone, message, order_id, type } = await request.json()

    // Tu integruješ SMS provider (Twilio, GoSMS, atď.)
    // Príklad s GoSMS.sk:
    /*
    const response = await fetch('https://app.gosms.sk/api/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GOSMS_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: message,
        recipients: phone,
        channel: 'sms'
      })
    })
    */

    // Mark SMS as sent in order
    const updateField = type === 'pickup' ? 'sms_sent_pickup' : 'sms_sent_delivery'
    await (supabase.from('orders') as any)
      .update({ [updateField]: true })
      .eq('id', order_id)

    console.log(`SMS sent to ${phone}: ${message}`)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('SMS error:', error)
    return NextResponse.json({ error: 'SMS failed' }, { status: 500 })
  }
}
