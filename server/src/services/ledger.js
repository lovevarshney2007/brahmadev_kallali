import { Donation } from '../models/Donation.js';
import { Expense } from '../models/Expense.js';

let cachedSummary = null;
let cacheExpiry = 0;

async function totals(Model) {
  const [byPurpose, all] = await Promise.all([
    Model.aggregate([
      { $match: { voided: false } },
      { $group: { _id: '$purpose', amount: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { amount: -1 } },
    ]),
    Model.aggregate([
      { $match: { voided: false } },
      { $group: { _id: null, amount: { $sum: '$amount' }, count: { $sum: 1 }, last: { $max: '$updatedAt' } } },
    ]),
  ]);
  const t = all[0] || { amount: 0, count: 0, last: null };
  return {
    total: t.amount,
    count: t.count,
    lastUpdated: t.last,
    byPurpose: byPurpose.map((r) => ({ purpose: r._id, amount: r.amount, count: r.count })),
  };
}

export async function ledgerSummary(forceFresh = false) {
  const now = Date.now();
  if (!forceFresh && cachedSummary && cacheExpiry > now) {
    return cachedSummary;
  }

  const [received, spent] = await Promise.all([totals(Donation), totals(Expense)]);
  const last = [received.lastUpdated, spent.lastUpdated].filter(Boolean).sort().pop() || null;
  cachedSummary = {
    received: { total: received.total, count: received.count, byPurpose: received.byPurpose },
    spent: { total: spent.total, count: spent.count, byPurpose: spent.byPurpose },
    balance: received.total - spent.total,
    lastUpdated: last,
  };
  cacheExpiry = now + 60 * 1000; // 60 seconds TTL cache
  return cachedSummary;
}

export function invalidateLedgerCache() {
  cachedSummary = null;
  cacheExpiry = 0;
}

export function pageParams(query, maxLimit = 100) {
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 25, 1), maxLimit);
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  return { limit, page, skip: (page - 1) * limit };
}
