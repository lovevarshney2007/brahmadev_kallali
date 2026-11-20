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
    heroSlides: [
      {
        _id: false,
        imageUrl: { type: String, required: true },
        publicId: { type: String, default: '' }, // Cloudinary public_id for deletion
        alt: { type: String, default: '' },
        title: { type: String, default: '' },
        caption: { type: String, default: '' },
        order: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

export const DEFAULT_HERO_SLIDES = [
  {
    imageUrl: '/banners/banner2.png',
    publicId: '',
    alt: 'श्री क्षेत्र ब्रह्मदेव देवस्थान, कल्लाळी - श्रद्धा, भक्ती, सेवा व संस्कृतीचा पवित्र संगम',
    title: 'श्री क्षेत्र ब्रह्मदेव देवस्थान, कल्लाळी',
    caption: 'श्रद्धा, भक्ती, सेवा व संस्कृतीचा पवित्र संगम • कल्लाळी',
    order: 0,
  },
  {
    imageUrl: '/banners/banner1.png',
    publicId: '',
    alt: 'श्री क्षेत्र ब्रह्मदेव देवस्थान, कल्लाळी - भव्य प्रवेशद्वार व मंदिर परिसर',
    title: 'श्री क्षेत्र ब्रह्मदेव देवस्थान',
    caption: 'भव्य प्रवेशद्वार, दीपमाळ व मंदिर परिसर',
    order: 1,
  },
];

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
      heroSlides: DEFAULT_HERO_SLIDES,
    });
  } else {
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
    if (!s.heroSlides || s.heroSlides.length === 0) {
      s.heroSlides = DEFAULT_HERO_SLIDES;
      changed = true;
    }
    if (changed) await s.save();
  }
  return s;
}
