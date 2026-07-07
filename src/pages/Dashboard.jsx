import { DollarSign, ShoppingBag, Images, TrendingUp } from 'lucide-react'
import StatCard from '../components/dashboard/StatCard'
import SalesChart from '../components/dashboard/SalesChart'
import RecentOrders from '../components/dashboard/RecentOrders'

const stats = [
  {
    id: 'stat-revenue',
    title: 'Total Revenue',
    value: '$84,200',
    icon: DollarSign,
    trend: 'up',
    trendValue: 12.4,
    gradient: 'bg-gradient-to-br from-purple-500 to-purple-700',
  },
  {
    id: 'stat-orders',
    title: 'Total Orders',
    value: '1,238',
    icon: ShoppingBag,
    trend: 'up',
    trendValue: 8.1,
    gradient: 'bg-gradient-to-br from-pink-500 to-pink-700',
  },
  {
    id: 'stat-images',
    title: 'Active Images',
    value: '56',
    icon: Images,
    trend: 'up',
    trendValue: 3.5,
    gradient: 'bg-gradient-to-br from-violet-500 to-indigo-600',
  },
  {
    id: 'stat-growth',
    title: 'Monthly Growth',
    value: '+18.3%',
    icon: TrendingUp,
    trend: 'up',
    trendValue: 4.2,
    gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600',
  },
]

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-slate-100 text-2xl font-bold">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome back, Admin. Here&apos;s your overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.id} {...stat} />
        ))}
      </div>

      <SalesChart />

      <RecentOrders />
    </div>
  )
}
