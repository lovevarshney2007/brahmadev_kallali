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
import { Enquiry } from '../models/Enquiry.js';
import { deleteFromCloudinary, uploadMiddleware, uploadBuffer } from '../middleware/upload.js';

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
  const statusFilter = typeof req.query.status === 'string' ? req.query.status.trim() : '';
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

// ---- Enquiries ----
router.get('/enquiries', ah(async (req, res) => {
  const { limit, page, skip } = pageParams(req.query, 100);
  const filter = {};
  if (typeof req.query.status === 'string') {
    const status = req.query.status.trim();
    if (['pending', 'responded', 'archived'].includes(status)) {
      filter.status = status;
    }
  }
  const [items, total] = await Promise.all([
    Enquiry.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Enquiry.countDocuments(filter),
  ]);
  res.json({ items, page, pages: Math.ceil(total / limit) || 1, total });
}));

router.patch('/enquiries/:id/status', ah(async (req, res) => {
  checkId(req.params.id);
  const { status } = req.body;
  if (!['pending', 'responded', 'archived'].includes(status)) {
    throw new ValidationError('Invalid enquiry status.');
  }
  const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!enquiry) return res.status(404).json({ error: 'Enquiry not found.' });
  res.json(enquiry);
}));

// ---- Site settings ----
router.get('/settings', ah(async (_req, res) => res.json(await getSettings())));

router.put('/settings', ah(async (req, res) => {
  const s = await getSettings();
  s.set(settingsInput(req.body));
  await s.save();
  res.json(s);
}));

// ---- Hero Slider management ----

// Upload a new slide image
router.post('/slider/upload', uploadMiddleware.single('image'), ah(async (req, res) => {
  if (!req.file) throw new ValidationError('Please select an image file to upload.');
  const { imageUrl, publicId } = await uploadBuffer(req.file.buffer, req.file.mimetype);
  const alt = String(req.body.alt || '').trim().slice(0, 300);
  const title = String(req.body.title || '').trim().slice(0, 200);
  const caption = String(req.body.caption || '').trim().slice(0, 500);
  const s = await getSettings();
  const order = (s.heroSlides || []).length;
  s.heroSlides = [...(s.heroSlides || []), { imageUrl, publicId, alt, title, caption, order }];
  await s.save();
  res.status(201).json({ imageUrl, publicId, alt, title, caption, order, slides: s.heroSlides });
}));

// Delete a slide by index
router.delete('/slider/:index', ah(async (req, res) => {
  const idx = parseInt(req.params.index, 10);
  const s = await getSettings();
  const slides = [...(s.heroSlides || [])];
  if (isNaN(idx) || idx < 0 || idx >= slides.length) {
    return res.status(404).json({ error: 'Slide not found.' });
  }
  const removed = slides.splice(idx, 1)[0];
  if (removed?.publicId) {
    await deleteFromCloudinary(removed.publicId, 'image');
  }
  s.heroSlides = slides.map((sl, i) => ({ ...sl, order: i }));
  await s.save();
  res.json({ message: 'Slide deleted.', slides: s.heroSlides });
}));

// Update a single slide (supports replacing image and/or editing title, alt, caption)
router.put('/slider/:index', uploadMiddleware.single('image'), ah(async (req, res) => {
  const idx = parseInt(req.params.index, 10);
  const s = await getSettings();
  const slides = [...(s.heroSlides || [])];
  if (isNaN(idx) || idx < 0 || idx >= slides.length) {
    return res.status(404).json({ error: 'Slide not found.' });
  }

  const current = slides[idx];
  let imageUrl = current.imageUrl;
  let publicId = current.publicId || '';

  // If a new image was uploaded to replace the current one
  if (req.file) {
    const uploaded = await uploadBuffer(req.file.buffer, req.file.mimetype);
    // Delete previous Cloudinary image if it exists
    if (current.publicId) {
      await deleteFromCloudinary(current.publicId, 'image').catch(() => {});
    }
    imageUrl = uploaded.imageUrl;
    publicId = uploaded.publicId;
  }

  const alt = req.body.alt !== undefined ? String(req.body.alt).trim().slice(0, 300) : current.alt;
  const title = req.body.title !== undefined ? String(req.body.title).trim().slice(0, 200) : current.title;
  const caption = req.body.caption !== undefined ? String(req.body.caption).trim().slice(0, 500) : current.caption;

  slides[idx] = {
    imageUrl,
    publicId,
    alt,
    title,
    caption,
    order: idx,
  };

  s.heroSlides = slides;
  await s.save();
  res.json({ slide: slides[idx], slides: s.heroSlides });
}));

// Update slides order & metadata (PUT array of slides — no image re-upload)
router.put('/slider/reorder', ah(async (req, res) => {
  const s = await getSettings();
  const incoming = Array.isArray(req.body.slides) ? req.body.slides : [];
  // Validate each slide has an imageUrl that matches existing slides
  const existing = (s.heroSlides || []).map(sl => sl.imageUrl);
  const validated = incoming.filter(sl => sl.imageUrl && existing.includes(sl.imageUrl));
  s.heroSlides = validated.map((sl, i) => ({
    imageUrl: sl.imageUrl,
    publicId: sl.publicId || '',
    alt: String(sl.alt || '').trim().slice(0, 300),
    title: String(sl.title || '').trim().slice(0, 200),
    caption: String(sl.caption || '').trim().slice(0, 500),
    order: i,
  }));
  await s.save();
  res.json({ slides: s.heroSlides });
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
