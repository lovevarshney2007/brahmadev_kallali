import { Router } from 'express';
import mongoose from 'mongoose';
import { ah } from '../utils/asyncHandler.js';
import { requireAdmin } from '../middleware/auth.js';
import { Donation } from '../models/Donation.js';
import { Expense } from '../models/Expense.js';
import { getSettings } from '../models/Settings.js';
import { nextReceiptNo } from '../models/Counter.js';
import { donationInput, expenseInput, settingsInput, ValidationError } from '../utils/validate.js';
import { ledgerSummary, pageParams, invalidateLedgerCache } from '../services/ledger.js';
import { Photo } from '../models/Photo.js';
import { deleteFromCloudinary } from '../middleware/upload.js';

const router = Router();
router.use(requireAdmin);

const checkId = (id) => {
  if (!mongoose.isValidObjectId(id)) throw new ValidationError('Unknown entry.');
};

router.get('/summary', ah(async (_req, res) => res.json(await ledgerSummary())));

// ---- Donations ----
router.get('/donations', ah(async (req, res) => {
  const { limit, page, skip } = pageParams(req.query, 200);
  const filter = req.query.showVoided === 'true' ? {} : { voided: false };
  const [items, total] = await Promise.all([
    Donation.find(filter).sort({ date: -1, createdAt: -1 }).skip(skip).limit(limit).populate('createdBy', 'name'),
    Donation.countDocuments(filter),
  ]);
  res.json({ items, page, pages: Math.ceil(total / limit) || 1, total });
}));

router.post('/donations', ah(async (req, res) => {
  const data = donationInput(req.body);
  const donation = await Donation.create({
    ...data,
    receiptNo: await nextReceiptNo(data.date),
    createdBy: req.admin._id,
  });
  invalidateLedgerCache();
  res.status(201).json(donation);
}));

router.patch('/donations/:id/void', ah(async (req, res) => {
  checkId(req.params.id);
  const reason = String(req.body.reason || '').trim();
  if (!reason) throw new ValidationError('Please give a reason for cancelling this entry.');
  const d = await Donation.findByIdAndUpdate(
    req.params.id,
    { voided: true, voidReason: reason.slice(0, 300), voidedBy: req.admin._id },
    { new: true }
  );
  if (!d) return res.status(404).json({ error: 'Entry not found.' });
  invalidateLedgerCache();
  res.json(d);
}));

// ---- Expenses ----
router.get('/expenses', ah(async (req, res) => {
  const { limit, page, skip } = pageParams(req.query, 200);
  const filter = req.query.showVoided === 'true' ? {} : { voided: false };
  const [items, total] = await Promise.all([
    Expense.find(filter).sort({ date: -1, createdAt: -1 }).skip(skip).limit(limit).populate('createdBy', 'name'),
    Expense.countDocuments(filter),
  ]);
  res.json({ items, page, pages: Math.ceil(total / limit) || 1, total });
}));

router.post('/expenses', ah(async (req, res) => {
  const expense = await Expense.create({ ...expenseInput(req.body), createdBy: req.admin._id });
  invalidateLedgerCache();
  res.status(201).json(expense);
}));

router.patch('/expenses/:id/void', ah(async (req, res) => {
  checkId(req.params.id);
  const reason = String(req.body.reason || '').trim();
  if (!reason) throw new ValidationError('Please give a reason for cancelling this entry.');
  const e = await Expense.findByIdAndUpdate(
    req.params.id,
    { voided: true, voidReason: reason.slice(0, 300), voidedBy: req.admin._id },
    { new: true }
  );
  if (!e) return res.status(404).json({ error: 'Entry not found.' });
  invalidateLedgerCache();
  res.json(e);
}));

// ---- Photo Moderation ----
router.get('/photos', ah(async (req, res) => {
  const statusFilter = req.query.status;
  const filter = {};
  if (statusFilter === 'pending') filter.approved = false;
  if (statusFilter === 'approved') filter.approved = true;

  const items = await Photo.find(filter).sort({ createdAt: -1 }).populate('approvedBy', 'name');
  const pendingCount = await Photo.countDocuments({ approved: false });

  res.json({ items, pendingCount });
}));

router.patch('/photos/:id/approve', ah(async (req, res) => {
  checkId(req.params.id);
  const photo = await Photo.findByIdAndUpdate(
    req.params.id,
    { approved: true, approvedBy: req.admin._id },
    { new: true }
  );
  if (!photo) return res.status(404).json({ error: 'Photo not found.' });
  res.json(photo);
}));

router.delete('/photos/:id', ah(async (req, res) => {
  checkId(req.params.id);
  const photo = await Photo.findByIdAndDelete(req.params.id);
  if (!photo) return res.status(404).json({ error: 'Photo not found.' });
  if (photo.publicId) {
    await deleteFromCloudinary(photo.publicId);
  }
  res.json({ message: 'Photo deleted successfully.' });
}));

// ---- Site settings ----
router.get('/settings', ah(async (_req, res) => res.json(await getSettings())));

router.put('/settings', ah(async (req, res) => {
  const s = await getSettings();
  s.set(settingsInput(req.body));
  await s.save();
  res.json(s);
}));

// ---- CSV export for the trust's accountant ----
const csvCell = (v) => {
  let s = String(v ?? '');
  if (/^[=+\-@]/.test(s)) s = `'${s}`; // stop spreadsheet formula injection
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

router.get('/export/:kind.csv', ah(async (req, res) => {
  const { kind } = req.params;
  let rows;
  if (kind === 'donations') {
    const list = await Donation.find().sort({ date: 1 });
    rows = [['Date', 'Receipt', 'Donor', 'Show name', 'Phone', 'Amount', 'Purpose', 'Source', 'Ref (last 4)', 'Voided', 'Void reason'],
      ...list.map((d) => [d.date.toISOString().slice(0, 10), d.receiptNo, d.donorName, d.showName ? 'yes' : 'no', d.phone, d.amount, d.purpose, d.source, d.refLast4, d.voided ? 'yes' : 'no', d.voidReason])];
  } else if (kind === 'expenses') {
    const list = await Expense.find().sort({ date: 1 });
    rows = [['Date', 'Item', 'Paid to', 'Bill no.', 'Amount', 'Purpose', 'Voided', 'Void reason'],
      ...list.map((e) => [e.date.toISOString().slice(0, 10), e.item, e.paidTo, e.billNo, e.amount, e.purpose, e.voided ? 'yes' : 'no', e.voidReason])];
  } else {
    return res.status(404).json({ error: 'Unknown export.' });
  }
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${kind}.csv"`);
  res.send('﻿' + rows.map((r) => r.map(csvCell).join(',')).join('\n'));
}));

export default router;
