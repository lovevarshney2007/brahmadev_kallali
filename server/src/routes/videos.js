import { Router } from 'express';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import { ah } from '../utils/asyncHandler.js';
import { Video } from '../models/Video.js';
import {
  uploadVideoMiddleware,
  uploadVideoBuffer,
  deleteFromCloudinary,
  computeHash,
} from '../middleware/upload.js';
import { requireAdmin } from '../middleware/auth.js';
import { videoUploadInput } from '../utils/validate.js';

const router = Router();

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10, // Fewer video uploads per window (larger files)
  message: { error: 'Too many uploads from this network. Please try again in 15 minutes.' },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

const likeLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  message: { error: 'Too many likes from this network. Please slow down.' },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

// 1. Public: List approved videos
router.get('/public/videos', ah(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 30, 200);
  const page = Math.max(Number(req.query.page) || 1, 1);
  const skip = (page - 1) * limit;

  const filter = { approved: true };
  if (typeof req.query.event === 'string') {
    const event = req.query.event.trim();
    if (event && event !== 'All') {
      filter.event = event;
    }
  }

  const [items, total] = await Promise.all([
    Video.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Video.countDocuments(filter),
  ]);

  res.json({
    items: items.map((v) => v.toPublic()),
    page,
    pages: Math.ceil(total / limit) || 1,
    total,
  });
}));

// 2. Public: Upload video (supports direct Cloudinary upload JSON and 4 MB fallback)
router.post(
  '/public/videos/upload',
  uploadLimiter,
  (req, res, next) => {
    // If request has JSON body or already parsed body with videoUrl, skip multer
    if (req.is('json') || req.body?.videoUrl) {
      return next();
    }
    uploadVideoMiddleware.single('video')(req, res, next);
  },
  ah(async (req, res) => {
    // Validate form body
    const input = videoUploadInput(req.body);
    const idempotencyKey = req.headers['idempotency-key'] || req.body.idempotencyKey;

    let videoUrl = '';
    let publicId = '';
    let thumbnailUrl = '';
    let fileHash = '';

    // Direct Cloudinary upload flow (from client)
    if (req.body?.videoUrl) {
      videoUrl = String(req.body.videoUrl).trim();
      publicId = String(req.body.publicId || '').trim();

      // Validate videoUrl comes from Cloudinary or trusted CDN
      if (!/^https?:\/\/res\.cloudinary\.com\//.test(videoUrl)) {
        return res.status(400).json({ error: 'Invalid video URL source. Must be a secure Cloudinary URL.' });
      }

      // Check if publicId already exists (duplicate check)
      if (publicId) {
        const existing = await Video.findOne({ publicId });
        if (existing) {
          return res.status(409).json({
            error: 'This video has already been uploaded. Please choose a different video.',
            duplicate: true,
            video: existing.toPublic(),
          });
        }
      }

      thumbnailUrl = req.body.thumbnailUrl ||
        videoUrl
          .replace('/video/upload/', '/video/upload/f_jpg,w_640/')
          .replace(/\.[^.]+$/, '.jpg');
    } else {
      // Fallback: multipart file buffer upload (capped at 4 MB)
      if (!req.file) {
        return res.status(400).json({ error: 'Please select a video file to upload.' });
      }

      fileHash = computeHash(req.file.buffer);
      const existing = await Video.findOne({ fileHash });
      if (existing) {
        // Return existing video data so client can show success instead of error
        return res.status(409).json({
          error: 'This video has already been uploaded. Please choose a different video.',
          duplicate: true,
          video: existing.toPublic(),
        });
      }

      try {
        const result = await uploadVideoBuffer(req.file.buffer, req.file.mimetype);
        videoUrl = result.videoUrl;
        publicId = result.publicId;
        thumbnailUrl = result.thumbnailUrl;
      } catch (err) {
        console.error('Video upload error:', err);
        return res.status(500).json({ error: 'Video upload failed. Please try again.' });
      }
    }

    const video = await Video.create({
      videoUrl,
      publicId,
      thumbnailUrl,
      fileHash,
      caption: input.caption,
      uploaderName: input.uploaderName,
      uploaderPhone: input.uploaderPhone,
      event: input.event,
      approved: false, // Pending admin moderation
      // Store idempotency key if provided for audit trail
      ...(idempotencyKey && { idempotencyKey }),
    });

    res.status(201).json({
      message: 'Dhanyawad! Video received successfully. It will appear on the website once approved by the temple trust.',
      video: video.toPublic(),
    });
  })
);

// 3. Public: Like a video
router.post('/public/videos/:id/like', likeLimiter, ah(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Video not found.' });
  const video = await Video.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } }, { new: true });
  if (!video) return res.status(404).json({ error: 'Video not found.' });
  res.json({ likes: video.likes });
}));

// ---- ADMIN ROUTES ----

// 4. Admin: Get all videos (pending & approved)
router.get('/admin/videos', requireAdmin, ah(async (req, res) => {
  const statusFilter = typeof req.query.status === 'string' ? req.query.status.trim() : '';
  const filter = {};
  if (statusFilter === 'pending') filter.approved = false;
  if (statusFilter === 'approved') filter.approved = true;

  const items = await Video.find(filter).sort({ createdAt: -1 }).populate('approvedBy', 'name');
  const pendingCount = await Video.countDocuments({ approved: false });

  res.json({ items, pendingCount });
}));

// 5. Admin: Approve a video
router.patch('/admin/videos/:id/approve', requireAdmin, ah(async (req, res) => {
  const video = await Video.findByIdAndUpdate(
    req.params.id,
    { approved: true, approvedBy: req.admin._id },
    { new: true }
  );
  if (!video) return res.status(404).json({ error: 'Video not found.' });
  res.json(video);
}));

// 6. Admin: Delete / Reject a video
router.delete('/admin/videos/:id', requireAdmin, ah(async (req, res) => {
  const video = await Video.findByIdAndDelete(req.params.id);
  if (!video) return res.status(404).json({ error: 'Video not found.' });

  // Also delete from Cloudinary if publicId exists
  if (video.publicId) {
    await deleteFromCloudinary(video.publicId, 'video');
  }

  res.json({ message: 'Video deleted successfully.' });
}));

export default router;
