import crypto from 'node:crypto'
import { ApiError } from './util.js'

const keyId = () => process.env.RAZORPAY_KEY_ID
const keySecret = () => process.env.RAZORPAY_KEY_SECRET

export const getKeyId = () => keyId()

/** Creates a Razorpay order for the amount (in paise) and returns its id. */
export async function createRazorpayOrder(amountPaise, receipt) {
  if (!keyId() || !keySecret()) throw new ApiError(502, 'Payments are not configured yet.')
  let res
  try {
    res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(`${keyId()}:${keySecret()}`).toString('base64'),
      },
      body: JSON.stringify({ amount: amountPaise, currency: 'INR', receipt }),
    })
  } catch {
    throw new ApiError(502, 'Could not start the payment. Please try again.')
  }
  const data = await res.json().catch(() => null)
  if (!res.ok || !data?.id) throw new ApiError(502, 'Could not start the payment. Please try again.')
  return data.id
}

function hmacMatches(data, secret, providedHex) {
  if (!secret || !providedHex) return false
  const expected = crypto.createHmac('sha256', secret).update(data).digest('hex')
  const a = Buffer.from(expected)
  const b = Buffer.from(String(providedHex).trim().toLowerCase())
  return a.length === b.length && crypto.timingSafeEqual(a, b) // constant-time
}

/** Checkout callback signature: HMAC_SHA256(order_id + "|" + payment_id, key_secret). */
export const verifyPaymentSignature = (orderId, paymentId, signature) =>
  hmacMatches(`${orderId}|${paymentId}`, keySecret(), signature)

/** Webhook signature: HMAC_SHA256(raw request body, webhook_secret). */
export const verifyWebhookSignature = (rawBody, signature) =>
  hmacMatches(rawBody, process.env.RAZORPAY_WEBHOOK_SECRET || '', signature)

/** Asks Razorpay directly which payments exist for an order. Returns [] if Razorpay cannot be reached. */
export async function fetchOrderPayments(razorpayOrderId) {
  if (!keyId() || !keySecret() || !razorpayOrderId) return []
  try {
    const res = await fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(razorpayOrderId)}/payments`, {
      headers: { Authorization: 'Basic ' + Buffer.from(`${keyId()}:${keySecret()}`).toString('base64') },
    })
    const data = await res.json().catch(() => null)
    return res.ok && Array.isArray(data?.items) ? data.items : []
  } catch {
    return []
  }
}