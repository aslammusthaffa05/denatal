import { db, tx } from './db.js'
import { createRazorpayOrder, fetchOrderPayments, getKeyId, verifyPaymentSignature } from './razorpay.js'
import { ApiError, PHONE_RE, PINCODE_RE, bad, clean, parseId, toPaise } from './util.js'

/*
 * Order rules (same as the old Java OrderService):
 *  - Prices are ALWAYS read from the database, never from the browser.
 *  - No cash on delivery: an order only becomes PAID after Razorpay's signature is verified.
 *  - Admin only ever sees orders whose payment is PAID.
 *  - Stock is reduced when payment is confirmed (under row locks) and restored if a paid order is cancelled.
 */

const MAX_QTY_PER_PRODUCT = 100
export const STATUSES = ['PENDING_PAYMENT', 'PAID', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']
const rank = (s) => STATUSES.indexOf(s)

// ---------------------------------------------------------------- DTO helpers

async function hydrate(conn, rows) {
  if (!rows.length) return []
  const ids = rows.map((r) => r.id)
  const items = (await conn.query(`SELECT * FROM order_items WHERE order_id = ANY($1) ORDER BY id`, [ids])).rows
  const events = (await conn.query(`SELECT * FROM order_events WHERE order_id = ANY($1) ORDER BY id`, [ids])).rows
  return rows.map((o) => ({
    id: o.id,
    status: o.status,
    paymentStatus: o.payment_status,
    totalAmount: o.total_amount,
    createdAt: o.created_at,
    paidAt: o.paid_at,
    shipping: {
      fullName: o.shipping_name,
      phone: o.shipping_phone,
      addressLine: o.shipping_address,
      city: o.shipping_city,
      state: o.shipping_state,
      pincode: o.shipping_pincode,
    },
    trackingNumber: o.tracking_number,
    courier: o.courier,
    customer: { name: o.customer_name, email: o.customer_email, phone: o.customer_phone },
    razorpayPaymentId: o.razorpay_payment_id,
    items: items
      .filter((i) => i.order_id === o.id)
      .map((i) => ({
        productId: i.product_id,
        productName: i.product_name,
        imageUrl: i.image_url,
        unitPrice: i.unit_price,
        quantity: i.quantity,
      })),
    history: events
      .filter((e) => e.order_id === o.id)
      .map((e) => ({ status: e.status, note: e.note, createdAt: e.created_at })),
  }))
}

const ORDER_SELECT = `SELECT o.*, u.name AS customer_name, u.email AS customer_email, u.phone AS customer_phone
                        FROM orders o JOIN users u ON u.id = o.user_id`

async function loadOne(conn, id) {
  const { rows } = await conn.query(`${ORDER_SELECT} WHERE o.id = $1`, [id])
  return (await hydrate(conn, rows))[0]
}

const addEvent = (conn, orderId, status, note) =>
  conn.query(`INSERT INTO order_events (order_id, status, note) VALUES ($1,$2,$3)`, [orderId, status, note])

// ---------------------------------------------------------------- customer

function validateShipping(s = {}) {
  const out = {
    fullName: clean(s.fullName),
    phone: clean(s.phone),
    addressLine: clean(s.addressLine),
    city: clean(s.city),
    state: clean(s.state),
    pincode: clean(s.pincode),
  }
  if (Object.values(out).some((v) => !v)) throw bad('Please fill in every delivery address field')
  if (out.fullName.length > 100 || out.city.length > 100 || out.state.length > 100 || out.addressLine.length > 300) {
    throw bad('One of the address fields is too long')
  }
  if (!PHONE_RE.test(out.phone)) throw bad('Enter a valid phone number')
  if (!PINCODE_RE.test(out.pincode)) throw bad('Enter a valid 6-digit pincode')
  return out
}

export async function createOrder(user, body = {}) {
  const lines = body.items
  if (!Array.isArray(lines) || lines.length === 0 || lines.length > 50) throw bad('Your cart is empty')
  const ship = validateShipping(body.shipping)

  // merge duplicate lines of the same product
  const quantities = new Map()
  for (const l of lines) {
    const productId = Number(l?.productId)
    const qty = Number(l?.quantity)
    if (!Number.isInteger(productId) || !Number.isInteger(qty) || qty < 1 || qty > MAX_QTY_PER_PRODUCT) {
      throw bad('Invalid quantity in your cart')
    }
    quantities.set(productId, (quantities.get(productId) || 0) + qty)
  }

  return tx(async (c) => {
    await c.query(
      `INSERT INTO users (id, name, email, phone) VALUES ($1,$2,$3,$4)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email`,
      [user.id, user.name, user.email, user.phone || ship.phone],
    )
    await c.query(`UPDATE users SET phone = $2 WHERE id = $1 AND phone = ''`, [user.id, ship.phone])

    const { rows: products } = await c.query(`SELECT * FROM products WHERE id = ANY($1)`, [[...quantities.keys()]])
    if (products.length !== quantities.size) {
      throw bad('Some items in your cart are no longer available. Please refresh your cart.')
    }

    let totalPaise = 0
    for (const p of products) {
      const qty = quantities.get(p.id)
      if (!p.active) throw bad(`${p.name} is no longer available`)
      if (p.stock < qty) throw bad(p.stock === 0 ? `${p.name} is out of stock` : `Only ${p.stock} left of ${p.name}`)
      totalPaise += toPaise(p.price) * qty
    }

    const {
      rows: [order],
    } = await c.query(
      `INSERT INTO orders (user_id, status, payment_status, total_amount,
                           shipping_name, shipping_phone, shipping_address, shipping_city, shipping_state, shipping_pincode)
       VALUES ($1,'PENDING_PAYMENT','PENDING',$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
      [user.id, totalPaise / 100, ship.fullName, ship.phone, ship.addressLine, ship.city, ship.state, ship.pincode],
    )
    for (const p of products) {
      await c.query(
        `INSERT INTO order_items (order_id, product_id, product_name, image_url, unit_price, quantity)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [order.id, p.id, p.name, p.image_url, p.price, quantities.get(p.id)],
      )
    }
    await addEvent(c, order.id, 'PENDING_PAYMENT', 'Order placed. Waiting for payment.')

    const razorpayOrderId = await createRazorpayOrder(totalPaise, `order_${order.id}`)
    await c.query(`UPDATE orders SET razorpay_order_id = $2 WHERE id = $1`, [order.id, razorpayOrderId])

    return {
      order: await loadOne(c, order.id),
      payment: { keyId: getKeyId(), razorpayOrderId, amount: totalPaise, currency: 'INR' },
    }
  })
}

