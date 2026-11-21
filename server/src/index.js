import { env, razorpayEnabled } from './config/env.js';
import { ensureDB } from './config/db.js';
import { createApp } from './app.js';
import mongoose from 'mongoose';

const app = createApp();

// Graceful shutdown handler - prevents data loss on termination
let server;
let setExitTimeout;

async function handleShutdown(signal) {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  setExitTimeout = setTimeout(() => {
    console.error('Force shutdown after 30s timeout');
    process.exit(1);
  }, 30000);

  if (server) {
    await new Promise(resolve => server.close(resolve));
    console.log('HTTP server closed successfully');
  }

  // Close DB connection gracefully (Mongoose v8+ uses promises)
  await mongoose.connection.close(false);
  console.log('Database connection closed');
  process.exit(0);
}

// Run standalone server if NOT on Vercel
if (!process.env.VERCEL) {
  await ensureDB();
  server = app.listen(env.port, () => {
    console.log(`API running on http://localhost:${env.port}`);
    console.log(razorpayEnabled ? 'Razorpay online payments: ON' : 'Razorpay online payments: OFF (UPI QR only)');
  });

  // Graceful shutdown handlers
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
}

// Process-level crash handlers - prevent silent failures
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Promise Rejection:', reason);
  if (!process.env.VERCEL) {
    process.exit(1);
  }
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  if (!process.env.VERCEL) {
    process.exit(1);
  }
});

export default app;
