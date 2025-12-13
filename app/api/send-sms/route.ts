import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { phone, message, order_id, type } = await request.json()

    if (!phone || !message) {
      return NextResponse.json({ error: 'Phone and message required' }, { status: 400 })
    }

    // Použij Twilio pre SMS
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const senderId = process.env.TWILIO_SENDER_ID

    if (accountSid && authToken && senderId) {
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
      
      const response = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          To: phone,
          From: senderId,
          Body: message
        })
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('Twilio error:', error)
        // Don't fail the request, just log
      }
    } else {
      // Fallback - just log
      console.log(`SMS to ${phone}: ${message}`)
    }

    // Mark SMS as sent in order if order_id provided
    if (order_id && type) {
      const updateField = type === 'pickup' ? 'sms_sent_pickup' : 
                          type === 'delivery' ? 'sms_sent_delivery' :
                          type === 'confirmed' ? 'sms_sent_confirmed' : null
      
      if (updateField) {
        await supabase
          .from('orders')
          .update({ [updateField]: true })
          .eq('id', order_id)
      }
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('SMS error:', error)
    return NextResponse.json({ error: 'SMS failed' }, { status: 500 })
  }
}
