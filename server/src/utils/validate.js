import { PURPOSES, DONATION_SOURCES } from '../models/constants.js';

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.status = 400;
  }
}

const str = (v, max) => String(v ?? '').trim().slice(0, max);

function parseDate(v) {
  const d = v ? new Date(v) : new Date();
  if (Number.isNaN(d.getTime())) throw new ValidationError('Please enter a valid date.');
  if (d.getTime() > Date.now() + 24 * 3600 * 1000) throw new ValidationError('The date cannot be in the future.');
  return d;
}

function parseAmount(v) {
  const n = Math.round(Number(v));
  if (!Number.isFinite(n) || n < 1) throw new ValidationError('Amount must be at least ₹1.');
  if (n > 10_00_00_000) throw new ValidationError('Amount looks too large. Please check it.');
  return n;
}

function parsePurpose(v, fallback) {
  if (!v) return fallback;
  if (!PURPOSES.includes(v)) throw new ValidationError('Please choose a purpose from the list.');
  return v;
}

export function donationInput(body) {
  const source = body.source || 'upi';
  if (!DONATION_SOURCES.includes(source) || source === 'razorpay') {
    throw new ValidationError('Please choose how the daan was received.');
  }
  return {
    date: parseDate(body.date),
    donorName: str(body.donorName, 120),
    showName: Boolean(body.showName),
    phone: str(body.phone, 20),
    amount: parseAmount(body.amount),
    purpose: parsePurpose(body.purpose, 'General daan'),
    source,
    refLast4: str(body.ref, 64).replace(/\s/g, '').slice(-4),
    note: str(body.note, 300),
  };
}

export function expenseInput(body) {
  const item = str(body.item, 200);
  if (!item) throw new ValidationError('Please describe the expense.');
  return {
    date: parseDate(body.date),
    item,
    amount: parseAmount(body.amount),
    purpose: parsePurpose(body.purpose, 'Temple upkeep'),
    paidTo: str(body.paidTo, 120),
    billNo: str(body.billNo, 60),
  };
}

export const UPI_RE = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z][a-zA-Z0-9.]{1,63}$/;

export function settingsInput(body) {
  const out = {};
  if ('upiId' in body) {
    const upi = str(body.upiId, 320);
    if (upi && !UPI_RE.test(upi)) throw new ValidationError('UPI ID should look like name@bank, with no spaces.');
    out.upiId = upi;
  }
  for (const k of ['payeeName', 'trustName', 'trustRegNo', 'taxNote', 'announcement']) {
    if (k in body) out[k] = str(body[k], 500);
  }
  if (body.contact) {
    out.contact = {
      person: str(body.contact.person, 120),
      phone: str(body.contact.phone, 30),
      email: str(body.contact.email, 120),
    };
  }
  if (Array.isArray(body.darshanTimings)) {
    out.darshanTimings = body.darshanTimings.slice(0, 20).map((r) => ({
      seva: str(r.seva, 80), time: str(r.time, 40), details: str(r.details, 200),
    })).filter((r) => r.seva);
  }
  if (Array.isArray(body.festivals)) {
    out.festivals = body.festivals.slice(0, 30).map((r) => ({
      name: str(r.name, 80), when: str(r.when, 60), details: str(r.details, 300),
    })).filter((r) => r.name);
  }
  return out;
}
