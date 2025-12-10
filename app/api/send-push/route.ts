import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json({ error: 'Push notifications not configured' }, { status: 501 })
}
