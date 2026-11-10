// Fills the site with default timings and festivals, plus clearly marked EXAMPLE
// ledger entries for local testing. Run:  npm run seed            (settings + examples)
//                                         npm run seed -- --clear-examples   (remove examples)
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { connectDB } from '../config/db.js';
import { getSettings } from '../models/Settings.js';
import { Donation } from '../models/Donation.js';
import { Expense } from '../models/Expense.js';
import { nextReceiptNo } from '../models/Counter.js';

await connectDB(env.mongoUri);
const EX = '[EXAMPLE]';

if (process.argv.includes('--clear-examples')) {
  const d = await Donation.deleteMany({ note: EX });
  const e = await Expense.deleteMany({ billNo: /^EX-/ });
  console.log(`Removed ${d.deletedCount} example donations and ${e.deletedCount} example expenses.`);
  await mongoose.disconnect();
  process.exit(0);
}

const s = await getSettings();
if (!s.darshanTimings.length) {
  s.darshanTimings = [
    { seva: 'Temple opens', time: 'To be confirmed', details: 'Morning darshan begins' },
    { seva: 'Kakad aarti', time: 'To be confirmed', details: 'Early morning prayers' },
    { seva: 'Abhishek and puja', time: 'To be confirmed', details: 'Daily worship of the deity' },
    { seva: 'Evening aarti', time: 'To be confirmed', details: 'Aarti and bhajan' },
    { seva: 'Shej aarti', time: 'To be confirmed', details: 'Night aarti and temple closing' },
  ];
}
if (!s.festivals.length) {
  s.festivals = [
    { name: 'Brahmadev Yatra', when: 'Annual yatra · date to be confirmed', details: "The temple's main celebration, with palkhi, kirtan and mahaprasad." },
    { name: 'Gudi Padwa', when: 'Chaitra', details: 'Marathi New Year, welcomed with special puja.' },
    { name: 'Shravan month', when: 'Shravan', details: 'Special prayers and abhishek through the holy month.' },
    { name: 'Navratri and Dussehra', when: 'Ashwin', details: 'Nine nights of devotion ending with Vijayadashami.' },
    { name: 'Diwali and Kartik Purnima', when: 'Kartik', details: 'Deepotsav, with lamps lighting the temple premises.' },
    { name: 'Mahashivratri', when: 'Magh', details: 'Night-long worship, bhajan and jagran.' },
  ];
}
await s.save();
console.log('Settings ready.');

if (!(await Donation.exists({ note: EX }))) {
  const donations = [
    ['2026-11-02', 'Example donor A', true, 5001, 'Annadan seva'],
    ['2026-11-03', '', false, 501, 'General daan'],
    ['2026-11-05', 'Example donor B', true, 2101, 'Utsav and festivals'],
    ['2026-11-06', '', false, 251, 'Nitya puja'],
    ['2026-11-08', 'Example donor C', true, 11000, 'Temple upkeep'],
  ];
  for (const [date, donorName, showName, amount, purpose] of donations) {
    await Donation.create({ date, donorName, showName, amount, purpose, source: 'upi', refLast4: String(1000 + amount).slice(-4), note: EX, receiptNo: await nextReceiptNo(date) });
  }
  await Expense.create([
    { date: '2026-11-04', item: 'Flowers, oil and camphor for daily puja', amount: 1850, purpose: 'Nitya puja', billNo: 'EX-001' },
    { date: '2026-11-07', item: 'Groceries for Kartik annadan', amount: 6400, purpose: 'Annadan seva', billNo: 'EX-002' },
    { date: '2026-11-09', item: 'Electrician: temple hall wiring', amount: 3200, purpose: 'Temple upkeep', billNo: 'EX-003' },
  ]);
  console.log('Example ledger entries added. Remove them later with:  npm run seed -- --clear-examples');
}

await mongoose.disconnect();
