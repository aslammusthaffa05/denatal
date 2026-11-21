import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api, { errorMessage } from '../../lib/api'
import { formatDateTime, money, STATUS_LABELS } from '../../lib/format'
import { EmptyState, ErrorState, Modal, ProductImage, Spinner, StatusBadge } from '../../components/ui'
import OrderTimeline from '../../components/OrderTimeline'

const FILTERS = ['', 'PAID', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']

// The next step an admin can move an order to
const NEXT = {
  PAID: ['PROCESSING', 'SHIPPED', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'CANCELLED'],
}

function OrderPanel({ order, onChanged }) {
  const options = NEXT[order.status] || []
  const [status, setStatus] = useState(options[0] || '')
  const [tracking, setTracking] = useState(order.trackingNumber || '')
  const [courier, setCourier] = useState(order.courier || '')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [confirmCancel, setConfirmCancel] = useState(false)

  const s = order.shipping

  const save = async () => {
    if (!status || busy) return
    if (status === 'CANCELLED' && !confirmCancel) {
      setConfirmCancel(true)
      return
    }
    setBusy(true)
    setError('')
    try {
      const res = await api.put(`/api/admin/orders/${order.id}/status`, {
        status,
        trackingNumber: tracking || null,
        courier: courier || null,
        note: note || null,
      })
      toast.success(`Order #${order.id} updated`)
      onChanged(res.data)
    } catch (err) {
      setError(errorMessage(err))
      setBusy(false)
      setConfirmCancel(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <StatusBadge status={order.status} />
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
          <CheckCircle2 size={14} /> Paid online &middot; {formatDateTime(order.paidAt)}
        </span>
      </div>

      <div className="grid gap-5 text-sm sm:grid-cols-2">
        <div className="rounded-2xl bg-sand-50 p-4">
          <p className="label">Customer</p>
          <p className="font-semibold">{order.customer.name}</p>
          <p className="text-ink-500">{order.customer.email}</p>
          <p className="text-ink-500">{order.customer.phone}</p>
        </div>
        <div className="rounded-2xl bg-sand-50 p-4">
          <p className="label">Ship to</p>
          <p className="font-semibold">{s.fullName}</p>
          <p className="text-ink-700">{s.addressLine}, {s.city}, {s.state} {s.pincode}</p>
          <p className="text-ink-500">{s.phone}</p>
        </div>
      </div>

      <div>
        <p className="label">Items</p>
        <ul className="divide-y divide-sand-200 rounded-2xl border border-sand-200">
          {order.items.map((i) => (
            <li key={`${i.productId}-${i.productName}`} className="flex items-center gap-3 p-3 text-sm">
              <ProductImage src={i.imageUrl} alt={i.productName} width={96} className="h-12 w-12 shrink-0 rounded-lg" />
              <span className="flex-1 font-semibold leading-snug">{i.productName}</span>
              <span className="text-ink-500">{money(i.unitPrice)} x {i.quantity}</span>
              <span className="w-24 text-right font-semibold">{money(i.unitPrice * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-right text-base">Total: <strong className="text-lg">{money(order.totalAmount)}</strong></p>
        <p className="text-right text-xs text-ink-500">Razorpay payment ID: <span className="font-mono">{order.razorpayPaymentId}</span></p>
      </div>

      {options.length > 0 ? (
        <div className="rounded-2xl border border-brand-200 bg-brand-50/50 p-5">
          <p className="font-semibold">Update tracking</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="o-status" className="label">New status</label>
              <select id="o-status" value={status} onChange={(e) => { setStatus(e.target.value); setConfirmCancel(false) }} className="input">
                {options.map((o) => <option key={o} value={o}>{STATUS_LABELS[o]}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="o-courier" className="label">Courier</label>
              <input id="o-courier" maxLength={100} value={courier} onChange={(e) => setCourier(e.target.value)} className="input" placeholder="e.g. Delhivery, India Post" />
            </div>
            <div>
              <label htmlFor="o-track" className="label">Tracking number {status === 'SHIPPED' && <span className="text-red-600">*</span>}</label>
              <input id="o-track" maxLength={100} value={tracking} onChange={(e) => setTracking(e.target.value)} className="input" />
            </div>
            <div>
              <label htmlFor="o-note" className="label">Message to customer (optional)</label>
              <input id="o-note" maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} className="input" />
            </div>
          </div>
          {status === 'CANCELLED' && (
            <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-xs text-red-700">
              Cancelling returns the items to stock. Refund the payment from your Razorpay dashboard, since refunds are not automatic.
            </p>
          )}
          {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}
          <div className="mt-4 flex justify-end">
            <button onClick={save} disabled={busy} className={status === 'CANCELLED' ? 'btn-danger' : 'btn-primary'}>
              {busy ? 'Saving...' : confirmCancel ? 'Click again to confirm cancel' : 'Update order'}
            </button>
          </div>
        </div>
      ) : (
        <p className="rounded-2xl bg-sand-100 px-5 py-4 text-sm text-ink-700">This order is closed ({STATUS_LABELS[order.status]}).</p>
      )}

      <div>
        <p className="label">History</p>
        <OrderTimeline order={order} />
      </div>
    </div>
  )
}

export default function AdminOrders() {
  const [params, setParams] = useSearchParams()
  const [filter, setFilter] = useState('')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openId, setOpenId] = useState(() => Number(params.get('open')) || null)

  const load = useCallback(() => {
    setError('')
    return api
      .get('/api/admin/orders', { params: { status: filter || undefined } })
      .then((res) => setOrders(res.data))
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false))
  }, [filter])

  useEffect(() => {
    setLoading(true)
    load()
  }, [load])

  const open = orders.find((o) => o.id === openId)

  const close = () => {
    setOpenId(null)
    if (params.has('open')) setParams({}, { replace: true })
  }

  const changed = async () => {
    await load()
    close()
  }

  return (
    <div>
      <p className="mb-4 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-800">
        Only orders with a <strong>confirmed online payment</strong> appear here. Unpaid or abandoned checkouts are never shown.
      </p>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        {FILTERS.map((f) => (
          <button
            key={f || 'all'}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${filter === f ? 'bg-brand-600 text-white' : 'bg-white text-ink-700 shadow-card hover:text-brand-700'}`}
          >
            {f ? STATUS_LABELS[f] : 'All paid orders'}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {loading ? (
          <Spinner label="Loading orders..." />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : orders.length === 0 ? (
          <EmptyState title="No orders here" text="Paid orders will appear as soon as customers complete payment." />
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-sand-200 bg-sand-50 text-xs uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Paid on</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-sand-50/60">
                    <td className="px-5 py-3 font-semibold">#{o.id}</td>
                    <td className="px-5 py-3">{o.customer.name}<span className="block text-xs text-ink-500">{o.shipping.city}</span></td>
                    <td className="px-5 py-3 text-ink-500">{formatDateTime(o.paidAt)}</td>
                    <td className="px-5 py-3 font-semibold">{money(o.totalAmount)}</td>
                    <td className="px-5 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-5 py-3 text-right"><button onClick={() => setOpenId(o.id)} className="btn-outline btn-sm">Manage</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {openId && (
        <Modal title={`Order #${openId}`} onClose={close} wide>
          {open ? (
            <OrderPanel key={`${open.id}-${open.status}`} order={open} onChanged={changed} />
          ) : (
            <p className="text-sm text-ink-500">This order is not in the current list. Try the &ldquo;All paid orders&rdquo; filter.</p>
          )}
        </Modal>
      )}
    </div>
  )
}
