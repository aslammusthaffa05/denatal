import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Minus, Plus, ShieldCheck, ShoppingCart, Truck } from 'lucide-react'
import toast from 'react-hot-toast'
import api, { errorMessage } from '../lib/api'
import { useCart } from '../context/CartContext'
import { money } from '../lib/format'
import { ErrorState, ProductImage, Spinner } from '../components/ui'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [product, setProduct] = useState(null)
  const [qty, setQty] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    api
      .get(`/api/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch((e) => setError(e.response?.status === 404 ? 'This product is no longer available.' : errorMessage(e)))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(load, [load])

  if (loading) return <Spinner label="Loading product..." />
  if (error) {
    return (
      <div className="container-x py-16">
        <ErrorState message={error} onRetry={load} />
        <p className="mt-6 text-center"><Link to="/shop" className="btn-outline">Back to shop</Link></p>
      </div>
    )
  }

  const soldOut = product.stock <= 0
  const maxQty = Math.min(product.stock, 100)

  const add = () => {
    addItem(product, qty)
    toast.success(`${product.name} added to cart`)
  }
  const buyNow = () => {
    addItem(product, qty)
    navigate('/cart')
  }

  return (
    <div className="container-x py-10">
      <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-500 hover:text-brand-700">
        <ArrowLeft size={16} /> Back to shop
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="card overflow-hidden">
          <ProductImage src={product.imageUrl} alt={product.name} width={900} className="aspect-square w-full" />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">{product.category}</p>
          <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">{product.name}</h1>
          <p className="mt-4 text-3xl font-bold">{money(product.price)}</p>
          <p className="text-xs text-ink-500">Inclusive of all taxes. Free delivery.</p>

          <p className={`mt-4 text-sm font-semibold ${soldOut ? 'text-red-600' : product.stock <= 5 ? 'text-coral-600' : 'text-emerald-700'}`}>
            {soldOut ? 'Currently out of stock' : product.stock <= 5 ? `Hurry, only ${product.stock} left` : 'In stock'}
          </p>

          {product.description && (
            <p className="mt-6 whitespace-pre-line leading-relaxed text-ink-700">{product.description}</p>
          )}

          {!soldOut && (
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-full border border-ink-300/50 bg-white">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3 hover:text-brand-700" aria-label="Decrease quantity"><Minus size={16} /></button>
                <span className="w-10 text-center font-semibold" aria-live="polite">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(maxQty, q + 1))} className="p-3 hover:text-brand-700" aria-label="Increase quantity"><Plus size={16} /></button>
              </div>
              <button onClick={add} className="btn-outline px-6 py-3"><ShoppingCart size={18} /> Add to cart</button>
              <button onClick={buyNow} className="btn-primary px-6 py-3">Buy now</button>
            </div>
          )}

          <ul className="mt-8 space-y-3 rounded-2xl bg-brand-50 p-5 text-sm text-ink-700">
            <li className="flex items-center gap-3"><ShieldCheck size={18} className="text-brand-600" /> Secure online payment (UPI, cards, net banking). No cash on delivery.</li>
            <li className="flex items-center gap-3"><Truck size={18} className="text-brand-600" /> Track your order from packing to delivery.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
