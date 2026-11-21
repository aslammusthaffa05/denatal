import { useCallback, useEffect, useRef, useState } from 'react'
import { ImagePlus, Pencil, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api, { errorMessage } from '../../lib/api'
import { money } from '../../lib/format'
import { ErrorState, Modal, ProductImage, Spinner } from '../../components/ui'

const emptyForm = { name: '', description: '', price: '', stock: '', category: '', imageUrl: '' }

function ProductForm({ initial, onSaved, onCancel }) {
  const [form, setForm] = useState(
    initial
      ? {
          name: initial.name,
          description: initial.description || '',
          price: String(initial.price),
          stock: String(initial.stock),
          category: initial.category,
          imageUrl: initial.imageUrl || '',
        }
      : emptyForm,
  )
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef(null)

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const upload = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Please choose a JPG, PNG or WebP image.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image is too large (max 5 MB).')
      return
    }
    setUploading(true)
    setError('')
    try {
      // 1) ask our server for a signed upload address, 2) send the photo straight to Cloudflare R2
      const { data } = await api.post('/api/admin/uploads/image', { contentType: file.type, size: file.size })
      const put = await fetch(data.uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file })
      if (!put.ok) throw new Error('upload failed')
      setForm((f) => ({ ...f, imageUrl: data.url }))
      toast.success('Image uploaded')
    } catch (err) {
      setError(err?.response ? errorMessage(err) : 'Could not upload the photo. Check your Cloudflare R2 CORS and public URL settings.')
    } finally {
      setUploading(false)
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    if (saving || uploading) return
    setSaving(true)
    setError('')
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      stock: Number.parseInt(form.stock, 10),
      category: form.category.trim(),
      imageUrl: form.imageUrl || null,
    }
    try {
      if (initial) await api.put(`/api/admin/products/${initial.id}`, payload)
      else await api.post('/api/admin/products', payload)
      toast.success(initial ? 'Product updated' : 'Product added')
      onSaved()
    } catch (err) {
      setError(errorMessage(err))
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <span className="label">Product image</span>
        <div className="flex items-center gap-4">
          <ProductImage src={form.imageUrl} alt="Preview" width={240} className="h-24 w-24 shrink-0 rounded-2xl" />
          <div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} className="hidden" />
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="btn-outline btn-sm">
              <ImagePlus size={15} /> {uploading ? 'Uploading...' : form.imageUrl ? 'Change image' : 'Upload image'}
            </button>
            <p className="mt-2 text-xs text-ink-500">JPG, PNG or WebP, up to 5 MB.</p>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="p-name" className="label">Name</label>
        <input id="p-name" required maxLength={200} value={form.name} onChange={set('name')} className="input" />
      </div>
      <div>
        <label htmlFor="p-desc" className="label">Description</label>
        <textarea id="p-desc" rows={4} maxLength={4000} value={form.description} onChange={set('description')} className="input" />
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="p-price" className="label">Price (INR)</label>
          <input id="p-price" required type="number" min="0.01" step="0.01" max="99999999" value={form.price} onChange={set('price')} className="input" />
        </div>
        <div>
          <label htmlFor="p-stock" className="label">Stock</label>
          <input id="p-stock" required type="number" min="0" max="100000" step="1" value={form.stock} onChange={set('stock')} className="input" />
        </div>
        <div>
          <label htmlFor="p-cat" className="label">Category</label>
          <input id="p-cat" required maxLength={100} list="category-suggestions" value={form.category} onChange={set('category')} className="input" placeholder="e.g. Toothpaste" />
          <datalist id="category-suggestions">
            {['Toothpaste', 'Toothbrushes', 'Mouthwash', 'Floss & Interdental', 'Whitening', 'Kids care'].map((c) => <option key={c} value={c} />)}
          </datalist>
        </div>
      </div>

      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-outline">Cancel</button>
        <button disabled={saving || uploading} className="btn-primary">{saving ? 'Saving...' : initial ? 'Save changes' : 'Add product'}</button>
      </div>
    </form>
  )
}

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null) // null = closed, {} = new, product = edit
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(() => {
    setError('')
    return api
      .get('/api/admin/products')
      .then((res) => setProducts(res.data))
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const saved = () => {
    setEditing(null)
    load()
  }

  const remove = async () => {
    setDeleting(true)
    try {
      await api.delete(`/api/admin/products/${confirmDelete.id}`)
      toast.success('Product deleted')
      setConfirmDelete(null)
      await load()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-500">{products.length} product(s) in your store</p>
        <button onClick={() => setEditing({})} className="btn-primary"><Plus size={16} /> Add product</button>
      </div>

      <div className="mt-6">
        {loading ? (
          <Spinner label="Loading products..." />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : products.length === 0 ? (
          <div className="card px-6 py-14 text-center">
            <p className="text-lg font-semibold">No products yet</p>
            <p className="mt-1 text-sm text-ink-500">Add your first product to start selling.</p>
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-sand-200 bg-sand-50 text-xs uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Stock</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-sand-50/60">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <ProductImage src={p.imageUrl} alt={p.name} width={96} className="h-12 w-12 shrink-0 rounded-lg" />
                        <span className="font-semibold">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-ink-500">{p.category}</td>
                    <td className="px-5 py-3 font-semibold">{money(p.price)}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${p.stock === 0 ? 'bg-red-100 text-red-700' : p.stock <= 5 ? 'bg-coral-400/20 text-coral-600' : 'bg-emerald-100 text-emerald-700'}`}>
                        {p.stock === 0 ? 'Out of stock' : p.stock}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditing(p)} className="btn-outline btn-sm" aria-label={`Edit ${p.name}`}><Pencil size={14} /> Edit</button>
                        <button onClick={() => setConfirmDelete(p)} className="btn-sm btn border border-red-200 bg-white text-red-600 hover:bg-red-50" aria-label={`Delete ${p.name}`}><Trash2 size={14} /> Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <Modal title={editing.id ? 'Edit product' : 'Add new product'} onClose={() => setEditing(null)}>
          <ProductForm initial={editing.id ? editing : null} onSaved={saved} onCancel={() => setEditing(null)} />
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Delete this product?" onClose={() => !deleting && setConfirmDelete(null)}>
          <p className="text-sm text-ink-700">
            <strong>{confirmDelete.name}</strong> will be removed from the store. Past orders keep their details.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={() => setConfirmDelete(null)} disabled={deleting} className="btn-outline">Cancel</button>
            <button onClick={remove} disabled={deleting} className="btn-danger">{deleting ? 'Deleting...' : 'Yes, delete'}</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
