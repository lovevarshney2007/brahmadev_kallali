import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSite } from '../SiteContext.jsx';

/**
 * SocialFloatingBar:
 * Floating Social Media stack on the right edge of the screen (similar to Shirdi Saibaba Trust).
 * Hidden while hero slider is in view, visible on the rest of the page.
 */
export default function SocialFloatingBar() {
  const [collapsed, setCollapsed] = useState(false);
  const { lang, settings } = useSite();
  const location = useLocation();
  const isMr = lang === 'mr';

  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    const isHome = location.pathname === '/' || location.pathname === '/about' || location.pathname === '/history' || location.pathname === '/worship' || location.pathname === '/festivals' || location.pathname === '/visit' || location.pathname === '/contact';
    if (!isHome) return true;
    if (location.hash || location.pathname !== '/') return window.scrollY > 200;
    return false;
  });

  // Hide bar when hero slider is occupying the screen on homepage
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
        // Visible only when slider has scrolled past upper viewport (bottom <= 80px, behind/above sticky header)
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

  const phone = settings?.contact?.phone || '9503131031';
  const whatsappMsg = encodeURIComponent(
    isMr
      ? 'जय ब्रह्मदेव! मला श्री क्षेत्र ब्रह्मदेव देवस्थान, कल्लाळी विषयी माहिती हवी आहे.'
      : 'Jai Brahmadev! I would like to enquire about Shri Kshetra Brahmadev Devasthan, Kallali.'
  );

  const socialLinks = {
    whatsapp: settings?.social?.whatsapp || `https://wa.me/91${phone}?text=${whatsappMsg}`,
    youtube: settings?.social?.youtube || 'https://www.youtube.com/@ShriBrahmadevDevasthanKallali',
    instagram: settings?.social?.instagram || 'https://www.instagram.com/shribrahmadevdevasthankallali/',
    facebook: settings?.social?.facebook || 'https://www.facebook.com/shribrahmadevdevasthankallali',
  };

  return (
    <aside
      className={`social-floating-bar ${collapsed ? 'is-collapsed' : ''} ${isVisible ? 'is-visible' : 'is-hidden'}`}
      aria-label="सोशल मीडिया / Social Links"
    >
      {/* 1. Collapse / Expand Toggle Button */}
      <button
        type="button"
        className="social-toggle-btn"
        onClick={() => setCollapsed(!collapsed)}
        aria-expanded={!collapsed}
        aria-label={
          collapsed
            ? (isMr ? 'सोशल मीडिया उघडा' : 'Expand social menu')
            : (isMr ? 'सोशल मीडिया लपवा' : 'Collapse social menu')
        }
        title={collapsed ? (isMr ? 'सोशल मीडिया (+)' : 'Expand (+)') : (isMr ? 'लपवा (−)' : 'Collapse (−)')}
      >
        <span className="toggle-glyph">{collapsed ? '+' : '−'}</span>
      </button>

      {/* 2. Stack of Social Links */}
      <div className="social-stack" aria-hidden={collapsed}>
        {/* WhatsApp */}
        <a
          href={socialLinks.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="social-icon-btn social-whatsapp"
          aria-label={isMr ? 'व्हाट्सॲप संपर्क / अपडेट्स' : 'WhatsApp Contact & Updates'}
          title="WhatsApp"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.42 0-2.82-.37-4.06-1.07l-.29-.17-3.12.82.83-3.04-.19-.3a8.163 8.163 0 0 1-1.26-4.47c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.66c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.98-.14.17-.29.19-.54.07-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.47c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.12.17 1.78 2.72 4.31 3.81.6.26 1.07.42 1.44.54.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.12-.22-.19-.47-.31z" />
          </svg>
          <span className="social-tooltip">WhatsApp</span>
        </a>

        {/* YouTube */}
        <a
          href={socialLinks.youtube}
          target="_blank"
          rel="noopener noreferrer"
          className="social-icon-btn social-youtube"
          aria-label={isMr ? 'यूट्यूब चॅनल (व्हिडिओ व आरती)' : 'YouTube Channel (Videos & Aarti)'}
          title="YouTube"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
          <span className="social-tooltip">YouTube</span>
        </a>

        {/* Instagram */}
        <a
          href={socialLinks.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="social-icon-btn social-instagram"
          aria-label={isMr ? 'इन्स्टाग्राम (दैनंदिन दर्शन व रील्स)' : 'Instagram (Daily Darshan & Photos)'}
          title="Instagram"
        >
          <svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
          <span className="social-tooltip">Instagram</span>
        </a>

        {/* Facebook */}
        <a
          href={socialLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="social-icon-btn social-facebook"
          aria-label={isMr ? 'फेसबुक पेज' : 'Facebook Page'}
          title="Facebook"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          <span className="social-tooltip">Facebook</span>
        </a>
      </div>
    </aside>
  );
}
