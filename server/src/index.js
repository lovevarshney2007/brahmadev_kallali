import { env, razorpayEnabled } from './config/env.js';
import { connectDB } from './config/db.js';
import { createApp } from './app.js';
import { Admin } from './models/Admin.js';

// Connection singleton & auto-seed default admin
let connected = false;
async function ensureDB() {
  if (connected) return;
  await connectDB(env.mongoUri);
  connected = true;

  // Ensure default admin exists
  try {
    const email = (process.env.ADMIN_DEFAULT_EMAIL || 'admin@brahmadev.org').toLowerCase();
    const existing = await Admin.findOne({ email });
    if (!existing) {
      const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Brahmadev@2026';
      const passwordHash = await Admin.hashPassword(defaultPassword);
      await Admin.create({
        name: 'Temple Trustee',
        email,
        passwordHash,
      });
      console.log(`Default admin created: ${email}`);
    }
  } catch (err) {
    console.error('Admin auto-seed error:', err);
  }
}

const app = createApp();

// For Vercel Serverless: ensure DB connection on each request
app.use(async (req, res, next) => {
  try {
    await ensureDB();
    next();
  } catch (err) {
    console.error('DB Connection Error:', err);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Run standalone server if NOT on Vercel
if (!process.env.VERCEL) {
  await ensureDB();
  app.listen(env.port, () => {
    console.log(`API running on http://localhost:${env.port}`);
    console.log(razorpayEnabled ? 'Razorpay online payments: ON' : 'Razorpay online payments: OFF (UPI QR only)');
  });
}

export default app;
