import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Get all orders
    const { data: orders } = await (supabase.from('orders') as any).select('*')
    
    // Get all couriers
    const { data: couriers } = await (supabase.from('couriers') as any).select('*')
    
    // Get all ratings
    const { data: ratings } = await (supabase.from('ratings') as any).select('*')

    const totalOrders = orders?.length || 0
    const deliveredOrders = orders?.filter((o: any) => o.status === 'delivered').length || 0
    const pendingOrders = orders?.filter((o: any) => o.status === 'pending' || o.status === 'assigned').length || 0
    const totalRevenue = orders?.reduce((sum: number, o: any) => sum + (o.price || 0), 0) || 0

    const todayOrders = orders?.filter((o: any) => new Date(o.created_at) >= startOfDay).length || 0
    const thisWeekOrders = orders?.filter((o: any) => new Date(o.created_at) >= startOfWeek).length || 0
    const thisMonthOrders = orders?.filter((o: any) => new Date(o.created_at) >= startOfMonth).length || 0

    const totalCouriers = couriers?.length || 0
    const activeCouriers = couriers?.filter((c: any) => c.status === 'available' || c.status === 'busy').length || 0

    const avgRating = ratings && ratings.length > 0
      ? ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length
      : 5

    // Top couriers by deliveries
    const courierDeliveries: { [key: string]: { name: string; deliveries: number; rating: number } } = {}
    couriers?.forEach((c: any) => {
      courierDeliveries[c.id] = { name: `${c.first_name} ${c.last_name}`, deliveries: 0, rating: c.rating || 5 }
    })
    orders?.forEach((o: any) => {
      if (o.courier_id && o.status === 'delivered' && courierDeliveries[o.courier_id]) {
        courierDeliveries[o.courier_id].deliveries++
      }
    })

    const topCouriers = Object.entries(courierDeliveries)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.deliveries - a.deliveries)
      .slice(0, 5)

    return NextResponse.json({
      totalOrders,
      deliveredOrders,
      pendingOrders,
      totalRevenue,
      totalCouriers,
      activeCouriers,
      averageRating: avgRating,
      todayOrders,
      thisWeekOrders,
      thisMonthOrders,
      topCouriers
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 })
  }
}
