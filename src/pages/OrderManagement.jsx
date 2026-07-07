import { useEffect } from 'react'
import { ShoppingBag } from 'lucide-react'
import useOrderStore from '../lib/orderStore'
import OrderTable from '../components/orders/OrderTable'

const MOCK_ORDERS = [
  { id: '#ORD-001', customer: 'Emma Wilson', item: 'Chocolate Fudge Cake', total: '$42.00', status: 'Delivered', date: '2025-12-01' },
  { id: '#ORD-002', customer: 'James Carter', item: 'Strawberry Dream', total: '$38.00', status: 'Processing', date: '2025-12-02' },
  { id: '#ORD-003', customer: 'Lily Chen', item: 'Red Velvet Layer', total: '$55.00', status: 'Pending', date: '2025-12-03' },
  { id: '#ORD-004', customer: 'Noah Adams', item: 'Lemon Drizzle', total: '$29.00', status: 'Delivered', date: '2025-12-04' },
  { id: '#ORD-005', customer: 'Olivia Hart', item: 'Vanilla Cloud', total: '$48.00', status: 'Cancelled', date: '2025-12-05' },
  { id: '#ORD-006', customer: 'Ethan Brooks', item: 'Caramel Crunch', total: '$61.00', status: 'Processing', date: '2025-12-06' },
  { id: '#ORD-007', customer: 'Sophia Reed', item: 'Blueberry Bliss', total: '$33.00', status: 'Delivered', date: '2025-12-07' },
]

export default function OrderManagement() {
  const { fetchOrders, orders, loading, error } = useOrderStore()

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const displayOrders = orders.length ? orders : MOCK_ORDERS

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-slate-100 text-2xl font-bold">Order Management</h1>
          <p className="text-slate-500 text-sm mt-1">
            {loading ? 'Loading orders…' : `${displayOrders.length} order${displayOrders.length !== 1 ? 's' : ''} found`}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 text-xs font-medium">Live</span>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm"
        >
          <ShoppingBag size={16} className="shrink-0" />
          {error} Showing sample data.
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <OrderTable orders={displayOrders} />
      )}
    </div>
  )
}
