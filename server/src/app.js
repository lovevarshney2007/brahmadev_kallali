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
import publicRoutes from './routes/public.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import paymentRoutes, { webhookHandler } from './routes/payments.js';
import galleryRoutes from './routes/gallery.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();
  app.set('trust proxy', 1); // behind Render / Railway / Vercel / Nginx

  app.use(helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'script-src': ["'self'", 'https://checkout.razorpay.com'],
        'frame-src': ["'self'", 'https://api.razorpay.com', 'https://checkout.razorpay.com'],
        'connect-src': ["'self'", 'https://api.razorpay.com', 'https://lumberjack.razorpay.com'],
        'img-src': ["'self'", 'data:', 'https:'],
        'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        'font-src': ["'self'", 'https://fonts.gstatic.com'],
      },
    },
  }));
  // Allow frontend origin in production (set CLIENT_URL env var in Vercel backend project)
  const allowedOrigins = [
    env.clientUrl,                                       // CLIENT_URL env var
    'http://localhost:5173',                             // local dev
    /\.vercel\.app$/,                                    // any vercel preview
  ].filter(Boolean);
  app.use(cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (mobile, curl, Postman)
      if (!origin) return cb(null, true);
      const ok = allowedOrigins.some((o) =>
        typeof o === 'string' ? o === origin : o.test(origin)
      );
      cb(ok ? null : new Error('Not allowed by CORS'), ok);
    },
    credentials: true,
  }));
  app.use(morgan(env.isProd ? 'combined' : 'dev'));

  // Razorpay webhook needs the raw body, so it goes before express.json().
  app.post('/api/payments/webhook', ...webhookHandler);

  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());
  app.use('/api', rateLimit({ windowMs: 60 * 1000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false }));

  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  // Note: local /uploads not used on Vercel — images are stored on Cloudinary

  app.use('/api/public', publicRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/gallery', galleryRoutes);
  app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

  // In production, Express also serves the built React app.
  const clientDist = path.resolve(__dirname, '../../client/dist');
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist, { maxAge: '7d', index: false }));
    app.get('*', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
  }

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err.name === 'ValidationError' && err.errors) {
      return res.status(400).json({ error: Object.values(err.errors)[0].message });
    }
    const status = err.status || err.statusCode || 500;
    if (status >= 500) console.error(err);
    res.status(status).json({ error: status >= 500 ? 'Something went wrong on the server. Please try again.' : err.message });
  });

  return app;
}
