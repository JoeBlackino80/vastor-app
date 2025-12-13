import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const DEV_PHONES = ['+421909188881']

export async function POST(request: Request) {
  try {
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json({ error: 'Telefónne číslo je povinné' }, { status: 400 })
    }

    // Dev mód
    if (DEV_PHONES.includes(phone)) {
      console.log(`DEV MODE: OTP for ${phone} is 000000`)
      return NextResponse.json({ success: true, dev: true })
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    // Ulož do databázy
    await supabase.from('otp_codes').upsert({
      phone,
      code,
      expires_at: expires
    }, { onConflict: 'phone' })

    // Pošli SMS
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const senderId = process.env.TWILIO_SENDER_ID

    if (!accountSid || !authToken || !senderId) {
      console.error('Twilio credentials missing')
      return NextResponse.json({ error: 'SMS služba nie je nakonfigurovaná' }, { status: 500 })
    }

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(accountSid + ':' + authToken).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        To: phone,
        From: senderId,
        Body: `VORU: Vas prihlasovaci kod je ${code}`
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Twilio error:', error)
      return NextResponse.json({ error: 'Nepodarilo sa odoslat SMS' }, { status: 500 })
    }

    console.log(`OTP sent to ${phone}`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json({ error: 'Chyba servera' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { phone, code } = await request.json()

    if (!phone || !code) {
      return NextResponse.json({ error: 'Telefón a kód sú povinné' }, { status: 400 })
    }

    // Dev mód
    if (DEV_PHONES.includes(phone) && code === '000000') {
      return NextResponse.json({ success: true, verified: true })
    }

    // Načítaj z databázy
    const { data, error } = await supabase
      .from('otp_codes')
      .select('code, expires_at')
      .eq('phone', phone)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Kód nebol nájdený' }, { status: 400 })
    }

    if (new Date() > new Date(data.expires_at)) {
      await supabase.from('otp_codes').delete().eq('phone', phone)
      return NextResponse.json({ error: 'Kód vypršal' }, { status: 400 })
    }

    if (data.code !== code) {
      return NextResponse.json({ error: 'Nesprávny kód' }, { status: 400 })
    }

    // Vymaž použitý kód
    await supabase.from('otp_codes').delete().eq('phone', phone)

    return NextResponse.json({ success: true, verified: true })
  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json({ error: 'Chyba servera' }, { status: 500 })
  }
}
