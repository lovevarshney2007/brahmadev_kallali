import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { Admin } from '../models/Admin.js';

export const COOKIE_NAME = 'bkd_token';

export function signToken(admin) {
  return jwt.sign({ sub: admin._id.toString() }, env.jwtSecret, { expiresIn: '7d' });
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: env.isProd,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export async function requireAdmin(req, res, next) {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) return res.status(401).json({ error: 'Please sign in.' });
    const payload = jwt.verify(token, env.jwtSecret);
    const admin = await Admin.findById(payload.sub).select('-passwordHash');
    if (!admin) return res.status(401).json({ error: 'Please sign in.' });
    req.admin = admin;
    next();
  } catch {
    res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
  }
}
