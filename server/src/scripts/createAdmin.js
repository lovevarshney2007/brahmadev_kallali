// Usage: npm run create-admin -- "Trustee Name" trustee@example.com "a-strong-password"
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { connectDB } from '../config/db.js';
import { Admin } from '../models/Admin.js';

const [name, email, password] = process.argv.slice(2);
if (!name || !email || !password) {
  console.log('Usage: npm run create-admin -- "Trustee Name" email@example.com "strong-password"');
  process.exit(1);
}
if (password.length < 10) {
  console.log('Password must be at least 10 characters.');
  process.exit(1);
}

await connectDB(env.mongoUri);
const passwordHash = await Admin.hashPassword(password);
const admin = await Admin.findOneAndUpdate(
  { email: email.toLowerCase() },
  { name, email: email.toLowerCase(), passwordHash },
  { upsert: true, new: true }
);
console.log(`Admin ready: ${admin.name} <${admin.email}>`);
await mongoose.disconnect();
