import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export function useRealtimeOffers(courierId: string) {
  const [offers, setOffers] = useState<any[]>([])
  useEffect(() => {
    if (!courierId) return
    const fetchOffers = async () => {
      const { data } = await (supabase.from('orders') as any).select('*').eq('offered_to', courierId).eq('status', 'looking_for_courier').gt('offer_expires_at', new Date().toISOString())
      setOffers(data || [])
    }
    fetchOffers()
    const channel = supabase.channel('offers').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOffers()).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [courierId])
  return offers
}
