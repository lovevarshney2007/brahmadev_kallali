import { env, razorpayEnabled } from './config/env.js';
import { connectDB } from './config/db.js';
import { createApp } from './app.js';

// Connection singleton
let connected = false;
async function ensureDB() {
  if (connected) return;
  await connectDB(env.mongoUri);
  connected = true;
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
