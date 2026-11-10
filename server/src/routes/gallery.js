import fs from 'node:fs';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { ah } from '../utils/asyncHandler.js';
import { Photo } from '../models/Photo.js';
import { uploadMiddleware } from '../middleware/upload.js';
import { requireAdmin } from '../middleware/auth.js';
import { cloudinaryEnabled } from '../config/env.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinary.js';

const router = Router();

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  message: { error: 'Too many uploads from this network. Please try again in 15 minutes.' },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

// 1. Public: List approved photos
router.get('/public/photos', ah(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 30, 100);
  const page = Math.max(Number(req.query.page) || 1, 1);
  const skip = (page - 1) * limit;

  const filter = { approved: true };
  if (req.query.event && req.query.event !== 'All') {
    filter.event = req.query.event;
  }

  const [items, total] = await Promise.all([
    Photo.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Photo.countDocuments(filter),
  ]);

  res.json({
    items: items.map((p) => p.toPublic()),
    page,
    pages: Math.ceil(total / limit) || 1,
    total,
  });
}));

// 2. Public: Upload photo from mobile/gallery
router.post('/public/photos/upload', uploadLimiter, uploadMiddleware.single('photo'), ah(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please select an image file to upload.' });
  }

  let imageUrl = `/uploads/${req.file.filename}`;
  let publicId = '';

  // If Cloudinary is configured, upload there instead of keeping it local
  if (cloudinaryEnabled) {
    try {
      const result = await uploadToCloudinary(req.file.path);
      imageUrl = result.imageUrl;
      publicId = result.publicId;
      // Clean up local file after cloud upload
      fs.unlink(req.file.path, () => {});
    } catch (err) {
      console.error('Cloudinary upload error:', err);
      // Fallback to local if cloudinary fails but file is already on disk
    }
  }

  const caption = String(req.body.caption || '').trim().slice(0, 300);
  const uploaderName = String(req.body.uploaderName || '').trim().slice(0, 120) || 'Devotee';
  const uploaderPhone = String(req.body.uploaderPhone || '').trim().slice(0, 20);
  const event = String(req.body.event || 'General').trim().slice(0, 100);

  const photo = await Photo.create({
    imageUrl,
    publicId,
    caption,
    uploaderName,
    uploaderPhone,
    event,
    approved: false, // Pending admin moderation
  });

  res.status(201).json({
    message: 'Dhanyawad! Photo received successfully. It will appear on the website once approved by the temple trust.',
    photo: photo.toPublic(),
  });
}));

// 3. Public: Like a photo
router.post('/public/photos/:id/like', ah(async (req, res) => {
  const photo = await Photo.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } }, { new: true });
  if (!photo) return res.status(404).json({ error: 'Photo not found.' });
  res.json({ likes: photo.likes });
}));

// ---- ADMIN ROUTES ----

// 4. Admin: Get all photos (pending & approved)
router.get('/admin/photos', requireAdmin, ah(async (req, res) => {
  const statusFilter = req.query.status; // 'pending', 'approved', or all
  const filter = {};
  if (statusFilter === 'pending') filter.approved = false;
  if (statusFilter === 'approved') filter.approved = true;

  const items = await Photo.find(filter).sort({ createdAt: -1 }).populate('approvedBy', 'name');
  const pendingCount = await Photo.countDocuments({ approved: false });

  res.json({ items, pendingCount });
}));

// 5. Admin: Approve a photo
router.patch('/admin/photos/:id/approve', requireAdmin, ah(async (req, res) => {
  const photo = await Photo.findByIdAndUpdate(
    req.params.id,
    { approved: true, approvedBy: req.admin._id },
    { new: true }
  );
  if (!photo) return res.status(404).json({ error: 'Photo not found.' });
  res.json(photo);
}));

// 6. Admin: Delete / Reject a photo
router.delete('/admin/photos/:id', requireAdmin, ah(async (req, res) => {
  const photo = await Photo.findByIdAndDelete(req.params.id);
  if (!photo) return res.status(404).json({ error: 'Photo not found.' });

  // Also delete from Cloudinary if publicId exists
  if (photo.publicId) {
    await deleteFromCloudinary(photo.publicId);
  }

  res.json({ message: 'Photo deleted successfully.' });
}));

export default router;
