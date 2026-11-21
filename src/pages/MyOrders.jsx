import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import api, { errorMessage } from '../lib/api'
import { formatDate, money } from '../lib/format'
import { EmptyState, ErrorState, ProductImage, Spinner, StatusBadge } from '../components/ui'

export default function MyOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    api
      .get('/api/orders')
      .then((res) => setOrders(res.data))
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  return (
    <div className="container-x py-10">
      <h1 className="text-3xl font-semibold sm:text-4xl">My orders</h1>
      <div className="mt-8">
        {loading ? (
          <Spinner label="Loading your orders..." />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : orders.length === 0 ? (
          <EmptyState title="No orders yet" text="When you place an order it will show up here with live tracking." actionTo="/shop" actionLabel="Start shopping" />
        ) : (
          <ul className="space-y-4">
            {orders.map((o) => (
              <li key={o.id}>
                <Link to={`/orders/${o.id}`} className="card flex flex-col gap-4 p-5 transition hover:shadow-soft sm:flex-row sm:items-center">
                  <div className="flex -space-x-3">
                    {o.items.slice(0, 3).map((i) => (
                      <ProductImage key={i.productId} src={i.imageUrl} alt={i.productName} width={120} className="h-14 w-14 rounded-xl border-2 border-white" />
                    ))}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">Order #{o.id}</p>
                    <p className="text-sm text-ink-500">
                      Placed {formatDate(o.createdAt)} &middot; {o.items.reduce((n, i) => n + i.quantity, 0)} item(s)
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <StatusBadge status={o.status} />
                    <span className="font-bold">{money(o.totalAmount)}</span>
                    <ChevronRight size={18} className="text-ink-300" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
