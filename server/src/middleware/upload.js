import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { env, cloudinaryEnabled } from '../config/env.js';

// Configure Cloudinary
if (cloudinaryEnabled) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
  });
}

// Use memoryStorage so it works on Vercel serverless (no persistent disk)
export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WEBP and GIF image files are allowed.'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

/**
 * Upload a buffer (from memoryStorage) to Cloudinary.
 * Falls back to a data-URL if Cloudinary is not configured (dev/local only).
 */
export async function uploadBuffer(buffer, mimetype) {
  if (!cloudinaryEnabled) {
    // Dev fallback: return a base64 data URL (not for production)
    const b64 = buffer.toString('base64');
    return { imageUrl: `data:${mimetype};base64,${b64}`, publicId: '' };
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'brahmadev_gallery', resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve({ imageUrl: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

export async function deleteFromCloudinary(publicId) {
  if (!cloudinaryEnabled || !publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Cloudinary delete error:', err);
  }
}
