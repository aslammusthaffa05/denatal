import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import api, { errorMessage } from '../lib/api'
import { EmptyState, ErrorState, SectionHeading, Spinner } from '../components/ui'
import ProductCard from '../components/ProductCard'

export default function Shop() {
  const [params, setParams] = useSearchParams()
  const category = params.get('category') || ''
  const q = params.get('q') || ''

  const [search, setSearch] = useState(q)
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    api
      .get('/api/products', { params: { q: q || undefined, category: category || undefined } })
      .then((res) => setProducts(res.data))
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false))
  }, [q, category])

  useEffect(load, [load])

  useEffect(() => {
    api.get('/api/products/categories').then((res) => setCategories(res.data)).catch(() => {})
  }, [])

  const update = (next) => {
    const merged = { q, category, ...next }
    const clean = {}
    Object.entries(merged).forEach(([k, v]) => v && (clean[k] = v))
    setParams(clean)
  }

  const submitSearch = (e) => {
    e.preventDefault()
    update({ q: search.trim() })
  }

  return (
    <>
      <section className="bg-gradient-to-b from-brand-50 to-sand-50">
        <div className="container-x py-12 lg:py-16">
          <SectionHeading
            eyebrow="Dental shop"
            title="Professional oral-care products"
            text="Chosen by our dentists. Pay securely online and track your order from our clinic to your door."
          />
          <form onSubmit={submitSearch} className="mt-8 flex max-w-xl gap-2" role="search">
            <div className="relative flex-1">
              <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-300" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input !rounded-full !pl-11"
                placeholder="Search toothpaste, brushes, floss..."
                aria-label="Search products"
              />
            </div>
            <button className="btn-primary">Search</button>
          </form>
        </div>
      </section>

      <section className="container-x">
        {categories.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
            {['', ...categories].map((c) => (
              <button
                key={c || 'all'}
                onClick={() => update({ category: c })}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  category === c ? 'bg-brand-600 text-white shadow-soft' : 'bg-white text-ink-700 shadow-card hover:text-brand-700'
                }`}
              >
                {c || 'All products'}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <Spinner label="Loading products..." />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : products.length === 0 ? (
          <EmptyState
            title="No products found"
            text={q || category ? 'Try a different search or category.' : 'Products will appear here soon.'}
            actionTo={q || category ? '/shop' : undefined}
            actionLabel="Clear filters"
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </>
  )
}
