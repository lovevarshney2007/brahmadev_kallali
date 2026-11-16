import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { ah } from '../utils/asyncHandler.js';
import { Donation } from '../models/Donation.js';
import { Expense } from '../models/Expense.js';
import { getSettings } from '../models/Settings.js';
import { PURPOSES } from '../models/constants.js';
import { ledgerSummary, pageParams } from '../services/ledger.js';
import { Enquiry } from '../models/Enquiry.js';
import { enquiryInput } from '../utils/validate.js';

const router = Router();

const enquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many enquiry submissions from this network. Please try again after 15 minutes.' },
});

router.get('/settings', ah(async (_req, res) => {
  const s = await getSettings();
  res.json({
    upiId: s.upiId,
    payeeName: s.payeeName,
    trustName: s.trustName,
    trustRegNo: s.trustRegNo,
    taxNote: s.taxNote,
    darshanTimings: s.darshanTimings,
    festivals: s.festivals,
    contact: s.contact,
    announcement: s.announcement,
    purposes: PURPOSES,
  });
}));

router.get('/summary', ah(async (_req, res) => {
  res.json(await ledgerSummary());
}));

function listRoute(Model) {
  return ah(async (req, res) => {
    const { limit, page, skip } = pageParams(req.query, 100);
    const filter = { voided: false };
    if (req.query.purpose && PURPOSES.includes(req.query.purpose)) filter.purpose = req.query.purpose;
    const [items, total] = await Promise.all([
      Model.find(filter).sort({ date: -1, createdAt: -1 }).skip(skip).limit(limit),
      Model.countDocuments(filter),
    ]);
    res.json({ items: items.map((d) => d.toPublic()), page, pages: Math.ceil(total / limit) || 1, total });
  });
}

router.get('/donations', listRoute(Donation));
router.get('/expenses', listRoute(Expense));

router.post('/enquiry', enquiryLimiter, ah(async (req, res) => {
  const data = enquiryInput(req.body);
  const enquiry = await Enquiry.create(data);
  res.status(201).json({ ok: true, message: 'Enquiry received. The temple office will get in touch.', id: enquiry._id });
}));

export default router;