async function findOwned(conn, userId, rawId, { lock = false } = {}) {
  const id = parseId(rawId, 'Order not found')
  // 404 (not 403) so nobody can probe which order numbers exist
  const { rows } = await conn.query(`SELECT * FROM orders WHERE id = $1 AND user_id = $2 ${lock ? 'FOR UPDATE' : ''}`, [id, userId])
  if (!rows[0]) throw new ApiError(404, 'Order not found')
  return rows[0]
}

/**
 * SELF-HEAL: if an order is still PENDING here but Razorpay says the money was captured
 * (browser closed, network dropped, webhook missing/failed), mark it PAID now.
 */
async function syncOrder(o) {
  if (!o || o.payment_status !== 'PENDING' || !o.razorpay_order_id) return false
  const payments = await fetchOrderPayments(o.razorpay_order_id)
  const ok = payments.find((p) => p.status === 'captured')
  if (!ok) return false
  await handleProviderPaid(o.razorpay_order_id, ok.id)
  return true
}

let lastSweep = 0
/** Checks every recent unpaid order against Razorpay (at most once per 20 seconds). */
async function reconcilePending() {
  if (Date.now() - lastSweep < 20_000) return
  lastSweep = Date.now()
  const { rows } = await db.query(
    `SELECT * FROM orders WHERE payment_status = 'PENDING' AND razorpay_order_id IS NOT NULL
        AND created_at > now() - interval '3 days' ORDER BY id DESC LIMIT 20`,
  )
  await Promise.allSettled(rows.map(syncOrder))
}

