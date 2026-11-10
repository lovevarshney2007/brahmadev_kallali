import { env, razorpayEnabled } from './config/env.js';
import { ensureDB } from './config/db.js';
import { createApp } from './app.js';

const app = createApp();

// Run standalone server if NOT on Vercel
if (!process.env.VERCEL) {
  await ensureDB();
  app.listen(env.port, () => {
    console.log(`API running on http://localhost:${env.port}`);
    console.log(razorpayEnabled ? 'Razorpay online payments: ON' : 'Razorpay online payments: OFF (UPI QR only)');
  });
}

export default app;
