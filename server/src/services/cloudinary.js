import { v2 as cloudinary } from 'cloudinary';
import { env, cloudinaryEnabled } from '../config/env.js';

if (cloudinaryEnabled) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
  });
}

/**
 * Uploads a local file or buffer to Cloudinary
 * @param {string} filePath - Path to local file
 * @returns {Promise<{ imageUrl: string, publicId: string }>}
 */
export async function uploadToCloudinary(filePath) {
  if (!cloudinaryEnabled) {
    throw new Error('Cloudinary credentials not configured.');
  }

  const result = await cloudinary.uploader.upload(filePath, {
    folder: 'brahmadev_gallery',
    resource_type: 'image',
  });

  return {
    imageUrl: result.secure_url,
    publicId: result.public_id,
  };
}

/**
 * Deletes an image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 */
export async function deleteFromCloudinary(publicId) {
  if (!cloudinaryEnabled || !publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Cloudinary delete error:', err);
  }
}
