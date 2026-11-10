import mongoose from 'mongoose';

// One document holds everything the trust can edit without touching code.
const settingsSchema = new mongoose.Schema(
  {
    _id: { type: String, default: 'site' },
    upiId: { type: String, trim: true, default: '' },
    payeeName: { type: String, trim: true, default: 'Shri Brahmadev Devasthan Trust' },
    trustName: { type: String, trim: true, default: 'Shri Kshetra Brahmadev Devasthan Trust' },
    trustRegNo: { type: String, trim: true, default: '' },
    taxNote: { type: String, trim: true, default: '' }, // e.g. "80G approved, no. ..."
    darshanTimings: [
      {
        _id: false,
        seva: String,
        time: String,
        details: String,
      },
    ],
    festivals: [
      {
        _id: false,
        name: String,
        when: String,
        details: String,
      },
    ],
    contact: {
      person: { type: String, default: 'Maruti kunjatwad' },
      phone: { type: String, default: '9503131031' },
      email: { type: String, default: '' },
    },
    announcement: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Settings = mongoose.model('Settings', settingsSchema);

export async function getSettings() {
  let s = await Settings.findById('site');
  if (!s) {
    s = await Settings.create({
      _id: 'site',
      contact: {
        person: 'Maruti kunjatwad',
        phone: '9503131031',
        email: '',
      },
    });
  } else {
    // If contact details are empty, populate with Maruti kunjatwad
    let changed = false;
    if (!s.contact?.person) {
      s.contact = s.contact || {};
      s.contact.person = 'Maruti kunjatwad';
      changed = true;
    }
    if (!s.contact?.phone) {
      s.contact = s.contact || {};
      s.contact.phone = '9503131031';
      changed = true;
    }
    if (changed) await s.save();
  }
  return s;
}
