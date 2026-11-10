import { Router } from 'express';
import { ah } from '../utils/asyncHandler.js';
import { Donation } from '../models/Donation.js';
import { Expense } from '../models/Expense.js';
import { getSettings } from '../models/Settings.js';
import { PURPOSES } from '../models/constants.js';
import { ledgerSummary, pageParams } from '../services/ledger.js';

const router = Router();

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

export default router;
