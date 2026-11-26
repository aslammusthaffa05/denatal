import { ensureSchema, db } from './db.js'
import * as orders from './orders.js'
import * as products from './products.js'
import { createImageUpload } from './r2.js'
import { verifyWebhookSignature } from './razorpay.js'
import { ApiError } from './util.js'

/**
 * The whole REST API in one place (same URLs and JSON as the old Spring Boot API).
 *   access: 'public' | 'user' (any logged-in customer) | 'admin' (only Clerk users with public metadata role = admin)
 */
const routes = [
  ['GET', /^\/api\/health$/, 'public', async () => ({ status: 'ok' })],

  ['GET', /^\/api\/auth\/me$/, 'user', async ({ user }) => {
    const { rows } = await db.query(
      `INSERT INTO users (id, name, email, phone) VALUES ($1,$2,$3,$4)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email,
         phone = COALESCE(NULLIF(EXCLUDED.phone, ''), users.phone)
       RETURNING phone`,
      [user.id, user.name, user.email, user.phone],
    )
    return { id: user.id, name: user.name, email: user.email, phone: rows[0].phone, role: user.isAdmin ? 'ADMIN' : 'USER' }
  }],

  ['GET', /^\/api\/products$/, 'public', ({ query }) => products.listProducts(query)],
  ['GET', /^\/api\/products\/categories$/, 'public', () => products.listCategories()],
  ['GET', /^\/api\/products\/([^/]+)$/, 'public', ({ m }) => products.getProduct(m[1])],

  ['POST', /^\/api\/orders$/, 'user', ({ user, body }) => orders.createOrder(user, body)],
  ['GET', /^\/api\/orders$/, 'user', ({ user }) => orders.myOrders(user)],
  ['GET', /^\/api\/orders\/([^/]+)$/, 'user', ({ user, m }) => orders.myOrder(user, m[1])],
  ['POST', /^\/api\/orders\/([^/]+)\/pay$/, 'user', ({ user, m }) => orders.paymentInfo(user, m[1])],
  ['POST', /^\/api\/orders\/([^/]+)\/verify-payment$/, 'user', ({ user, m, body }) => orders.verifyPayment(user, m[1], body)],

  ['GET', /^\/api\/admin\/stats$/, 'admin', () => orders.adminStats()],
  ['GET', /^\/api\/admin\/orders$/, 'admin', ({ query }) => orders.adminList(query.status || undefined)],
  ['PUT', /^\/api\/admin\/orders\/([^/]+)\/status$/, 'admin', ({ m, body }) => orders.adminUpdateStatus(m[1], body)],
  ['GET', /^\/api\/admin\/products$/, 'admin', () => products.listProducts()],
  ['POST', /^\/api\/admin\/products$/, 'admin', async ({ body }) => ({ __status: 201, data: await products.createProduct(body) })],
  ['PUT', /^\/api\/admin\/products\/([^/]+)$/, 'admin', ({ m, body }) => products.updateProduct(m[1], body)],
  ['DELETE', /^\/api\/admin\/products\/([^/]+)$/, 'admin', async ({ m }) => {
    await products.deleteProduct(m[1])
    return { __status: 204 }
  }],
  ['POST', /^\/api\/admin\/uploads\/image$/, 'admin', ({ body }) =>
    createImageUpload({ contentType: body?.contentType, size: Number(body?.size) })],
]

/** Returns { status, json }. `getUser(req)` is injected so tests can fake the login. */
export async function dispatch({ method, path, query = {}, body, req, getUser }) {
  try {
    const clean = path.length > 1 ? path.replace(/\/+$/, '') : path
    for (const [verb, pattern, access, handler] of routes) {
      if (verb !== method) continue
      const m = clean.match(pattern)
      if (!m) continue

      let user = null
      if (access !== 'public') {
        user = await getUser(req)
        if (!user) throw new ApiError(401, 'Authentication required')
        if (access === 'admin' && !user.isAdmin) throw new ApiError(403, 'Access denied')
      }
      if (clean !== '/api/health') await ensureSchema()
      const result = await handler({ m, query, body: body ?? {}, user })
      if (result && result.__status) return { status: result.__status, json: result.data }
      return { status: 200, json: result }
    }
    throw new ApiError(404, 'Not found')
  } catch (e) {
    if (e instanceof ApiError) return { status: e.status, json: { error: e.message } }
    console.error('Unhandled error on', method, path, e)
    return { status: 500, json: { error: 'Something went wrong. Please try again.' } }
  }
}

/** Razorpay -> us. Trusted only if the HMAC signature of the raw body is valid. */
export async function handleWebhook(rawBody, signature) {
  try {
    if (!verifyWebhookSignature(rawBody, signature)) throw new ApiError(400, 'Invalid signature')
    let root
    try {
      root = JSON.parse(rawBody)
    } catch {
      throw new ApiError(400, 'Invalid payload')
    }
    if (root.event === 'payment.captured' || root.event === 'order.paid') {
      const payment = root.payload?.payment?.entity || {}
      if (payment.order_id && payment.id) {
        await ensureSchema()
        await orders.handleProviderPaid(payment.order_id, payment.id)
      }
    }
    return { status: 200, json: { status: 'ok' } }
  } catch (e) {
    if (e instanceof ApiError) return { status: e.status, json: { error: e.message } }
    console.error('Webhook error', e)
    return { status: 500, json: { error: 'Something went wrong.' } }
  }
}
