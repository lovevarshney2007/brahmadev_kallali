import mongoose from 'mongoose';
import { PURPOSES, DONATION_SOURCES } from './constants.js';

const donationSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true, index: true },
    donorName: { type: String, trim: true, maxlength: 120, default: '' },
    // Name is shown publicly only when the donor agreed.
    showName: { type: Boolean, default: false },
    phone: { type: String, trim: true, maxlength: 20, default: '' }, // private, never public
    amount: { type: Number, required: true, min: 1 }, // in rupees
    purpose: { type: String, enum: PURPOSES, default: 'General daan' },
    source: { type: String, enum: DONATION_SOURCES, default: 'upi' },
    // Only the last 4 characters of the UPI / bank reference are stored for public display.
    refLast4: { type: String, maxlength: 4, default: '' },
    receiptNo: { type: String, unique: true, sparse: true },
    razorpayPaymentId: { type: String, unique: true, sparse: true },
    razorpayOrderId: { type: String },
    note: { type: String, maxlength: 300, default: '' }, // private admin note
    // Entries are never deleted, only voided with a reason, so the ledger has an audit trail.
    voided: { type: Boolean, default: false, index: true },
    voidReason: { type: String, maxlength: 300, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    voidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  },
  { timestamps: true }
);

// Indexes for paginated ledger and fast aggregation
donationSchema.index({ voided: 1, date: -1, createdAt: -1 });
donationSchema.index({ voided: 1, purpose: 1, amount: 1 });

// What the public is allowed to see.
donationSchema.methods.toPublic = function toPublic() {
  return {
    id: this._id,
    date: this.date,
    donor: this.showName && this.donorName ? this.donorName : null,
    amount: this.amount,
    purpose: this.purpose,
    source: this.source,
    refLast4: this.refLast4 || null,
    receiptNo: this.receiptNo || null,
    example: this.note === '[EXAMPLE]',
  };
};

export const Donation = mongoose.model('Donation', donationSchema);
