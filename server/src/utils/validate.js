import { z } from 'zod';
import { PURPOSES, DONATION_SOURCES } from '../models/constants.js';

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.status = 400;
  }
}

export const UPI_RE = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z][a-zA-Z0-9.]{1,63}$/;
const PHONE_RE = /^[0-9+()-\s]{0,20}$/;

function formatZodError(err) {
  const firstIssue = err.issues?.[0];
  return firstIssue ? firstIssue.message : 'Invalid request data.';
}

// 1. Donation Validation Schema
const donationZod = z.object({
  date: z.coerce.date({
    errorMap: () => ({ message: 'Please enter a valid date.' }),
  }).refine((d) => d.getTime() <= Date.now() + 24 * 3600 * 1000, {
    message: 'The date cannot be in the future.',
  }),
  donorName: z.string().trim().max(120).default(''),
  showName: z.boolean().default(false),
  phone: z.string().trim().max(20).default(''),
  amount: z.coerce.number().int().min(1, 'Amount must be at least ₹1.').max(10_00_00_000, 'Amount looks too large.'),
  purpose: z.enum(PURPOSES, {
    errorMap: () => ({ message: 'Please choose a purpose from the list.' }),
  }).default('General daan'),
  source: z.enum(DONATION_SOURCES.filter(s => s !== 'razorpay'), {
    errorMap: () => ({ message: 'Please choose how the daan was received.' }),
  }).default('upi'),
  ref: z.string().optional().default(''),
  note: z.string().trim().max(300).default(''),
});

export function donationInput(body) {
  const res = donationZod.safeParse(body);
  if (!res.success) throw new ValidationError(formatZodError(res.error));
  const data = res.data;
  return {
    ...data,
    refLast4: String(data.ref || '').replace(/\s/g, '').slice(-4),
  };
}

// 2. Expense Validation Schema
const expenseZod = z.object({
  date: z.coerce.date({
    errorMap: () => ({ message: 'Please enter a valid date.' }),
  }),
  item: z.string().trim().min(1, 'Please describe the expense.').max(200),
  amount: z.coerce.number().int().min(1, 'Amount must be at least ₹1.').max(10_00_00_000, 'Amount looks too large.'),
  purpose: z.enum(PURPOSES, {
    errorMap: () => ({ message: 'Please choose a purpose from the list.' }),
  }).default('Temple upkeep'),
  paidTo: z.string().trim().max(120).default(''),
  billNo: z.string().trim().max(60).default(''),
});

export function expenseInput(body) {
  const res = expenseZod.safeParse(body);
  if (!res.success) throw new ValidationError(formatZodError(res.error));
  return res.data;
}

// 3. Settings Validation Schema
const settingsZod = z.object({
  upiId: z.string().trim().max(320).refine((v) => !v || UPI_RE.test(v), {
    message: 'UPI ID should look like name@bank, with no spaces.',
  }).optional(),
  payeeName: z.string().trim().max(500).optional(),
  trustName: z.string().trim().max(500).optional(),
  trustRegNo: z.string().trim().max(500).optional(),
  taxNote: z.string().trim().max(500).optional(),
  announcement: z.string().trim().max(500).optional(),
  contact: z.object({
    person: z.string().trim().max(120).default(''),
    phone: z.string().trim().max(30).default(''),
    email: z.string().trim().max(120).default(''),
  }).optional(),
  darshanTimings: z.array(z.object({
    seva: z.string().trim().max(80),
    time: z.string().trim().max(40),
    details: z.string().trim().max(200),
  })).optional(),
  festivals: z.array(z.object({
    name: z.string().trim().max(80),
    when: z.string().trim().max(60),
    details: z.string().trim().max(300),
  })).optional(),
});

export function settingsInput(body) {
  const res = settingsZod.safeParse(body);
  if (!res.success) throw new ValidationError(formatZodError(res.error));
  return res.data;
}

// 4. Photo Upload Form Schema
const photoUploadZod = z.object({
  uploaderName: z.string().trim().max(120).default('Devotee'),
  uploaderPhone: z.string().trim().max(20).refine((v) => !v || PHONE_RE.test(v), {
    message: 'Please enter a valid phone number.',
  }).default(''),
  caption: z.string().trim().max(300).default(''),
  event: z.string().trim().max(100).default('General'),
});

export function photoUploadInput(body) {
  const res = photoUploadZod.safeParse(body);
  if (!res.success) throw new ValidationError(formatZodError(res.error));
  return res.data;
}
