import { Link } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import toast from 'react-hot-toast'
import { ProductImage } from './ui'
import { useCart } from '../context/CartContext'
import { money } from '../lib/format'

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const soldOut = product.stock <= 0

  const handleAdd = () => {
    addItem(product, 1)
    toast.success(`${product.name} added to cart`)
  }

  return (
    <article className="card group flex flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-soft">
      <Link to={`/shop/${product.id}`} className="relative block aspect-square overflow-hidden bg-sand-100">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          width={500}
          className="h-full w-full transition duration-500 group-hover:scale-105"
        />
        {soldOut && (
          <span className="absolute left-3 top-3 rounded-full bg-ink-900 px-3 py-1 text-xs font-semibold text-white">Sold out</span>
        )}
        {!soldOut && product.stock <= 5 && (
          <span className="absolute left-3 top-3 rounded-full bg-coral-500 px-3 py-1 text-xs font-semibold text-white">
            Only {product.stock} left
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">{product.category}</p>
        <Link to={`/shop/${product.id}`} className="mt-1 line-clamp-2 font-semibold leading-snug hover:text-brand-700">
          {product.name}
        </Link>
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-lg font-bold">{money(product.price)}</span>
          <button onClick={handleAdd} disabled={soldOut} className="btn-primary btn-sm" aria-label={`Add ${product.name} to cart`}>
            <ShoppingCart size={15} /> Add
          </button>
        </div>
      </div>
    </article>
  )
}
