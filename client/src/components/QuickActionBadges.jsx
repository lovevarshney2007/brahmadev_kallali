import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSite } from '../SiteContext.jsx';

/**
 * QuickActionBadges:
 * Floating Quick-Action Badges fixed to the left edge of the screen (similar to Shirdi Saibaba Trust).
 * 1. Quick "दान / Donate" Button -> Navigates to /donate
 * 2. Quick "दर्शन / आरती वेळा" Button -> Opens sacred Darshan & Aarti Schedule modal
 * Hidden while hero slider is in view, visible on the rest of the page.
 */
export default function QuickActionBadges() {
  const { lang, settings } = useSite();
  const [modalOpen, setModalOpen] = useState(false);
  const location = useLocation();
  const isMr = lang === 'mr';

  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    const isHome = location.pathname === '/' || location.pathname === '/about' || location.pathname === '/history' || location.pathname === '/worship' || location.pathname === '/festivals' || location.pathname === '/visit' || location.pathname === '/contact';
    if (!isHome) return true;
    if (location.hash || location.pathname !== '/') return window.scrollY > 200;
    return false;
  });

  const contactPhone = settings?.contact?.phone || '9503131031';

  // Hide badges when hero slider is occupying the screen on homepage
  useEffect(() => {
    const isHome = location.pathname === '/' || location.pathname === '/about' || location.pathname === '/history' || location.pathname === '/worship' || location.pathname === '/festivals' || location.pathname === '/visit' || location.pathname === '/contact';
    if (!isHome) {
      setIsVisible(true);
      return;
    }

    const checkSliderOverlap = () => {
      const sliderEl = document.querySelector('.hero-slider-section') || document.querySelector('.hero-slider');
      if (sliderEl) {
        const rect = sliderEl.getBoundingClientRect();
        // Visible only when slider has scrolled past the upper viewport (bottom <= 80px, behind/above sticky header)
        setIsVisible(rect.bottom <= 80);
      } else {
        setIsVisible(true);
      }
    };

    checkSliderOverlap();
    const t1 = setTimeout(checkSliderOverlap, 100);
    const t2 = setTimeout(checkSliderOverlap, 400);

    window.addEventListener('scroll', checkSliderOverlap, { passive: true });
    window.addEventListener('resize', checkSliderOverlap, { passive: true });
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('scroll', checkSliderOverlap);
      window.removeEventListener('resize', checkSliderOverlap);
    };
  }, [location.pathname]);

  // Close modal on Escape key
  useEffect(() => {
    if (!modalOpen) return;
    function onKeyDown(e) {
      if (e.key === 'Escape') setModalOpen(false);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modalOpen]);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [modalOpen]);

  return (
    <>
      {/* Floating Left-Side Badges */}
      <aside className={`quick-action-badges ${isVisible ? 'is-visible' : 'is-hidden'}`} aria-label="त्वरित सेवा / Quick Actions">
        {/* 1. Quick Donate Button */}
        <Link
          to="/donate"
          className="quick-badge-btn quick-badge-donate"
          aria-label={isMr ? 'ऑनलाइन दान करा' : 'Donate Online'}
          title={isMr ? 'ऑनलाइन दान करा / Donate' : 'Donate Online'}
        >
          <div className="badge-icon-box">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2v20" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <span className="badge-label">{isMr ? 'दान' : 'Donate'}</span>
        </Link>

        {/* 2. Quick Darshan & Aarti Timings Button */}
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="quick-badge-btn quick-badge-darshan"
          aria-label={isMr ? 'दर्शन व आरती वेळा पहा' : 'View Darshan & Aarti Timings'}
          title={isMr ? 'दर्शन व आरती वेळा' : 'Darshan & Aarti Timings'}
        >
          <div className="badge-icon-box">
            {/* Sacred Namaste / Prayer Hands Icon */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12.001 2c-.67 0-1.28.37-1.6 1L7.541 8.24c-.3.51-.39 1.13-.24 1.7l1.45 5.56c.15.58.52 1.06 1.04 1.34l1.21.65V21c0 .55.45 1 1 1s1-.45 1-1v-1.51l1.21-.65c.52-.28.89-.76 1.04-1.34l1.45-5.56c.15-.57.06-1.19-.24-1.7L13.601 3c-.32-.63-.93-1-1.6-1zm-1.8 7.37L12 5.85l1.8 3.52-1.07 4.1h-1.46l-1.07-4.1z" />
            </svg>
          </div>
          <span className="badge-label">{isMr ? 'दर्शन' : 'Darshan'}</span>
        </button>
      </aside>

      {/* Darshan & Aarti Timings Modal */}
      {modalOpen && (
        <div className="darshan-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div
            className="darshan-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="darshan-modal-title"
          >
            {/* Modal Header */}
            <div className="darshan-modal-header">
              <div className="darshan-modal-title-wrap">
                <span className="darshan-modal-deity">॥ ॐ ब्रह्मणे नमः ॥</span>
                <h3 id="darshan-modal-title">
                  {isMr ? 'दर्शन व नित्य आरती वेळा' : 'Daily Darshan & Aarti Timings'}
                </h3>
                <small className="darshan-modal-sub">
                  {isMr ? 'श्री क्षेत्र ब्रह्मदेव देवस्थान, कल्लाळी' : 'Shri Kshetra Brahmadev Devasthan, Kallali'}
                </small>
              </div>
              <button
                type="button"
                className="darshan-modal-close"
                onClick={() => setModalOpen(false)}
                aria-label={isMr ? 'बंद करा' : 'Close modal'}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="darshan-modal-body">
              <div className="darshan-time-row">
                <div className="time-badge-icon">🌅</div>
                <div className="time-details">
                  <strong>{isMr ? 'सकाळची मंगल आरती व पूजा' : 'Morning Mangal Aarti & Pooja'}</strong>
                  <p>{isMr ? 'नित्य प्रातःकाल विधी व अभिषेक' : 'Daily Morning Worship & Archana'}</p>
                </div>
                <div className="time-val">{isMr ? 'स. ०६:०० ते ०७:००' : '6:00 AM – 7:00 AM'}</div>
              </div>

              <div className="darshan-time-row highlight">
                <div className="time-badge-icon">🪔</div>
                <div className="time-details">
                  <strong>{isMr ? 'सर्व भाविकांसाठी नित्य दर्शन' : 'General Devotee Darshan'}</strong>
                  <p>{isMr ? 'दिवसभर गाभारा व मंदिर दर्शन खुले' : 'Sanctum sanctorum open for all devotees'}</p>
                </div>
                <div className="time-val gold">{isMr ? 'स. ०६:०० ते रा. ०९:००' : '6:00 AM – 9:00 PM'}</div>
              </div>

              <div className="darshan-time-row">
                <div className="time-badge-icon">✨</div>
                <div className="time-details">
                  <strong>{isMr ? 'संध्या आरती व दीप आराधना' : 'Evening Sandhya Aarti'}</strong>
                  <p>{isMr ? 'सामूहिक संध्या प्रार्थना व धूपारती' : 'Evening Prayers & Sacred Deepotsav'}</p>
                </div>
                <div className="time-val">{isMr ? 'सां. ०७:३० वाजता' : '7:30 PM'}</div>
              </div>

              <div className="darshan-time-row">
                <div className="time-badge-icon">🌸</div>
                <div className="time-details">
                  <strong>{isMr ? 'विशेष पूजा, अभिषेक व नवस' : 'Special Abhishek & Pooja'}</strong>
                  <p>{isMr ? 'कार्यालय पूर्वनोंदणीनुसार विधी संपन्न' : 'Conducted with prior temple office registration'}</p>
                </div>
                <div className="time-val">{isMr ? 'विनंतीनुसार' : 'On Request'}</div>
              </div>

              <div className="darshan-notice-box">
                <span className="notice-icon">ℹ️</span>
                <p>
                  {isMr
                    ? 'यात्रा महोत्सव किंवा विशेष पर्वणी दिवशी आरती व दर्शनाच्या वेळेत विश्वस्त मंडळाच्या निर्णयानुसार बदल असू शकतात.'
                    : 'During annual Yatra Mahotsav and festival days, darshan timings are subject to adjustments by the temple committee.'}
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="darshan-modal-footer">
              <a
                href={`tel:${contactPhone}`}
                className="btn small"
                style={{ background: 'var(--maroon-2)', color: '#fff', border: '1px solid var(--gold)' }}
              >
                📞 {isMr ? `कार्यालय: ${contactPhone}` : `Call: ${contactPhone}`}
              </a>
              <Link
                to="/#visit"
                className="btn small primary"
                onClick={() => setModalOpen(false)}
              >
                📍 {isMr ? 'कसे पोहोचावे / नकाशा' : 'Directions & Map'}
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
