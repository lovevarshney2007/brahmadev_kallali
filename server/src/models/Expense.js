import mongoose from 'mongoose';
import { PURPOSES } from './constants.js';

const expenseSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true, index: true },
    item: { type: String, required: true, trim: true, maxlength: 200 },
    amount: { type: Number, required: true, min: 1 },
    purpose: { type: String, enum: PURPOSES, default: 'Temple upkeep' },
    paidTo: { type: String, trim: true, maxlength: 120, default: '' },
    billNo: { type: String, trim: true, maxlength: 60, default: '' },
    voided: { type: Boolean, default: false, index: true },
    voidReason: { type: String, maxlength: 300, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    voidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  },
  { timestamps: true }
);

expenseSchema.methods.toPublic = function toPublic() {
  return {
    id: this._id,
    date: this.date,
    item: this.item,
    amount: this.amount,
    purpose: this.purpose,
    paidTo: this.paidTo || null,
    billNo: this.billNo || null,
    example: /^EX-/.test(this.billNo || ''),
  };
};

export const Expense = mongoose.model('Expense', expenseSchema);
