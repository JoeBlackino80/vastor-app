import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const DEV_PHONES = ['+421909188881']
const DEV_CODE = '000000'

export async function POST(request: Request) {
  try {
    const { phone, code } = await request.json()

    if (!phone || !code) {
      return NextResponse.json({ error: 'Telefón a kód sú povinné' }, { status: 400 })
    }

    // Dev mód
    if (DEV_PHONES.includes(phone) && code === DEV_CODE) {
      return NextResponse.json({ success: true, verified: true })
    }

    // Načítaj z databázy
    const { data, error } = await supabase
      .from('otp_codes')
      .select('code, expires_at')
      .eq('phone', phone)
      .single()

    if (error || !data) {
      console.log('OTP not found for phone:', phone)
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
