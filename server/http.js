import { dispatch, handleWebhook } from './app.js'
import { getUserFromRequest } from './auth.js'

const MAX_BODY = 1_000_000

function readRaw(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', (c) => {
      size += c.length
      if (size > MAX_BODY) {
        reject(new Error('Body too large'))
        req.destroy()
        return
      }
      chunks.push(c)
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function send(res, status, json) {
  res.statusCode = status
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  if (status === 204 || json === undefined) return res.end()
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(json))
}

/** Works both as a Vercel function and inside dev-server.js (plain Node req/res). */
export async function apiHandler(req, res, getUser = getUserFromRequest) {
  const url = new URL(req.url, 'http://localhost')
  let body
  if (req.method !== 'GET' && req.method !== 'DELETE') {
    try {
      if (req.body !== undefined && req.body !== null && typeof req.body !== 'string') body = req.body // Vercel already parsed it
      else {
        const raw = typeof req.body === 'string' ? req.body : await readRaw(req)
        body = raw ? JSON.parse(raw) : {}
      }
    } catch {
      return send(res, 400, { error: 'Invalid request body' })
    }
  }
  const { status, json } = await dispatch({
    method: req.method,
    path: url.pathname,
    query: Object.fromEntries(url.searchParams),
    body,
    req,
    getUser,
  })
  send(res, status, json)
}

export async function webhookHandler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' })
  let raw
  try {
    raw = await readRaw(req)
  } catch {
    return send(res, 400, { error: 'Invalid request' })
  }
  const { status, json } = await handleWebhook(raw, req.headers['x-razorpay-signature'])
  send(res, status, json)
}
