import { Router } from 'express';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { ah } from '../utils/asyncHandler.js';
import { env, razorpayEnabled } from '../config/env.js';
import { PURPOSES } from '../models/constants.js';
import { razorpay, recordRazorpayPayment, verifyCheckoutSignature, verifyWebhookSignature } from '../services/razorpay.js';

const router = Router();

// Webhook must read the raw body to check Razorpay's signature, so it is mounted
// separately (before express.json) in app.js.
export const webhookHandler = [
  express.raw({ type: 'application/json', limit: '1mb' }),
  ah(async (req, res) => {
    if (!razorpayEnabled) return res.status(404).end();
    if (!verifyWebhookSignature(req.body, req.get('x-razorpay-signature'))) {
      return res.status(400).json({ error: 'Invalid signature' });
    }
    const event = JSON.parse(req.body.toString('utf8'));
    if (event.event === 'payment.captured') {
      await recordRazorpayPayment(event.payload?.payment?.entity);
    }
    res.json({ ok: true });
  }),
];

router.get('/config', (_req, res) => {
  res.json({ enabled: razorpayEnabled, keyId: razorpayEnabled ? env.razorpay.keyId : null });
});

const orderLimiter = rateLimit({ windowMs: 10 * 60 * 1000, limit: 30, standardHeaders: 'draft-7', legacyHeaders: false });

router.post('/order', orderLimiter, ah(async (req, res) => {
  if (!razorpayEnabled) return res.status(503).json({ error: 'Online payment is not set up yet. Please use the UPI QR code.' });
  const amount = Math.round(Number(req.body.amount));
  if (!Number.isFinite(amount) || amount < 1 || amount > 5_00_000) {
    return res.status(400).json({ error: 'Please enter an amount between ₹1 and ₹5,00,000.' });
  }
  const purpose = PURPOSES.includes(req.body.purpose) ? req.body.purpose : 'General daan';
  const donorName = String(req.body.donorName || '').trim().slice(0, 120);
  const order = await razorpay.orders.create({
    amount: amount * 100,
    currency: 'INR',
    receipt: `daan_${Date.now()}`,
    notes: { purpose, donorName, showName: req.body.showName ? 'yes' : 'no' },
  });
  res.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId: env.razorpay.keyId, notes: order.notes });
}));

// Called by the browser right after checkout succeeds, so the devotee sees their receipt at once.
// The webhook records the same payment too; whichever arrives first wins, the other is a no-op.
router.post('/verify', ah(async (req, res) => {
  if (!razorpayEnabled) return res.status(404).end();
  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: sig } = req.body;
  if (!orderId || !paymentId || !sig || !verifyCheckoutSignature(orderId, paymentId, sig)) {
    return res.status(400).json({ error: 'We could not verify this payment. If money was deducted, please contact the temple office.' });
  }
  // Trust Razorpay's record, not the browser, for amount and status.
  const payment = await razorpay.payments.fetch(paymentId);
  if (payment.order_id !== orderId) return res.status(400).json({ error: 'Payment does not match the order.' });
  const donation = await recordRazorpayPayment(payment);
  if (!donation) return res.status(202).json({ pending: true, message: 'Payment received and being confirmed. It will appear in the ledger shortly.' });
  res.json({ receiptNo: donation.receiptNo, amount: donation.amount, purpose: donation.purpose });
}));

export default router;
