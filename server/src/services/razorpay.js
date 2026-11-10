import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import { env, razorpayEnabled } from '../config/env.js';
import { Donation } from '../models/Donation.js';
import { nextReceiptNo } from '../models/Counter.js';
import { PURPOSES } from '../models/constants.js';

export const razorpay = razorpayEnabled
  ? new Razorpay({ key_id: env.razorpay.keyId, key_secret: env.razorpay.keySecret })
  : null;

const safeEqual = (a, b) => {
  const A = Buffer.from(String(a)), B = Buffer.from(String(b));
  return A.length === B.length && crypto.timingSafeEqual(A, B);
};

export function verifyCheckoutSignature(orderId, paymentId, signature) {
  const expected = crypto
    .createHmac('sha256', env.razorpay.keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return safeEqual(expected, signature);
}

export function verifyWebhookSignature(rawBody, signature) {
  if (!env.razorpay.webhookSecret || !signature) return false;
  const expected = crypto.createHmac('sha256', env.razorpay.webhookSecret).update(rawBody).digest('hex');
  return safeEqual(expected, signature);
}

/**
 * Records a captured Razorpay payment as a donation. Safe to call more than once
 * for the same payment (from the checkout callback and from the webhook).
 */
export async function recordRazorpayPayment(payment) {
  if (!payment || payment.status !== 'captured') return null;
  const existing = await Donation.findOne({ razorpayPaymentId: payment.id });
  if (existing) return existing;

  const notes = payment.notes || {};
  const purpose = PURPOSES.includes(notes.purpose) ? notes.purpose : 'General daan';
  const date = new Date((payment.created_at || Date.now() / 1000) * 1000);
  try {
    return await Donation.create({
      date,
      donorName: String(notes.donorName || '').slice(0, 120),
      showName: notes.showName === 'yes',
      phone: String(payment.contact || '').slice(0, 20),
      amount: Math.round(payment.amount / 100),
      purpose,
      source: 'razorpay',
      refLast4: String(payment.acquirer_data?.rrn || payment.id).slice(-4),
      razorpayPaymentId: payment.id,
      razorpayOrderId: payment.order_id,
      receiptNo: await nextReceiptNo(date),
    });
  } catch (err) {
    // Another request recorded it at the same moment.
    if (err.code === 11000) return Donation.findOne({ razorpayPaymentId: payment.id });
    throw err;
  }
}
