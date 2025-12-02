import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { order_id, rating, comment } = await request.json()

    if (!order_id || !rating) {
      return NextResponse.json({ error: 'Missing order_id or rating' }, { status: 400 })
    }

    // Get order to find courier
    const { data: order, error: orderError } = await (supabase.from('orders') as any)
      .select('courier_id')
      .eq('id', order_id)
      .single()

    if (orderError || !order?.courier_id) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Check if already rated
    const { data: existing } = await (supabase.from('ratings') as any)
      .select('id')
      .eq('order_id', order_id)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Already rated' }, { status: 400 })
    }

    // Insert rating
    const { error: ratingError } = await (supabase.from('ratings') as any)
      .insert({
        order_id,
        courier_id: order.courier_id,
        rating,
        comment: comment || null
      })

    if (ratingError) {
      console.error('Rating error:', ratingError)
      return NextResponse.json({ error: ratingError.message }, { status: 500 })
    }

    // Update courier average rating
    const { data: ratings } = await (supabase.from('ratings') as any)
      .select('rating')
      .eq('courier_id', order.courier_id)

    if (ratings && ratings.length > 0) {
      const avgRating = ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length
      await (supabase.from('couriers') as any)
        .update({ rating: Math.round(avgRating * 100) / 100 })
        .eq('id', order.courier_id)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Rate courier error:', error)
    return NextResponse.json({ error: 'Failed to rate' }, { status: 500 })
  }
}
