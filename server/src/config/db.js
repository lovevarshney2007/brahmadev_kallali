import mongoose from 'mongoose';
import { env } from './env.js';
import { Admin } from '../models/Admin.js';

let isConnecting = null;

export async function connectDB(uri = env.mongoUri) {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (isConnecting) return isConnecting;

  mongoose.set('strictQuery', true);
  isConnecting = mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  }).then(async (conn) => {
    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    isConnecting = null;

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

    return conn;
  }).catch((err) => {
    isConnecting = null;
    throw err;
  });

  return isConnecting;
}

export async function ensureDB() {
  if (mongoose.connection.readyState === 1) return;
  await connectDB(env.mongoUri);
}
