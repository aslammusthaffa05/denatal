import { Link, useNavigate } from 'react-router-dom'
import { Lock, Minus, Plus, Trash2 } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { money } from '../lib/format'
import { EmptyState, ProductImage } from '../components/ui'

export default function Cart() {
  const { items, subtotal, count, setQuantity, removeItem } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <div className="container-x py-20">
        <EmptyState title="Your cart is empty" text="Add some dental products to get started." actionTo="/shop" actionLabel="Browse the shop" />
      </div>
    )
  }

  const checkout = () => navigate(user ? '/checkout' : '/login', { state: { from: '/checkout' } })

  return (
    <div className="container-x py-10">
      <h1 className="text-3xl font-semibold sm:text-4xl">Your cart</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr,380px]">
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item.productId} className="card flex gap-4 p-4">
              <Link to={`/shop/${item.productId}`} className="block h-24 w-24 shrink-0 overflow-hidden rounded-xl sm:h-28 sm:w-28">
                <ProductImage src={item.imageUrl} alt={item.name} width={240} className="h-full w-full" />
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-3">
                  <Link to={`/shop/${item.productId}`} className="font-semibold leading-snug hover:text-brand-700">{item.name}</Link>
                  <p className="font-bold">{money(item.price * item.quantity)}</p>
                </div>
                <p className="text-sm text-ink-500">{money(item.price)} each</p>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center rounded-full border border-ink-300/50">
                    <button onClick={() => setQuantity(item.productId, item.quantity - 1)} className="p-2 hover:text-brand-700" aria-label={`Decrease ${item.name}`}><Minus size={14} /></button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button onClick={() => setQuantity(item.productId, item.quantity + 1)} disabled={item.quantity >= item.stock} className="p-2 hover:text-brand-700 disabled:opacity-40" aria-label={`Increase ${item.name}`}><Plus size={14} /></button>
                  </div>
                  <button onClick={() => removeItem(item.productId)} className="flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700">
                    <Trash2 size={15} /> Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="card h-fit p-6 lg:sticky lg:top-28">
          <h2 className="text-xl font-semibold">Order summary</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-ink-500">Items ({count})</dt><dd className="font-semibold">{money(subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-500">Delivery</dt><dd className="font-semibold text-emerald-700">Free</dd></div>
            <div className="flex justify-between border-t border-sand-200 pt-4 text-base"><dt className="font-semibold">Total</dt><dd className="text-xl font-bold">{money(subtotal)}</dd></div>
          </dl>
          <button onClick={checkout} className="btn-primary mt-6 w-full py-3">Proceed to checkout</button>
          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-ink-500"><Lock size={13} /> Secure online payment only</p>
        </aside>
      </div>
    </div>
  )
}
