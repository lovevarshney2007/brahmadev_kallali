import mongoose from 'mongoose';

const photoSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true },
    publicId: { type: String, default: '' }, // For cloud storage deletion
    fileHash: { type: String, default: '', index: { sparse: true } }, // SHA-256 hash for duplicate detection
    caption: { type: String, maxlength: 300, default: '' },
    uploaderName: { type: String, maxlength: 120, default: 'Devotee' },
    uploaderPhone: { type: String, maxlength: 20, default: '' }, // Private admin use only
    event: { type: String, maxlength: 100, default: 'General' },
    // Public uploads start as pending (approved: false) until temple admin approves them
    approved: { type: Boolean, default: false, index: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    likes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Indexes for fast retrieval and sorting
photoSchema.index({ approved: 1, createdAt: -1 });
photoSchema.index({ approved: 1, event: 1, createdAt: -1 });

// Format output for public visitors
photoSchema.methods.toPublic = function toPublic() {
  return {
    id: this._id,
    imageUrl: this.imageUrl,
    caption: this.caption,
    uploaderName: this.uploaderName,
    event: this.event,
    likes: this.likes,
    createdAt: this.createdAt,
  };
};

export const Photo = mongoose.model('Photo', photoSchema);
