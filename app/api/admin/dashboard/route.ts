import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayISO = today.toISOString()

    // Today's orders
    const { count: todayOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayISO)

    // Today's revenue
    const { data: todayOrdersData } = await supabase
      .from('orders')
      .select('price')
      .gte('created_at', todayISO)
    const todayRevenue = todayOrdersData?.reduce((sum, o) => sum + (o.price || 0), 0) || 0

    // Online couriers
    const { count: onlineCouriers } = await supabase
      .from('couriers')
      .select('*', { count: 'exact', head: true })
      .eq('is_online', true)

    // Pending orders
    const { count: pendingOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'looking_for_courier')

    // Recent orders
    const { data: recentOrders } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    // Pending couriers
    const { data: pendingCouriers } = await supabase
      .from('couriers')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(10)

    return NextResponse.json({
      stats: {
        todayOrders: todayOrders || 0,
        todayRevenue: Math.round(todayRevenue * 100) / 100,
        onlineCouriers: onlineCouriers || 0,
        pendingOrders: pendingOrders || 0
      },
      recentOrders: recentOrders || [],
      pendingCouriers: pendingCouriers || []
    })
  } catch (err) {
    console.error('Dashboard API error:', err)
    return NextResponse.json({ error: 'Chyba servera' }, { status: 500 })
  }
}
