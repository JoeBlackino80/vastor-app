import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const courier_id = searchParams.get('courier_id')
  const monthStr = searchParams.get('month')

  if (!courier_id) {
    return NextResponse.json({ error: 'Missing courier_id' }, { status: 400 })
  }

  const month = monthStr ? new Date(monthStr) : new Date()
  const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1)
  const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59)

  // Get orders for selected month
  const { data: orders, error } = await (supabase.from('orders') as any)
    .select('*')
    .eq('courier_id', courier_id)
    .eq('status', 'delivered')
    .gte('created_at', startOfMonth.toISOString())
    .lte('created_at', endOfMonth.toISOString())
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json({ orders: [], stats: {} })
  }

  // Calculate stats
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  const { data: allOrders } = await (supabase.from('orders') as any)
    .select('*')
    .eq('courier_id', courier_id)
    .eq('status', 'delivered')

  const { data: ratings } = await (supabase.from('ratings') as any)
    .select('rating')
    .eq('courier_id', courier_id)

  const totalEarnings = (allOrders || []).reduce((sum: number, o: any) => sum + (o.courier_earnings || o.price * 0.7), 0)
  const thisMonthEarnings = (orders || []).reduce((sum: number, o: any) => sum + (o.courier_earnings || o.price * 0.7), 0)
  const thisWeekEarnings = (allOrders || [])
    .filter((o: any) => new Date(o.created_at) >= startOfWeek)
    .reduce((sum: number, o: any) => sum + (o.courier_earnings || o.price * 0.7), 0)

  const avgRating = ratings && ratings.length > 0 
    ? ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length 
    : 5

  return NextResponse.json({
    orders: orders || [],
    stats: {
      totalEarnings,
      thisMonthEarnings,
      thisWeekEarnings,
      totalDeliveries: (allOrders || []).length,
      averageRating: avgRating
    }
  })
}
