import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, IndianRupee, Package, ReceiptText } from 'lucide-react'
import api, { errorMessage } from '../../lib/api'
import { formatDateTime, money, STATUS_LABELS } from '../../lib/format'
import { ErrorState, Spinner, StatusBadge } from '../../components/ui'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setError('')
    api
      .get('/api/admin/stats')
      .then((res) => setStats(res.data))
      .catch((e) => setError(errorMessage(e)))
  }, [])

  useEffect(load, [load])

  if (error) return <ErrorState message={error} onRetry={load} />
  if (!stats) return <Spinner label="Loading dashboard..." />

  const cards = [
    { label: 'Paid orders', value: stats.paidOrders, icon: ReceiptText, tone: 'bg-brand-100 text-brand-700' },
    { label: 'Revenue', value: money(stats.revenue), icon: IndianRupee, tone: 'bg-emerald-100 text-emerald-700' },
    { label: 'Active products', value: stats.products, icon: Package, tone: 'bg-sky-100 text-sky-700' },
    { label: 'Low stock (5 or fewer)', value: stats.lowStock, icon: AlertTriangle, tone: 'bg-coral-400/20 text-coral-600' },
  ]

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card flex items-center gap-4 p-5">
            <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${c.tone}`}><c.icon size={22} /></span>
            <div>
              <p className="text-2xl font-bold">{c.value}</p>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr,1.4fr]">
        <section className="card p-6">
          <h2 className="text-lg font-semibold">Orders by status</h2>
          <ul className="mt-4 divide-y divide-sand-200 text-sm">
            {Object.entries(stats.ordersByStatus).map(([status, n]) => (
              <li key={status} className="flex items-center justify-between py-2.5">
                <span>{STATUS_LABELS[status] || status}</span>
                <span className="font-bold">{n}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Latest paid orders</h2>
            <Link to="/admin/orders" className="text-sm font-semibold text-brand-700 hover:underline">View all</Link>
          </div>
          {stats.recentOrders.length === 0 ? (
            <p className="mt-6 text-sm text-ink-500">No paid orders yet. They will appear here as soon as a customer pays.</p>
          ) : (
            <ul className="mt-4 divide-y divide-sand-200">
              {stats.recentOrders.map((o) => (
                <li key={o.id}>
                  <Link to={`/admin/orders?open=${o.id}`} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm hover:text-brand-700">
                    <span>
                      <span className="font-semibold">#{o.id}</span> &middot; {o.customer.name}
                      <span className="block text-xs text-ink-500">{formatDateTime(o.paidAt)}</span>
                    </span>
                    <span className="flex items-center gap-3">
                      <StatusBadge status={o.status} />
                      <span className="font-bold">{money(o.totalAmount)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
