export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

export const bad = (message) => new ApiError(400, message)

export const clean = (v) => {
  if (v == null) return null
  const t = String(v).trim()
  return t === '' ? null : t
}

export const PHONE_RE = /^[0-9+\- ]{7,20}$/
export const PINCODE_RE = /^[1-9][0-9]{5}$/

/** Parses a path id like "12". Anything else is treated as "does not exist". */
export function parseId(value, what = 'Not found') {
  const n = Number(value)
  if (!Number.isInteger(n) || n < 1 || n > 2147483647) throw new ApiError(404, what)
  return n
}

export const toPaise = (amount) => Math.round(Number(amount) * 100)
