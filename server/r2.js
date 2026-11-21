import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import crypto from 'node:crypto'
import { ApiError, bad } from './util.js'

const TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
const MAX_BYTES = 5 * 1024 * 1024

let client
function getClient() {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } = process.env
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !process.env.R2_BUCKET || !process.env.R2_PUBLIC_URL) {
    throw new ApiError(500, 'Image storage is not configured yet.')
  }
  client ??= new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
  })
  return client
}

/**
 * Admin-only. Returns a short-lived signed URL; the browser uploads the photo straight to
 * Cloudflare R2 (so the file never passes through our server) and then saves `url` on the product.
 */
export async function createImageUpload({ contentType, size }) {
  const ext = TYPES[contentType]
  if (!ext) throw bad('Only JPG, PNG or WebP images are allowed')
  if (!Number.isFinite(size) || size <= 0) throw bad('Please choose an image')
  if (size > MAX_BYTES) throw new ApiError(413, 'Image is too large (max 5 MB)')

  const key = `products/${Date.now()}-${crypto.randomBytes(5).toString('hex')}.${ext}`
  const uploadUrl = await getSignedUrl(
    getClient(),
    new PutObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key, ContentType: contentType }),
    { expiresIn: 300 },
  )
  const base = process.env.R2_PUBLIC_URL.replace(/\/+$/, '')
  return { uploadUrl, url: `${base}/${key}` }
}