export async function myOrders(user) {
  const q = () => db.query(`${ORDER_SELECT} WHERE o.user_id = $1 ORDER BY o.created_at DESC, o.id DESC`, [user.id])
  let { rows } = await q()
  const pending = rows.filter((r) => r.payment_status === 'PENDING').slice(0, 5)
  if (pending.length) {
    const changed = await Promise.allSettled(pending.map(syncOrder))
    if (changed.some((r) => r.status === 'fulfilled' && r.value)) rows = (await q()).rows
  }
  return hydrate(db, rows)
}

export async function myOrder(user, rawId) {
  const o = await findOwned(db, user.id, rawId)
  await syncOrder(o).catch(() => {})
  return loadOne(db, o.id)
}

/** Lets a customer re-open the payment window for an order that is still unpaid. */
export async function paymentInfo(user, rawId) {
  let o = await findOwned(db, user.id, rawId)
  if (await syncOrder(o).catch(() => false)) o = await findOwned(db, user.id, rawId)
  if (o.payment_status === 'PAID') throw bad('This order is already paid')
  if (!o.razorpay_order_id) throw bad('This order cannot be paid')
  return { keyId: getKeyId(), razorpayOrderId: o.razorpay_order_id, amount: toPaise(o.total_amount), currency: 'INR' }
}

export async function verifyPayment(user, rawId, body = {}) {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = body
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) throw bad('Payment could not be verified')
  return tx(async (c) => {
    const order = await findOwned(c, user.id, rawId, { lock: true })
    if (!order.razorpay_order_id || order.razorpay_order_id !== razorpayOrderId) throw bad('Payment does not match this order')
    if (!verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) throw bad('Payment could not be verified')
    await markPaid(c, order, razorpayPaymentId)
    return loadOne(c, order.id)
  })
}

/** Idempotent: calling it twice (browser callback + webhook) has the same effect as once. */
async function markPaid(c, order, paymentId) {
  if (order.payment_status === 'PAID') return
  await c.query(
    `UPDATE orders SET payment_status='PAID', status='PAID', paid_at=now(), razorpay_payment_id=$2 WHERE id=$1`,
    [order.id, paymentId],
  )
  const { rows: items } = await c.query(`SELECT * FROM order_items WHERE order_id = $1`, [order.id])
  const { rows: locked } = await c.query(`SELECT id, stock FROM products WHERE id = ANY($1) ORDER BY id FOR UPDATE`, [
    items.map((i) => i.product_id),
  ])
  const stock = new Map(locked.map((p) => [p.id, p.stock]))
  let shortage = false
  for (const item of items) {
    if (!stock.has(item.product_id)) {
      shortage = true
      continue
    }
    let remaining = stock.get(item.product_id) - item.quantity
    if (remaining < 0) {
      shortage = true
      remaining = 0
    }
    stock.set(item.product_id, remaining)
    await c.query(`UPDATE products SET stock = $2, updated_at = now() WHERE id = $1`, [item.product_id, remaining])
  }
  await addEvent(c, order.id, 'PAID', 'Payment received. We are preparing your order.')
  if (shortage) await addEvent(c, order.id, 'PAID', 'Stock ran short while payment was completing. Please review this order.')
}

/** Called by the Razorpay webhook (server to server). */
export async function handleProviderPaid(razorpayOrderId, razorpayPaymentId) {
  await tx(async (c) => {
    const { rows } = await c.query(`SELECT * FROM orders WHERE razorpay_order_id = $1 FOR UPDATE`, [razorpayOrderId])
    if (rows[0]) await markPaid(c, rows[0], razorpayPaymentId)
  })
}

// ---------------------------------------------------------------- admin

