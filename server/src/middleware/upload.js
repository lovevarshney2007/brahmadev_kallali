import crypto from 'node:crypto';
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

// --- HASH UTILITY ---

/** Compute SHA-256 hash of a buffer — used for server-side duplicate detection */
export function computeHash(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

// --- IMAGE UPLOAD (5 MB max) ---

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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

/**
 * Upload an image buffer to Cloudinary.
 * Applies automatic WebP/AVIF formatting, quality compression, and 1600px dimension ceiling.
 */
export async function uploadBuffer(buffer, mimetype) {
  if (!cloudinaryEnabled) {
    // Dev fallback: return a base64 data URL (not for production)
    const b64 = buffer.toString('base64');
    return { imageUrl: `data:${mimetype};base64,${b64}`, publicId: '' };
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'brahmadev_gallery',
        resource_type: 'image',
        transformation: [
          { width: 1600, height: 1600, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({ imageUrl: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

// --- VIDEO UPLOAD (100 MB max) ---

export const uploadVideoMiddleware = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'video/mp4', 'video/quicktime', 'video/webm',
      'video/x-msvideo', 'video/mpeg', 'video/3gpp', 'video/3gpp2',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only MP4, MOV, WebM, AVI, MPEG and 3GP video files are allowed.'));
    }
  },
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
});

/**
 * Upload a video buffer to Cloudinary.
 * Cloudinary auto-generates a thumbnail from the first frame.
 */
export async function uploadVideoBuffer(buffer, mimetype) {
  if (!cloudinaryEnabled) {
    // Dev fallback
    const b64 = buffer.toString('base64');
    return { videoUrl: `data:${mimetype};base64,${b64}`, publicId: '', thumbnailUrl: '' };
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'brahmadev_videos',
        resource_type: 'video',
        // Generate a thumbnail jpg from the first frame at upload time
        eager: [{ format: 'jpg', transformation: [{ width: 640, crop: 'scale', quality: 'auto' }] }],
        eager_async: false,
      },
      (error, result) => {
        if (error) return reject(error);
        // Use eager thumbnail if generated, else derive from the video URL
        const thumbnailUrl =
          result.eager?.[0]?.secure_url ||
          result.secure_url
            .replace('/video/upload/', '/video/upload/f_jpg,w_640/')
            .replace(/\.[^.]+$/, '.jpg');
        resolve({ videoUrl: result.secure_url, publicId: result.public_id, thumbnailUrl });
      }
    );
    stream.end(buffer);
  });
}

// --- DELETE ---

/**
 * Delete a media asset from Cloudinary.
 * @param {string} publicId - Cloudinary public ID
 * @param {'image'|'video'} resourceType - defaults to 'image'
 */
export async function deleteFromCloudinary(publicId, resourceType = 'image') {
  if (!cloudinaryEnabled || !publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    console.error('Cloudinary delete error:', err);
  }
}
