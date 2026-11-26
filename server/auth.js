import { createClerkClient, verifyToken } from '@clerk/backend'
import { ApiError } from './util.js'

let clerk
const cache = new Map() // clerk user id -> { at, user }
const TTL_MS = 60_000

/**
 * Reads the Clerk session token from "Authorization: Bearer ...", verifies it with Clerk,
 * and returns { id, name, email, phone, isAdmin } - or null when nobody is logged in.
 * The ADMIN role comes ONLY from Clerk: the user's *public metadata* must be {"role": "admin"}.
 * Only you can set it (Clerk dashboard); customers can never change public metadata themselves.
 */
export async function getUserFromRequest(req) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
  if (!token) return null

  let userId
  try {
    const payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY })
    userId = payload.sub
  } catch {
    return null
  }
  if (!userId) return null

  const hit = cache.get(userId)
  if (hit && Date.now() - hit.at < TTL_MS) return hit.user

  clerk ??= createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })
  let cu
  try {
    cu = await clerk.users.getUser(userId)
  } catch {
    throw new ApiError(401, 'Authentication required')
  }
  const primary = cu.emailAddresses.find((e) => e.id === cu.primaryEmailAddressId) || cu.emailAddresses[0]
  const email = (primary?.emailAddress || '').toLowerCase()
  const verified = primary?.verification?.status === 'verified'
  const phone = cu.phoneNumbers.find((p) => p.id === cu.primaryPhoneNumberId)?.phoneNumber || ''
  const name =
    [cu.firstName, cu.lastName].filter(Boolean).join(' ').trim() || cu.username || email.split('@')[0] || 'Customer'

  const user = { id: userId, name, email, phone, isAdmin: verified && cu.publicMetadata?.role === 'admin' }
  cache.set(userId, { at: Date.now(), user })
  return user
}
