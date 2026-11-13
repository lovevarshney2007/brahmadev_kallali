import { Router } from 'express';
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

// 1. Public: List approved videos
router.get('/public/videos', ah(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 30, 100);
  const page = Math.max(Number(req.query.page) || 1, 1);
  const skip = (page - 1) * limit;

  const filter = { approved: true };
  if (req.query.event && req.query.event !== 'All') {
    filter.event = req.query.event;
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

// 2. Public: Upload video (with duplicate detection)
router.post(
  '/public/videos/upload',
  uploadLimiter,
  uploadVideoMiddleware.single('video'),
  ah(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'Please select a video file to upload.' });
    }

    // Validate form body
    const input = videoUploadInput(req.body);

    // --- Duplicate detection: reject if another video with same SHA-256 hash exists ---
    const fileHash = computeHash(req.file.buffer);
    const existing = await Video.findOne({ fileHash });
    if (existing) {
      return res.status(409).json({
        error: 'This video has already been uploaded. Please choose a different video.',
      });
    }

    let videoUrl = '';
    let publicId = '';
    let thumbnailUrl = '';

    try {
      const result = await uploadVideoBuffer(req.file.buffer, req.file.mimetype);
      videoUrl = result.videoUrl;
      publicId = result.publicId;
      thumbnailUrl = result.thumbnailUrl;
    } catch (err) {
      console.error('Video upload error:', err);
      return res.status(500).json({ error: 'Video upload failed. Please try again.' });
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
    });

    res.status(201).json({
      message: 'Dhanyawad! Video received successfully. It will appear on the website once approved by the temple trust.',
      video: video.toPublic(),
    });
  })
);

// 3. Public: Like a video
router.post('/public/videos/:id/like', ah(async (req, res) => {
  const video = await Video.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } }, { new: true });
  if (!video) return res.status(404).json({ error: 'Video not found.' });
  res.json({ likes: video.likes });
}));

// ---- ADMIN ROUTES ----

// 4. Admin: Get all videos (pending & approved)
router.get('/admin/videos', requireAdmin, ah(async (req, res) => {
  const statusFilter = req.query.status;
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
