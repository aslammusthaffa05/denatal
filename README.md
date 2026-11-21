# BrightSmile Dental Care – Website + Product Store

Dental clinic website (Home, Our Doctor, Services, Contact) + online store with Razorpay payments,
order tracking and one admin panel. **UI and features are the same as before** – only the back end changed.

## Stack
| Part | Service |
|---|---|
| Language | **JavaScript only** (React 19 + Node serverless functions) – no Java |
| Front end | React + Vite + Tailwind CSS |
| Database | **Neon** (PostgreSQL) |
| Login | **Clerk** |
| Photo storage | **Cloudflare R2** |
| Payments | Razorpay (signature is verified on the server) |
| Hosting | **Vercel** (website + API together) |

```
Browser ──► Vercel ──► React site (static)
   │            └────► /api/* serverless function ──► Neon (Postgres)
   │                         │  verifies Clerk login   └► Razorpay (create order, verify signature)
   └─ photo upload ─────────►  Cloudflare R2 (signed URL from the function)
```

## Folders
- `src/` – React pages (unchanged UI)
- `api/` – Vercel entry points (`[...path].js` = whole REST API, `payments/razorpay/webhook.js`)
- `server/` – the API code: `app.js` (routes), `orders.js`, `products.js`, `auth.js`, `razorpay.js`, `r2.js`, `db.js`, `schema.js`
- `dev-server.js` – runs the API on your computer

Database tables are created **automatically** on the first request. You do not run any SQL.

---

## Setup (do these once, in order)

### 1. Neon – database
1. https://neon.com → sign up → **Create project**.
2. Click **Connect** → turn **Connection pooling ON** → copy the connection string.
   → this is `DATABASE_URL`.

### 2. Clerk – login
1. https://clerk.com → sign up → **Create application** → name it → choose **Email** (and Password) → Create.
2. Open **API keys** → copy the **Publishable key** → `VITE_CLERK_PUBLISHABLE_KEY`, and the **Secret key** → `CLERK_SECRET_KEY`.
3. `ADMIN_EMAIL` = the email address of the owner. Whoever signs up with exactly this email (and verifies it)
   becomes the admin. Nobody else can.

### 3. Cloudflare R2 – photos
1. https://dash.cloudflare.com → **R2 Object Storage** → enable R2 (needs a payment card; the free quota is 10 GB).
2. **Create bucket** (e.g. `dental-photos`) → `R2_BUCKET`.
3. Bucket → **Settings → Public access** → enable the **Public Development URL** (r2.dev) → copy it → `R2_PUBLIC_URL`
   (looks like `https://pub-xxxxxxxx.r2.dev`).
4. Bucket → **Settings → CORS Policy → Add** and paste (add your real Vercel address after step 6):
   ```json
   [
     {
       "AllowedOrigins": ["http://localhost:5173", "https://YOUR-SITE.vercel.app"],
       "AllowedMethods": ["PUT"],
       "AllowedHeaders": ["Content-Type"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```
5. R2 overview page → **Manage API tokens → Create API token** → permission **Object Read & Write**, choose your bucket →
   copy **Access Key ID** → `R2_ACCESS_KEY_ID` and **Secret Access Key** → `R2_SECRET_ACCESS_KEY`.
   Your **Account ID** (right side of the R2 page) → `R2_ACCOUNT_ID`.

### 4. Razorpay – payments
Dashboard in **Test Mode** → Account & Settings → API Keys → Generate Test Key →
`RAZORPAY_KEY_ID` (`rzp_test_…`) and `RAZORPAY_KEY_SECRET`. Use **live** keys only after you have tested everything.
**Never share the secret** and never put it in `src/`.

### 5. Run on your computer
Needs Node.js 20.6 or newer.
```bash
cp .env.example .env      # Windows: copy .env.example .env   -> then fill in every value
npm install
npm run dev               # website http://localhost:5173  (API runs on :3001 automatically)
```
Register in the app with your `ADMIN_EMAIL` → you will see **Admin** in the menu → add products.

### 6. Deploy on Vercel
1. Put the folder on GitHub (private repo). `.env` is ignored by git, so your secrets are not uploaded.
2. https://vercel.com → **Add New → Project** → import the repo (Framework: Vite is detected).
3. **Environment Variables**: add every name from `.env.example` with your values → **Deploy**.
4. Copy your site address (e.g. `https://dental.vercel.app`) into the R2 **CORS** list (step 3.4).
5. (Recommended) Razorpay → **Webhooks → Add**: URL `https://YOUR-SITE.vercel.app/api/payments/razorpay/webhook`,
   events `payment.captured` and `order.paid`, and a secret you choose → put the same text in
   `RAZORPAY_WEBHOOK_SECRET` on Vercel and redeploy. This marks orders paid even if the customer closes the browser.

Going live with Clerk: create a **Production** instance in Clerk, then replace the two Clerk keys on Vercel.

## Order & payment flow (safe)
1. Checkout → server reads **prices from the database**, creates the order `PENDING_PAYMENT` and a Razorpay order.
2. Customer pays in the Razorpay window.
3. Server verifies Razorpay's **HMAC-SHA256 signature** → only then the order is `PAID` and stock is reduced.
   (The webhook does the same, idempotently.)
4. Admin only ever sees `PAID` orders and moves them: Packing → Shipped (tracking number required) →
   Out for delivery → Delivered, or Cancelled (stock is restored). Customers see the timeline in *My orders*.

## Clinic text
Name, doctor, services, phone, address, map: `src/data/clinic.js`.
