import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { ah } from '../utils/asyncHandler.js';
import { Admin } from '../models/Admin.js';
import { COOKIE_NAME, cookieOptions, requireAdmin, signToken } from '../middleware/auth.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many sign-in attempts. Please wait 15 minutes and try again.' },
});

router.post('/login', loginLimiter, ah(async (req, res) => {
  const email = String(req.body.email || '').toLowerCase().trim();
  const password = String(req.body.password || '');
  const admin = email && (await Admin.findOne({ email }));
  if (!admin || !(await admin.checkPassword(password))) {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      return res.status(401).json({
        error: 'No admin accounts exist yet. Please use the initial setup to create your first admin.',
        needsSetup: true,
      });
    }
    return res.status(401).json({ error: 'Email or password is incorrect.' });
  }
  res.cookie(COOKIE_NAME, signToken(admin), cookieOptions);
  res.json({ admin: { id: admin._id, name: admin.name, email: admin.email } });
}));

// Setup initial admin if no admin exists in database
router.post('/setup-initial-admin', ah(async (req, res) => {
  const count = await Admin.countDocuments();
  if (count > 0) {
    return res.status(403).json({ error: 'An admin already exists. Please sign in.' });
  }
  const name = String(req.body.name || 'Trustee').trim();
  const email = String(req.body.email || '').toLowerCase().trim();
  const password = String(req.body.password || '');
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  if (password.length < 10) {
    return res.status(400).json({ error: 'Password must be at least 10 characters.' });
  }
  const passwordHash = await Admin.hashPassword(password);
  const admin = await Admin.create({ name, email, passwordHash });
  res.cookie(COOKIE_NAME, signToken(admin), cookieOptions);
  res.status(201).json({
    message: 'Admin account created successfully.',
    admin: { id: admin._id, name: admin.name, email: admin.email },
  });
}));

router.post('/logout', (_req, res) => {
  res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: undefined });
  res.json({ ok: true });
});

router.get('/me', requireAdmin, (req, res) => {
  res.json({ admin: { id: req.admin._id, name: req.admin.name, email: req.admin.email } });
});

router.post('/change-password', requireAdmin, ah(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const admin = await Admin.findById(req.admin._id);
  if (!(await admin.checkPassword(String(currentPassword || '')))) {
    return res.status(400).json({ error: 'Current password is incorrect.' });
  }
  if (String(newPassword || '').length < 10) {
    return res.status(400).json({ error: 'New password must be at least 10 characters.' });
  }
  admin.passwordHash = await Admin.hashPassword(newPassword);
  await admin.save();
  res.json({ ok: true });
}));

export default router;
