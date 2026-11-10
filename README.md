# Shri Kshetra Brahmadev Devasthan, Kallali — Official Website

Official website and digital seva portal of Shri Kshetra Brahmadev Devasthan, Kallali (Mukhed, Nanded, Maharashtra), built on a production-grade MERN stack:

- **MongoDB** stores donations, expenses, temple settings, admin accounts, and community photo records.
- **Express + Node.js** API in `server/` with rate limiting, Helmet security headers, cookie sessions, Zod validation, and Cloudinary media processing.
- **React 18 + Vite** frontend in `client/` featuring accessible design, Sonner toasts, route lazy-loading, and mobile-first responsive UI.
- **Cloudinary** for image optimization, secure cloud storage, and automated moderation assets.

---

## What the Site Does

| Route | Audience | Key Capabilities |
|---|---|---|
| `/` | Public | Temple history, deity significance, daily darshan & aarti schedule, upcoming festivals, route guide & Google Map, contact information (Maruti Kunjatwad: 9503131031). |
| `/gallery` | Public | Community darshan photo gallery, event filter (Yatra, Kartik Utsav, etc.), like system, and **Share Your Photo** portal with direct mobile camera capture & gallery upload. |
| `/donate` | Public | Dynamic UPI QR generator with custom amounts, bank details, and optional direct online payments via Razorpay. |
| `/ledger` | Public | Completely transparent public **Daan Ledger**: total offerings, total expenses, verified bank balance, purpose breakdowns, and searchable donation receipts. |
| `/admin/login` | Trust Admin | Secure admin authentication with bcrypt, rate limiting, and HTTP-only JWT cookies. |
| `/admin` | Trust Admin | Dashboard for issuing receipts, voiding erroneous entries with audit logs, moderating devotee photo submissions, editing temple timings, updating UPI/bank details, and downloading accountant-ready CSV files. |

---

## Photo Gallery & Live Devotee Uploads

Devotees visiting the temple can submit darshan photos directly to the temple website:

1. **Camera & Gallery Picker**: Devotees can click **📸 Take with Camera** (using mobile HTML5 environment capture) or **🖼️ Choose from Gallery**.
2. **Instant Preview & Retake Bar**: A preview of the selected image appears with quick **Retake**, **Change**, and **Remove** actions.
3. **Safety & Validation**: Enforces maximum file size of 5 MB and valid image types (JPEG, PNG, WebP) with client-side and server-side checks.
4. **Trust Moderation Workflow**: Devotee uploads do NOT go live immediately. They are routed into a moderation queue (`/admin → Gallery Moderation`), where trustees can approve or reject them before they appear publicly.
5. **Private Contact Info**: Devotee phone numbers are stored strictly for office verification and are never exposed publicly.

---

## Transparency & Security Standards

- **Donor Privacy**: Donor names appear on the public ledger only if explicit consent is given. Phone numbers and notes remain private.
- **Payment Reference Protection**: Only the last 4 digits of UPI / bank transaction references are displayed.
- **Immutable Audit Trail**: Ledger entries are never deleted. Mistakes are cancelled with a mandatory reason, preserving a complete audit record.
- **Rate Limiting & Security Headers**: Helmet CSP headers protect against XSS/injections; API endpoints are protected by `express-rate-limit`.
- **Zod & Mongoose Validation**: Every form and API payload is validated before hitting the database.
- **Optimized Performance**: Production build uses React `Suspense` and `React.lazy` for sub-second page loads.

---

## Local Development Setup

