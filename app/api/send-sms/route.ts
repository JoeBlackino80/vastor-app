import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { phone, message, order_id, type } = await request.json()
    
    console.log('SMS API called:', { phone, message: message?.substring(0, 50), order_id, type })

    if (!phone || !message) {
      console.log('SMS API error: Phone or message missing')
      return NextResponse.json({ error: 'Phone and message required' }, { status: 400 })
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const senderId = process.env.TWILIO_SENDER_ID || 'VORU'

    console.log('Twilio config:', { 
      hasAccountSid: !!accountSid, 
      hasAuthToken: !!authToken, 
      senderId 
    })

    if (accountSid && authToken) {
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
      
      console.log('Sending SMS to:', phone, 'from:', senderId)
      
      const response = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(accountSid + ':' + authToken).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          To: phone,
          From: senderId,
          Body: message
        })
      })

      const responseData = await response.json()
      
      if (!response.ok) {
        console.error('Twilio error:', responseData)
      } else {
        console.log('SMS sent successfully:', responseData.sid)
      }
    } else {
      console.log('Twilio not configured, skipping SMS')
    }

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
    console.error('SMS API error:', error)
    return NextResponse.json({ error: 'SMS failed' }, { status: 500 })
  }
}
