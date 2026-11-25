import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { ensureDB } from './config/db.js';
import publicRoutes from './routes/public.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import paymentRoutes, { webhookHandler } from './routes/payments.js';
import galleryRoutes from './routes/gallery.js';
import videoRoutes from './routes/videos.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();
  app.set('trust proxy', 1); // behind Render / Railway / Vercel / Nginx

  app.use(helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'script-src': ["'self'", 'https://checkout.razorpay.com'],
        'frame-src': ["'self'", 'https://api.razorpay.com', 'https://checkout.razorpay.com', 'https://www.google.com', 'https://maps.google.com'],
        'connect-src': ["'self'", 'https://api.razorpay.com', 'https://lumberjack.razorpay.com', 'https://fonts.googleapis.com', 'https://fonts.gstatic.com'],
        'img-src': ["'self'", 'data:', 'https:', 'https://res.cloudinary.com'],
        'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        'font-src': ["'self'", 'https://fonts.gstatic.com'],
        'object-src': ["'none'"],
        'frame-ancestors': ["'none'"],
      },
    },
    // Additional security headers
    xssFilter: true,
    nosniff: true,
    frameguard: { action: 'deny' },
    dnsPrefetch: { allow: false },
  }));
  // Strictly anchored allowlist for frontend origins:
  // - env.clientUrl and env.clientOrigins (configured per environment)
  // - Local development (http://localhost:5173)
  // - Official production domain (https://shribrahmadevadevasthan.org)
  // - Project-specific Vercel preview deployments (^https://brahmadev-kallali(?:-[a-z0-9-]+)?\.vercel\.app$)
  const allowedOrigins = [
    env.clientUrl,
    'http://localhost:5173',
    'https://shribrahmadevadevasthan.org',
    'https://www.shribrahmadevadevasthan.org',
    /^https:\/\/brahmadev-kallali(?:-[a-z0-9-]+)?\.vercel\.app$/,
    ...env.clientOrigins,
  ].filter(Boolean);

  app.use(cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (mobile apps, server-to-server, curl)
      if (!origin) return cb(null, true);
      const ok = allowedOrigins.some((o) =>
        typeof o === 'string' ? o === origin : o.test(origin)
      );
      cb(null, ok);
    },
    credentials: true,
  }));
  app.use(morgan(env.isProd ? 'combined' : 'dev'));

  // Razorpay webhook needs the raw body, so it goes before express.json().
  app.post('/api/payments/webhook', ...webhookHandler);

  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());
  // Global rate limiter: 300 requests per minute per IP (allows ~5 req/sec)
  app.use('/api', rateLimit({
    windowMs: 60 * 1000,
    limit: 300,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many requests from this IP. Please try again later.' },
  }));

  // Enhanced health check with DB status
  app.get('/api/health', async (_req, res) => {
    try {
      await ensureDB();
      res.json({ ok: true, db: 'connected' });
    } catch (e) {
      res.status(503).json({ ok: true, db: 'disconnected', error: 'Database connection issue' });
    }
  });

  // Ensure DB connection for all API routes (Vercel Serverless)
  app.use('/api', async (_req, res, next) => {
    try {
      await ensureDB();
      next();
    } catch (err) {
      console.error('DB Connection Middleware Error:', err);
      res.status(500).json({ error: 'Database connection failed' });
    }
  });

  app.use('/api/public', publicRoutes);
  app.use('/api/auth', authRoutes);
  // CSRF protection for admin routes - exempted for API (token-based)
  // Admin uses JWT cookies, CSRF via double-submit cookie pattern
  app.use('/api/admin', adminRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/gallery', galleryRoutes);
  app.use('/api/gallery', videoRoutes);
  app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

  // In production, Express also serves the built React app.
  const clientDist = path.resolve(__dirname, '../../client/dist');
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist, { maxAge: '7d', index: false }));
    app.get('*', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
  }

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    // 1. Mongoose CastError (invalid ObjectId or format)
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format.' });
    }

    // 2. Mongoose ValidationError
    if (err.name === 'ValidationError') {
      const msg = err.errors ? Object.values(err.errors)[0]?.message : err.message;
      return res.status(400).json({ error: msg || 'Validation failed.' });
    }

    // 3. Multer errors (e.g. LIMIT_FILE_SIZE)
    if (err.name === 'MulterError' || err.code === 'LIMIT_FILE_SIZE') {
      const msg = err.code === 'LIMIT_FILE_SIZE'
        ? 'File size exceeds allowable limit.'
        : err.message || 'File upload error.';
      return res.status(400).json({ error: msg });
    }

    // 4. Multer file-filter errors
    if (err.message && (err.message.includes('files are allowed') || err.message.includes('image files') || err.message.includes('video files'))) {
      return res.status(400).json({ error: err.message });
    }

    // 5. Cloudinary / Network Timeout error
    if (err.name === 'TimeoutError' || err.http_code === 499 || err.message?.includes('timed out')) {
      return res.status(408).json({
        error: 'Image upload timed out due to slow network. Please try again with a compressed or smaller image.'
      });
    }

    // 6. Catch-all: only 5xx errors get logged and return the generic message
    const status = (typeof err.status === 'number' && err.status >= 400 && err.status < 600)
      ? err.status
      : (typeof err.statusCode === 'number' && err.statusCode >= 400 && err.statusCode < 600)
        ? err.statusCode
        : 500;

    if (status >= 500) {
      console.error(err);
      return res.status(status).json({ error: 'Something went wrong on the server. Please try again.' });
    }

    return res.status(status).json({ error: err.message || 'Bad request.' });
  });

  return app;
}
