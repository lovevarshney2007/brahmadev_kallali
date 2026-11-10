import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  _id: String,
  seq: { type: Number, default: 0 },
});

export const Counter = mongoose.model('Counter', counterSchema);

// Atomically returns the next number in a named sequence, e.g. receipts for a year.
export async function nextSeq(name) {
  const doc = await Counter.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return doc.seq;
}

// Receipt numbers look like BKD-2026-0001 and restart each year.
export async function nextReceiptNo(date = new Date()) {
  const year = new Date(date).getFullYear();
  const n = await nextSeq(`receipt-${year}`);
  return `BKD-${year}-${String(n).padStart(4, '0')}`;
}
