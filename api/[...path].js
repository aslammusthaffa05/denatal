// One serverless function answers every /api/* request (keeps us far below Vercel's free function limit).
import { apiHandler } from '../server/http.js'

export default function handler(req, res) {
  return apiHandler(req, res)
}
