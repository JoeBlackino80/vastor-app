'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, MapPin, Eye, RotateCcw, Image, Download } from 'lucide-react'

export default function MyOrders() {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [customer, setCustomer] = useState<any>(null)

  useEffect(() => {
    const saved = localStorage.getItem('customer')
    if (saved) {
      const c = JSON.parse(saved)
      setCustomer(c)
      fetchOrders(c.phone)
    } else {
      setIsLoading(false)
    }
  }, [])

  const fetchOrders = async (phone: string) => {
    try {
      const res = await fetch('/api/customer-orders?phone=' + encodeURIComponent(phone))
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : data.orders || [])
    } catch (err) {
      console.error('Error fetching orders:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReorder = (order: any) => {
    const reorderData = {
      pickup_address: order.pickup_address,
      pickup_notes: order.pickup_notes || '',
      delivery_address: order.delivery_address,
      delivery_notes: order.delivery_notes || '',
      package_type: order.package_type,
      service_type: order.service_type
    }
    localStorage.setItem('reorder', JSON.stringify(reorderData))
    router.push('/objednavka?reorder=true')
  }

  const exportCSV = () => {
    const headers = ["ID","Dátum","Stav","Odkiaľ","Kam","Typ","Cena"]
    const rows = orders.map(o => [
      o.id,
      new Date(o.created_at).toLocaleDateString("sk"),
      o.status,
      o.pickup_address,
      o.delivery_address,
      o.package_type,
      o.price || 0
    ])
    const csv = [headers, ...rows].map(r => r.join(";")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = 'objednavky-' + new Date().toISOString().split("T")[0] + '.csv'
    a.click()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'assigned': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'looking_for_courier': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered': return 'Doručené'
      case 'assigned': return 'Kuriér priradený'
      case 'pending': return 'Čaká na kuriéra'
      case 'looking_for_courier': return 'Hľadá sa kuriér'
      default: return status
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Načítavam...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto p-6">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full mb-4">
          <ArrowLeft className="w-6 h-6 dark:text-white" />
        </button>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold dark:text-white">Moje objednávky</h1>
          {orders.length > 0 && (
            <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm font-medium dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600">
              <Download className="w-4 h-4" />Export CSV
            </button>
          )}
        </div>

        {!customer ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-sm">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">Pre zobrazenie objednávok sa prihláste</p>
            <Link href="/prihlasenie" className="inline-block px-6 py-3 bg-black text-white rounded-xl font-semibold">
              Prihlásiť sa
            </Link>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-sm">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">Zatiaľ nemáte žiadne objednávky</p>
            <Link href="/objednavka" className="inline-block px-6 py-3 bg-black text-white rounded-xl font-semibold">
              Vytvoriť objednávku
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(order.created_at).toLocaleDateString('sk-SK')}</p>
                    <p className="font-bold dark:text-white">{order.price} €</p>
                  </div>
                  <span className={'px-3 py-1 rounded-full text-xs font-medium ' + getStatusColor(order.status)}>
                    {getStatusText(order.status)}
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5" />
                    <p className="text-sm dark:text-gray-300">{order.pickup_address}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5" />
                    <p className="text-sm dark:text-gray-300">{order.delivery_address}</p>
                  </div>
                </div>
                {order.delivery_photo_url && (
                  <a href={order.delivery_photo_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-green-600 text-sm font-medium mb-3">
                    <Image className="w-4 h-4" /> Foto doručenia
                  </a>
                )}
                <div className="flex gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  {order.status === 'assigned' && (
                    <Link href={'/sledovat/' + order.id} className="flex items-center gap-1 text-blue-600 text-sm font-medium">
                      <Eye className="w-4 h-4" /> Sledovať
                    </Link>
                  )}
                  <button onClick={() => handleReorder(order)} className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm font-medium hover:text-black dark:hover:text-white">
                    <RotateCcw className="w-4 h-4" /> Objednať znova
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
