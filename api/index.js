// Receives every /api/... request through the rewrite in vercel.json (see server/http.js).
import { apiHandler } from '../server/http.js'

export default function handler(req, res) {
  return apiHandler(req, res)
}
