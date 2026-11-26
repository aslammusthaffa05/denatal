import { Check, Circle } from 'lucide-react'
import { formatDateTime, STATUS_LABELS } from '../lib/format'

const STEPS = ['PAID', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED']

/**
 * Amazon-style tracker: a progress bar of the standard steps, then the detailed
 * history with timestamps and notes written by the clinic.
 */
export default function OrderTimeline({ order }) {
  if (order.status === 'PENDING_PAYMENT') {
    return (
      <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Your order is reserved but not paid yet. Complete the payment to confirm it.
      </p>
    )
  }

  const cancelled = order.status === 'CANCELLED' || order.status === 'PAYMENT_FAILED'
  const currentIndex = STEPS.indexOf(order.status)
  const history = [...(order.history || [])].reverse()

  return (
    <div>
      {order.status === 'PAYMENT_FAILED' && (
        <p className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          Payment failed. Your money has been refunded to your original payment method. Please place the order again.
        </p>
      )}
      {!cancelled && (
        <ol className="grid grid-cols-5 gap-1" aria-label="Order progress">
          {STEPS.map((step, i) => {
            const done = i <= currentIndex
            return (
              <li key={step} className="flex flex-col items-center text-center">
                <div className="flex w-full items-center">
                  <span className={`h-1 flex-1 rounded-full ${i === 0 ? 'opacity-0' : done ? 'bg-brand-500' : 'bg-sand-200'}`} />
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${done ? 'border-brand-600 bg-brand-600 text-white' : 'border-sand-200 bg-white text-ink-300'}`}>
                    {done ? <Check size={16} /> : <Circle size={10} />}
                  </span>
                  <span className={`h-1 flex-1 rounded-full ${i === STEPS.length - 1 ? 'opacity-0' : i < currentIndex ? 'bg-brand-500' : 'bg-sand-200'}`} />
                </div>
                <span className={`mt-2 text-[11px] font-semibold leading-tight sm:text-xs ${done ? 'text-ink-900' : 'text-ink-300'}`}>
                  {STATUS_LABELS[step]}
                </span>
              </li>
            )
          })}
        </ol>
      )}

      {order.trackingNumber && (
        <div className="mt-6 rounded-xl bg-brand-50 px-4 py-3 text-sm">
          <span className="font-semibold text-brand-800">Tracking:</span>{' '}
          <span className="text-ink-700">
            {order.courier ? `${order.courier} · ` : ''}
            <span className="font-mono">{order.trackingNumber}</span>
          </span>
        </div>
      )}

      <ul className="mt-6 space-y-4 border-l-2 border-sand-200 pl-5">
        {history.map((event, i) => (
          <li key={`${event.status}-${event.createdAt}-${i}`} className="relative">
            <span className={`absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-white ${i === 0 ? 'bg-brand-600 ring-4 ring-brand-100' : 'bg-ink-300'}`} />
            <p className="text-sm font-semibold">{STATUS_LABELS[event.status] || event.status}</p>
            {event.note && <p className="text-sm text-ink-500">{event.note}</p>}
            <p className="mt-0.5 text-xs text-ink-300">{formatDateTime(event.createdAt)}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
