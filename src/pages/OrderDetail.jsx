import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'
import api, { errorMessage } from '../lib/api'
import { openRazorpay } from '../lib/razorpay'
import { useAuth } from '../context/AuthContext'
import { formatDateTime, money } from '../lib/format'
import { ErrorState, ProductImage, Spinner, StatusBadge } from '../components/ui'
import OrderTimeline from '../components/OrderTimeline'

export default function OrderDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [paying, setPaying] = useState(false)

  const load = useCallback(() => {
    setError('')
    return api
      .get(`/api/orders/${id}`)
      .then((res) => setOrder(res.data))
      .catch((e) => setError(e.response?.status === 404 ? 'We could not find this order.' : errorMessage(e)))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    setLoading(true)
    load()
  }, [load])

  const completePayment = async () => {
    if (paying) return
    setPaying(true)
    try {
      const res = await api.post(`/api/orders/${id}/pay`)
      await openRazorpay({
        payment: res.data,
        user,
        description: `Order #${id}`,
        onSuccess: async (response) => {
          try {
            await api.post(`/api/orders/${id}/verify-payment`, {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            })
            toast.success('Payment successful. Thank you!')
          } catch (err) {
            toast.error(errorMessage(err, 'We could not confirm your payment yet.'))
          }
          await load()
          setPaying(false)
        },
        onDismiss: () => setPaying(false),
        onFailure: (message) => {
          toast.error(message)
          setPaying(false)
        },
      })
    } catch (err) {
      toast.error(errorMessage(err))
      setPaying(false)
    }
  }

  if (loading) return <Spinner label="Loading your order..." />
  if (error) {
    return (
      <div className="container-x py-16">
        <ErrorState message={error} onRetry={load} />
        <p className="mt-6 text-center"><Link to="/orders" className="btn-outline">My orders</Link></p>
      </div>
    )
  }

  const s = order.shipping

  return (
    <div className="container-x py-10">
      <Link to="/orders" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-500 hover:text-brand-700">
        <ArrowLeft size={16} /> All orders
      </Link>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold sm:text-4xl">Order #{order.id}</h1>
          <p className="mt-1 text-sm text-ink-500">Placed {formatDateTime(order.createdAt)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {order.paymentStatus === 'PENDING' && (
        <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center">
          <div>
            <p className="font-semibold text-amber-900">Payment pending</p>
            <p className="text-sm text-amber-800">Your order is confirmed only after payment is completed.</p>
          </div>
          <button onClick={completePayment} disabled={paying} className="btn-primary">
            <CreditCard size={16} /> {paying ? 'Opening...' : `Pay ${money(order.totalAmount)}`}
          </button>
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr,1fr]">
        <div className="space-y-8">
          <section className="card p-6 sm:p-8">
            <h2 className="text-xl font-semibold">Tracking</h2>
            <div className="mt-6"><OrderTimeline order={order} /></div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="card p-6">
            <h2 className="text-xl font-semibold">Items</h2>
            <ul className="mt-5 divide-y divide-sand-200">
              {order.items.map((i) => (
                <li key={`${i.productId}-${i.productName}`} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <ProductImage src={i.imageUrl} alt={i.productName} width={120} className="h-14 w-14 shrink-0 rounded-xl" />
                  <div className="flex-1 text-sm">
                    <p className="font-semibold leading-snug">{i.productName}</p>
                    <p className="text-ink-500">{money(i.unitPrice)} x {i.quantity}</p>
                  </div>
                  <p className="font-semibold">{money(i.unitPrice * i.quantity)}</p>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between border-t border-sand-200 pt-4">
              <span className="font-semibold">Total</span>
              <span className="text-lg font-bold">{money(order.totalAmount)}</span>
            </div>
          </section>

          <section className="card p-6 text-sm">
            <h2 className="text-xl font-semibold">Delivery address</h2>
            <p className="mt-4 font-semibold">{s.fullName}</p>
            <p className="mt-1 leading-relaxed text-ink-700">{s.addressLine}<br />{s.city}, {s.state} {s.pincode}</p>
            <p className="mt-2 text-ink-500">Phone: {s.phone}</p>
            <h3 className="mt-6 font-semibold">Payment</h3>
            <p className="mt-1 text-ink-700">
              {order.paymentStatus === 'PAID' ? `Paid online on ${formatDateTime(order.paidAt)}` : 'Not paid yet'}
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
