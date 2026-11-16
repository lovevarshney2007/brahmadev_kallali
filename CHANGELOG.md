# Detailed Changes Summary

## Overview

The following changes were made to address the 14 Nov 2026 client feedback and to fully polish the Brahmadev Kallali website.

## Key modules updated

* **`client/src/components/FestivalCalendar.jsx`** – Re‑implemented to use the translations object and bilingual support. Added handling of official and dummy festivals, expand/collapse details, accessible navigation.

* **`client/src/pages/Home.jsx`** – Passed translation and language props to `FestivalCalendar`. Updated the structure to use the new component.

* **`client/src/pages/Ledger.jsx`** – Maintained usage of `PhotoGrid` for the visits gallery.

* **`client/src/pages/Donate.jsx`** – Minor cleanup of UPI handling.

* **`client/src/components/PhotoGrid.jsx`** – Lightbox controls updated and keyboard navigation improved.

* **`client/src/components/QRPlaceholder.jsx`** – Updated to display QR only when the UPI ID is configured.

* **`client/src/components/HeroSlider.jsx`** – Updated for accessibility, auto‑play, and responsive breakpoints.

* **`client/src/styles.css`** – Added comprehensive mobile breakpoints for 640 px and 480 px. All components now respect minimum 44 px touch targets and 1 rem font sizing to avoid iOS zoom.

* **`client/src/translation.js`** – No direct changes, but the new components now use the `festivals` part of this file for month names and text.

* **`client/src/api.js` & server-side routes** – No changes were required.

## Tests

* Manual visual and interaction testing was performed at `http://localhost:5176`.
* Verified all touch targets are ≥44 px, headings remain readable, and all components respond correctly on 480 px, 640 px, and 760 px breakpoints.
* Cross‑check: The dashboard shows all items with correct translations. The "Festival" section displays dummy data properly.

## Commits

The full commit history (latest first) is shown below:

```text
34c6a4c feat: replace all toast and browser popups across the entire site with in-page feedback and inline confirmations
073abc1 feat: enhance media upload UI with dedicated edit view, clean video player toolbar, and in-page success card instead of toast popup
d9b844f feat: add video uploads, duplicate validation for media, and full home page photo & video gallery
cd4d1c1 docs: add website audit & content requirement report and generator script
1a89fe3 feat: apply Sacred Saffron, Warm Ivory, Deep Kumkum Maroon, and Auspicious Gold CTA palette
```

> Note: The commit messages have been written without mentioning Claude

---

*All code changes have been staged locally. The commit will be made below.*