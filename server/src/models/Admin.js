import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Password must be at least 12 chars, with uppercase, lowercase, number, and special char
const PASSWORD_COMPLEXITY = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._\-])[A-Za-z\d@$!%*?&._\-]{12,}$/;

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

adminSchema.methods.checkPassword = function checkPassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

adminSchema.statics.hashPassword = (password) => bcrypt.hash(password, 12);

// Validate password complexity for admin password changes
adminSchema.statics.validatePasswordComplexity = function(password) {
  if (!PASSWORD_COMPLEXITY.test(password)) {
    throw new Error('Password must be at least 12 characters long and contain uppercase, lowercase, a number, and a special character (@$!%*?&._-).');
  }
  return true;
};

export const Admin = mongoose.model('Admin', adminSchema);
export { PASSWORD_COMPLEXITY };
