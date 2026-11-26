const inrWhole = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
const inrFull = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 })

// whole rupees show as "Rs 249", anything with paise shows both decimals ("Rs 249.50")
export const money = (value) => {
  const n = Number(value) || 0
  return Number.isInteger(n) ? inrWhole.format(n) : inrFull.format(n)
}

export const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '-'

export const formatDateTime = (iso) =>
  iso
    ? new Date(iso).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
      })
    : '-'

/**
 * Cloudinary can resize and compress on the fly. Adding f_auto,q_auto,w_xxx makes product
 * photos load much faster. Non-Cloudinary URLs are returned unchanged.
 */
export function optimizeImage(url, width = 600) {
  if (!url || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`)
}

export const STATUS_LABELS = {
  PENDING_PAYMENT: 'Awaiting payment',
  PAID: 'Payment received',
  PROCESSING: 'Packing',
  SHIPPED: 'Shipped',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  PAYMENT_FAILED: 'Payment failed - refunded',
}

export const STATUS_STYLES = {
  PENDING_PAYMENT: 'bg-amber-100 text-amber-800',
  PAID: 'bg-sky-100 text-sky-800',
  PROCESSING: 'bg-indigo-100 text-indigo-800',
  SHIPPED: 'bg-violet-100 text-violet-800',
  OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-800',
  DELIVERED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-red-100 text-red-700',
  PAYMENT_FAILED: 'bg-red-100 text-red-700',
}
