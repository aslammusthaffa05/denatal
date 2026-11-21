import { webhookHandler } from '../../../server/http.js'

// We need the exact raw bytes of the request to check Razorpay's signature.
export const config = { api: { bodyParser: false } }

export default function handler(req, res) {
  return webhookHandler(req, res)
}
