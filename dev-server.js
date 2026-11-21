// Local API server (port 3001). `npm run dev` starts this together with Vite, which proxies /api here.
import { createServer } from 'node:http'
import { apiHandler, webhookHandler } from './server/http.js'

const port = Number(process.env.API_PORT || 3001)

createServer((req, res) => {
  const path = (req.url || '').split('?')[0]
  const run = path === '/api/payments/razorpay/webhook' ? webhookHandler : apiHandler
  run(req, res).catch((e) => {
    console.error(e)
    res.statusCode = 500
    res.end(JSON.stringify({ error: 'Something went wrong. Please try again.' }))
  })
}).listen(port, () => console.log(`API ready on http://localhost:${port}`))