export async function adminList(status) {
  await reconcilePending().catch(() => {})
  if (status && !STATUSES.includes(status)) throw bad('Invalid status')
  const { rows } = status
    ? await db.query(`${ORDER_SELECT} WHERE o.payment_status='PAID' AND o.status=$1 ORDER BY o.paid_at DESC, o.id DESC`, [status])
    : await db.query(`${ORDER_SELECT} WHERE o.payment_status='PAID' ORDER BY o.paid_at DESC, o.id DESC`)
  return hydrate(db, rows)
}

function defaultNote(status, tracking, courier) {
  switch (status) {
    case 'PROCESSING':
      return 'Your order is being packed.'
    case 'SHIPPED':
      return `Shipped with ${courier || 'our courier partner'}. Tracking number: ${tracking}.`
    case 'OUT_FOR_DELIVERY':
      return 'Your order is out for delivery.'
    case 'DELIVERED':
      return 'Your order has been delivered.'
    case 'CANCELLED':
      return 'Your order was cancelled. Any payment will be refunded to the original payment method.'
    default:
      return 'Status updated.'
  }
}

export async function adminUpdateStatus(rawId, body = {}) {
  const id = parseId(rawId, 'Order not found')
  const target = body.status
  return tx(async (c) => {
    const { rows } = await c.query(`SELECT * FROM orders WHERE id = $1 AND payment_status = 'PAID' FOR UPDATE`, [id])
    const order = rows[0]
    if (!order) throw new ApiError(404, 'Order not found')
    const current = order.status

    if (current === 'DELIVERED' || current === 'CANCELLED') throw bad('This order is already closed')
    if (!STATUSES.includes(target) || target === 'PENDING_PAYMENT' || target === 'PAID') throw bad('Invalid status')
    if (target !== 'CANCELLED' && rank(target) < rank(current)) throw bad('Status can only move forward')

    const tracking = clean(body.trackingNumber) ?? order.tracking_number
    const courier = clean(body.courier) ?? order.courier
    if (target === 'SHIPPED' && !tracking) throw bad('Enter a tracking number to mark this order as shipped')

    if (target === 'CANCELLED') {
      const { rows: items } = await c.query(`SELECT * FROM order_items WHERE order_id = $1`, [id])
      await c.query(`SELECT id FROM products WHERE id = ANY($1) ORDER BY id FOR UPDATE`, [items.map((i) => i.product_id)])
      for (const item of items) {
        await c.query(`UPDATE products SET stock = stock + $2, updated_at = now() WHERE id = $1`, [item.product_id, item.quantity])
      }
    }

    await c.query(`UPDATE orders SET status=$2, tracking_number=$3, courier=$4 WHERE id=$1`, [id, target, tracking, courier])
    await addEvent(c, id, target, clean(body.note) ?? defaultNote(target, tracking, courier))
    return loadOne(c, id)
  })
}

export async function adminStats() {
  await reconcilePending().catch(() => {})
  const [{ rows: totals }, { rows: byStatus }, { rows: prod }, recent] = await Promise.all([
    db.query(`SELECT count(*) AS paid_orders,
                     coalesce(sum(total_amount) FILTER (WHERE status <> 'CANCELLED'), 0) AS revenue
                FROM orders WHERE payment_status = 'PAID'`),
    db.query(`SELECT status, count(*) AS n FROM orders WHERE payment_status = 'PAID' GROUP BY status`),
    db.query(`SELECT count(*) AS products, count(*) FILTER (WHERE stock <= 5) AS low_stock FROM products WHERE active = TRUE`),
    db.query(`${ORDER_SELECT} WHERE o.payment_status='PAID' ORDER BY o.paid_at DESC, o.id DESC LIMIT 5`),
  ])
  const ordersByStatus = {}
  STATUSES.filter((s) => s !== 'PENDING_PAYMENT').forEach((s) => (ordersByStatus[s] = 0))
  byStatus.forEach((r) => (ordersByStatus[r.status] = r.n))
  return {
    paidOrders: totals[0].paid_orders,
    revenue: totals[0].revenue,
    products: prod[0].products,
    lowStock: prod[0].low_stock,
    ordersByStatus,
    recentOrders: await hydrate(db, recent.rows),
  }
}