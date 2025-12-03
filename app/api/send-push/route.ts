import { NextResponse } from 'next/server'
import webpush from 'web-push'
import { supabase } from '@/lib/supabase'

webpush.setVapidDetails('mailto:info@vastor.sk', process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '', process.env.VAPID_PRIVATE_KEY || '')

export async function POST(request: Request) {
  try {
    const { courier_id, title, body } = await request.json()
    const { data: courier } = await (supabase.from('couriers') as any).select('push_subscription').eq('id', courier_id).single()
    if (!courier?.push_subscription) return NextResponse.json({ error: 'No subscription' }, { status: 404 })
    await webpush.sendNotification(courier.push_subscription, JSON.stringify({ title, body }))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Push error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
