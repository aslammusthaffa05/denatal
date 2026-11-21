import { useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Lock, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import api, { errorMessage } from '../lib/api'
import { openRazorpay } from '../lib/razorpay'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { money } from '../lib/format'
import { ProductImage } from '../components/ui'

const emptyForm = (user) => ({
  fullName: user?.name || '',
  phone: user?.phone || '',
  addressLine: '',
  city: '',
  state: '',
  pincode: '',
})

export default function Checkout() {
  const { user } = useAuth()
  const { items, subtotal, clear } = useCart()
  const navigate = useNavigate()
  const [form, setForm] = useState(() => emptyForm(user))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  // set once an order exists, so clearing the cart afterwards never bounces the customer to /cart
  const orderPlaced = useRef(false)

  if (items.length === 0 && !orderPlaced.current) return <Navigate to="/cart" replace />

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const pay = async (e) => {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')

    let created
    try {
      const res = await api.post('/api/orders', {
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        shipping: form,
      })
      created = res.data
    } catch (err) {
      setError(errorMessage(err))
      setBusy(false)
      return
    }

    const orderId = created.order.id
    orderPlaced.current = true
    await openRazorpay({
      payment: created.payment,
      user,
      description: `Order #${orderId}`,
      onSuccess: async (response) => {
        try {
          await api.post(`/api/orders/${orderId}/verify-payment`, {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          })
          clear()
          toast.success('Payment successful. Thank you!')
          navigate(`/orders/${orderId}`, { replace: true })
        } catch (err) {
          // The money may have been taken; the order page shows the true status
          toast.error(errorMessage(err, 'We could not confirm your payment yet.'))
          clear()
          navigate(`/orders/${orderId}`, { replace: true })
        }
      },
      onDismiss: () => {
        setBusy(false)
        toast('Payment not completed. You can finish it from My Orders.', { icon: 'ℹ️' })
        navigate(`/orders/${orderId}`, { replace: true })
        clear()
      },
      onFailure: (message) => {
        setBusy(false)
        setError(message)
      },
    })
  }

  return (
    <div className="container-x py-10">
      <h1 className="text-3xl font-semibold sm:text-4xl">Checkout</h1>
      <form onSubmit={pay} className="mt-8 grid gap-8 lg:grid-cols-[1fr,400px]">
        <div className="card p-6 sm:p-8">
          <h2 className="text-xl font-semibold">Delivery address</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="fullName" className="label">Full name</label>
              <input id="fullName" required maxLength={100} value={form.fullName} onChange={set('fullName')} className="input" autoComplete="name" />
            </div>
            <div>
              <label htmlFor="phone" className="label">Phone</label>
              <input id="phone" required value={form.phone} onChange={set('phone')} className="input" autoComplete="tel" inputMode="tel" pattern="[0-9+\- ]{7,20}" title="Enter a valid phone number" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="addressLine" className="label">Address</label>
              <input id="addressLine" required maxLength={300} value={form.addressLine} onChange={set('addressLine')} className="input" placeholder="House no., street, area" autoComplete="street-address" />
            </div>
            <div>
              <label htmlFor="city" className="label">City</label>
              <input id="city" required maxLength={100} value={form.city} onChange={set('city')} className="input" autoComplete="address-level2" />
            </div>
            <div>
              <label htmlFor="state" className="label">State</label>
              <input id="state" required maxLength={100} value={form.state} onChange={set('state')} className="input" autoComplete="address-level1" />
            </div>
            <div>
              <label htmlFor="pincode" className="label">Pincode</label>
              <input id="pincode" required value={form.pincode} onChange={set('pincode')} className="input" inputMode="numeric" pattern="[1-9][0-9]{5}" maxLength={6} title="Enter a valid 6-digit pincode" autoComplete="postal-code" />
            </div>
          </div>

          {error && <p role="alert" className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}
        </div>

        <aside className="card h-fit p-6 lg:sticky lg:top-28">
          <h2 className="text-xl font-semibold">Your order</h2>
          <ul className="mt-5 max-h-64 space-y-3 overflow-y-auto pr-1">
            {items.map((i) => (
              <li key={i.productId} className="flex items-center gap-3 text-sm">
                <ProductImage src={i.imageUrl} alt={i.name} width={120} className="h-12 w-12 shrink-0 rounded-lg" />
                <span className="flex-1 leading-snug">{i.name} <span className="text-ink-500">x {i.quantity}</span></span>
                <span className="font-semibold">{money(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-2 border-t border-sand-200 pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-ink-500">Delivery</dt><dd className="font-semibold text-emerald-700">Free</dd></div>
            <div className="flex justify-between text-base"><dt className="font-semibold">Total</dt><dd className="text-xl font-bold">{money(subtotal)}</dd></div>
          </dl>
          <button type="submit" disabled={busy} className="btn-primary mt-6 w-full py-3">
            <Lock size={16} /> {busy ? 'Opening payment...' : `Pay ${money(subtotal)} securely`}
          </button>
          <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-ink-500">
            <ShieldCheck size={15} className="mt-0.5 shrink-0 text-brand-600" />
            Payments are processed by Razorpay (UPI, cards, net banking, wallets). We never see or store your card details. Cash on delivery is not available.
          </p>
          <p className="mt-3 text-center text-xs"><Link to="/cart" className="font-semibold text-brand-700 hover:underline">Edit cart</Link></p>
        </aside>
      </form>
    </div>
  )
}
