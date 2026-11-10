# Shri Kshetra Brahmadev Devasthan, Kallali — website

Official website of Shri Kshetra Brahmadev Devasthan, Kallali (Mukhed, Nanded, Maharashtra), built on the MERN stack:

- **MongoDB** stores donations, expenses, site details and admin accounts
- **Express + Node.js** API in `server/`
- **React** (Vite) frontend in `client/`

## What the site does

| Page | Who sees it | What it does |
|---|---|---|
| `/` | Everyone | Home, about, history, daily seva timings, festivals, how to reach, gallery, contact |
| `/donate` | Everyone | UPI QR code for the chosen amount, plus optional online payment (Razorpay) |
| `/ledger` | Everyone | Public **Daan Ledger**: total received, total spent, balance, charts by purpose, full lists |
| `/admin` | Trust only | Sign in; record daan and expenses, issue receipt numbers, edit UPI ID, timings, festivals, contact and announcement; download CSV for the accountant |

### How donations reach the ledger

1. **UPI QR (always on).** Devotees scan and pay straight into the trust's bank account. A trustee then records the payment in `/admin`, using the UPI app or bank statement. A receipt number like `BKD-2026-0001` is issued automatically.
2. **Online payment (optional, Razorpay).** When Razorpay keys are set, the Donate page shows a **Pay online** button. The payment is verified on the server and recorded in the ledger **automatically**, with an instant receipt number. A webhook also records it, in case the devotee closes the browser early.

### Transparency and safety built in

- Donor names are public **only** if the donor agreed. Phone numbers and private notes are never public.
- Only the last 4 characters of a payment reference are shown.
- Entries are never deleted. A wrong entry is **cancelled with a reason**, and cancelled entries stay visible to admins (audit trail).
- Each entry records which admin added it.
- Admin passwords are hashed with bcrypt. Sessions use an httpOnly cookie, and sign-in attempts are rate-limited.
- Razorpay payments are checked with HMAC signatures and re-fetched from Razorpay, so the browser can't fake an amount.

## Run it on your computer

You need **Node.js 18.18 or newer** and **MongoDB**. The easiest MongoDB is a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas); you can also install MongoDB Community locally.

```bash
# 1. Install everything
npm run install:all

# 2. Configure the server
cp server/.env.example server/.env
#    then edit server/.env: set MONGODB_URI and a long random JWT_SECRET

# 3. Add default timings/festivals and some EXAMPLE ledger entries
npm run seed

# 4. Create the first trust admin
npm run create-admin -- "Trustee Name" trustee@example.com "a-strong-password"

# 5. Start API (port 5000) and website (port 5173) together
npm run dev
```

Open http://localhost:5173. The trust login is at http://localhost:5173/admin.

Before going live, remove the example entries:

```bash
npm run seed -- --clear-examples
```

## Turn on automatic online donations (Razorpay)

1. Register the **trust** (not a person) at [razorpay.com](https://razorpay.com) and complete KYC with the trust's PAN, registration certificate and bank account.
2. In the Razorpay Dashboard, go to **Account & Settings → API Keys** and generate keys. Put them in `server/.env` as `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
3. Go to **Webhooks**, add `https://www.BrahmadevKallali.org/api/payments/webhook`, select the event **payment.captured**, choose a secret, and put that secret in `RAZORPAY_WEBHOOK_SECRET`.
4. Restart the server. The Donate page now shows **Pay online**.

Test first with `rzp_test_…` keys, then switch to live keys.

## Deploy to www.BrahmadevKallali.org

In production, one Node server serves both the API and the built React site.

```bash
npm run install:all
npm run build        # builds client/dist
npm start            # NODE_ENV=production, serves site + API on PORT
```

Hosting options:

- **Render / Railway** (simplest): create a Web Service from this repo. Use build command `npm run install:all && npm run build` and start command `npm start`, and add the variables from `.env.example` in their dashboard.
- **VPS** (Hostinger, DigitalOcean, AWS Lightsail): run `npm start` under PM2, put Nginx in front with HTTPS from Let's Encrypt.

Then point the domain's DNS to the host. Always use HTTPS, because the admin login cookie is marked `secure` in production.

## Project layout

```
server/
  src/
    app.js              Express app: security headers, routes, serves client/dist
    index.js            Starts the server
    config/             Environment and MongoDB connection
    models/             Donation, Expense, Settings, Admin, Counter (receipt numbers)
    routes/
      public.js         /api/public/settings, /summary, /donations, /expenses
      auth.js           /api/auth/login, /logout, /me, /change-password
      admin.js          /api/admin/... record, cancel, settings, CSV export
      payments.js       /api/payments/config, /order, /verify, /webhook
    services/           Ledger totals, Razorpay helpers
    scripts/            seed.js, createAdmin.js
client/
  src/
    pages/              Home, Donate, Ledger, admin/Login, admin/Dashboard
    components/         Header, Footer, decorative art, bar charts
    styles.css          Saffron / ivory / gold / maroon design, light and dark
```

## API reference

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/public/settings` | – | UPI ID, timings, festivals, contact, purposes |
| GET | `/api/public/summary` | – | Totals and breakdown by purpose |
| GET | `/api/public/donations?page=&limit=&purpose=` | – | Public donation list (names only with consent) |
| GET | `/api/public/expenses?page=&limit=&purpose=` | – | Public expense list |
| POST | `/api/auth/login` | – | `{email, password}` → sets session cookie |
| GET/POST | `/api/admin/donations` | Admin | List / record daan (issues receipt no.) |
| PATCH | `/api/admin/donations/:id/void` | Admin | Cancel with `{reason}` |
| GET/POST | `/api/admin/expenses` | Admin | List / record expense |
| PATCH | `/api/admin/expenses/:id/void` | Admin | Cancel with `{reason}` |
| GET/PUT | `/api/admin/settings` | Admin | Edit site details |
| GET | `/api/admin/export/donations.csv` | Admin | CSV for the accountant (also `expenses.csv`) |
| POST | `/api/payments/order` | – | Create Razorpay order |
| POST | `/api/payments/verify` | – | Verify checkout and record donation |
| POST | `/api/payments/webhook` | Signature | Razorpay `payment.captured` |

## Before going live: checklist for the trust

- [ ] Temple history, establishment year and significance (checked with elders)
- [ ] Darshan and aarti timings, festival dates (edit in `/admin → Site details`)
- [ ] Trust name, registration number, 80G status
- [ ] Trust bank account's UPI ID (not a personal account)
- [ ] Contact person, phone, email
- [ ] Real photos for the gallery (`client/src/pages/Home.jsx`, gallery section)
- [ ] Remove example ledger entries
- [ ] Donations from abroad need **FCRA registration**. Confirm with your CA before accepting them.
