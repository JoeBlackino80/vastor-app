export type Database = {
  public: {
    Tables: {
      couriers: {
        Row: {
          id: string
          created_at: string
          email: string
          phone: string
          first_name: string
          last_name: string
          vehicle_type: string
          status: string
          rating: number
          total_deliveries: number
        }
        Insert: {
          id?: string
          created_at?: string
          email: string
          phone: string
          first_name: string
          last_name: string
          vehicle_type: string
          status?: string
          rating?: number
          total_deliveries?: number
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          phone?: string
          first_name?: string
          last_name?: string
          vehicle_type?: string
          status?: string
          rating?: number
          total_deliveries?: number
        }
      }
      orders: {
        Row: {
          id: string
          created_at: string
          customer_name: string
          customer_phone: string
          customer_email: string
          pickup_address: string
          pickup_notes: string | null
          delivery_address: string
          delivery_notes: string | null
          package_type: string
          service_type: string
          status: string
          price: number
          courier_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          customer_name: string
          customer_phone: string
          customer_email: string
          pickup_address: string
          pickup_notes?: string | null
          delivery_address: string
          delivery_notes?: string | null
          package_type: string
          service_type: string
          status?: string
          price: number
          courier_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          customer_name?: string
          customer_phone?: string
          customer_email?: string
          pickup_address?: string
          pickup_notes?: string | null
          delivery_address?: string
          delivery_notes?: string | null
          package_type?: string
          service_type?: string
          status?: string
          price?: number
          courier_id?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Courier = Database['public']['Tables']['couriers']['Row']
export type CourierInsert = Database['public']['Tables']['couriers']['Insert']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderInsert = Database['public']['Tables']['orders']['Insert']
