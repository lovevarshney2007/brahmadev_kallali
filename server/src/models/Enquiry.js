import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 120,
      default: '',
    },
    type: {
      type: String,
      enum: ['General', 'Temple Visit', 'Worship / Pooja', 'Yatra', 'Donation', 'Other'],
      default: 'General',
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ['pending', 'responded', 'archived'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

export const Enquiry = mongoose.model('Enquiry', enquirySchema);