### Prerequisites
- **Node.js**: v18.18 or newer
- **MongoDB**: Local MongoDB instance or free [MongoDB Atlas](https://www.mongodb.com/atlas) URI

### Quickstart

```bash
# 1. Install all root, server, and client dependencies
npm run install:all

# 2. Configure environment files
cp server/.env.example server/.env
cp client/.env.example client/.env

# 3. Fill in server/.env with your MongoDB URI, JWT secret, and Cloudinary keys:
# MONGODB_URI=mongodb+srv://...
# JWT_SECRET=your-random-jwt-secret-at-least-32-chars
# CLOUDINARY_CLOUD_NAME=...
# CLOUDINARY_API_KEY=...
# CLOUDINARY_API_SECRET=...

# 4. Seed initial temple details and admin account
npm run seed --prefix server
# Or create a custom admin:
npm run create-admin --prefix server -- "Trust Admin" admin@brahmadev.org "your-password"

# 5. Start development servers (Backend on :5000, Frontend on :5173)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Access the Admin portal at [http://localhost:5173/admin](http://localhost:5173/admin).

---

## Online Payment Setup (Razorpay - Optional)

1. Register an account for the temple trust at [razorpay.com](https://razorpay.com) and complete trust KYC.
2. Under **Account & Settings → API Keys**, generate your Key ID and Key Secret.
3. Add keys to `server/.env`:
   ```env
   RAZORPAY_KEY_ID=rzp_live_...
   RAZORPAY_KEY_SECRET=...
   ```
4. In Razorpay Dashboard under **Webhooks**, add your webhook URL:
   `https://<your-backend-domain>/api/payments/webhook` with event `payment.captured` and set `RAZORPAY_WEBHOOK_SECRET`.

---

## Deployment Guide (Vercel / Cloud)

### Architecture
- **Client**: Static SPA built via Vite to `client/dist`.
- **Server**: Express REST API running on Node.js / Vercel Serverless.

### Deploying Frontend to Vercel
1. Set the root directory of the frontend project to `client`.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Set environment variable:
   - `VITE_API_URL=/api` (or your full backend URL if hosted separately)
5. Ensure `client/vercel.json` rewrites `/api/:path*` to your backend URL:
   ```json
   {
     "rewrites": [
       {
         "source": "/api/:path*",
         "destination": "https://<your-backend-domain>/api/:path*"
       },
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```

### Deploying Backend to Vercel / Render / Railway
Add the following environment variables in your hosting dashboard:
- `NODE_ENV=production`
- `MONGODB_URI=mongodb+srv://...`
- `JWT_SECRET=supersecretstring`
- `CLIENT_URL=https://<your-frontend-domain>.vercel.app`
- `CLOUDINARY_CLOUD_NAME=...`
- `CLOUDINARY_API_KEY=...`
- `CLOUDINARY_API_SECRET=...`

### Common Deployment Troubleshooting
- **405 Method Not Allowed on `/admin/login`**: Happens when API requests are routed to the static frontend rather than `/api/auth/login`. Ensure `VITE_API_URL` is set to `/api` and that `vercel.json` rewrites `/api/:path*` to the backend.
- **404 Not Found on `/admin/photos`**: Ensure the backend has mounted both `/api/admin/photos` and `/api/gallery` routes and the latest server code is deployed.

---

## API Reference

### Public Endpoints
| Method | Path | Description |
|---|---|---|
| GET | `/api/public/settings` | Temple details, UPI ID, darshan timings, festivals, contact info |
| GET | `/api/public/summary` | Ledger summary totals and category breakdown |
| GET | `/api/public/donations` | Verified public donations list |
| GET | `/api/public/expenses` | Verified public expenses list |
| GET | `/api/gallery/public/photos` | Approved photo gallery with event filter and pagination |
| POST | `/api/gallery/public/photos/upload` | Devotee photo upload (`photo`, `uploaderName`, `phone`, `caption`, `event`) |
| POST | `/api/gallery/public/photos/:id/like` | Increment like count on a photo |

### Admin & Auth Endpoints
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | None | Trustee login, sets secure HTTP-only session cookie |
| POST | `/api/auth/logout` | Session | Clears session cookie |
| GET | `/api/auth/me` | Session | Get current authenticated trustee info |
| GET | `/api/admin/donations` | Admin | Searchable donation list (including voided records) |
| POST | `/api/admin/donations` | Admin | Issue official receipt and record new donation |
| PATCH | `/api/admin/donations/:id/void` | Admin | Cancel donation entry with audit explanation |
| GET | `/api/admin/expenses` | Admin | Searchable expense records |
| POST | `/api/admin/expenses` | Admin | Record temple expense |
| PATCH | `/api/admin/expenses/:id/void` | Admin | Cancel expense entry with audit explanation |
| GET | `/api/admin/photos` | Admin | Photo moderation queue (`status=pending`, `approved`, or `all`) |
| PATCH | `/api/admin/photos/:id/approve` | Admin | Approve community photo for public gallery |
| DELETE | `/api/admin/photos/:id` | Admin | Permanently delete rejected photo and remove from Cloudinary |
| GET/PUT | `/api/admin/settings` | Admin | View/update temple configuration, contact person, timings |
| GET | `/api/admin/export/donations.csv` | Admin | Export donations to CSV for trust chartered accountant |
| GET | `/api/admin/export/expenses.csv` | Admin | Export expenses to CSV |
