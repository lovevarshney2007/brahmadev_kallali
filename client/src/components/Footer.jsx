import { Link } from 'react-router-dom';
import { useSite } from '../SiteContext.jsx';
import { TEMPLE_MAPS_SEARCH_URL } from '../location.js';

export default function Footer() {
  const { t, lang } = useSite();
  const isMr = lang === 'mr';

  return (
    <footer className="site-footer">

      {/* ── Main Footer Grid ── */}
      <div className="footer-main wrap">

        {/* Column 1 — About / Brand */}
        <div className="footer-col footer-brand">
          <h3>{t.brandFull}</h3>
          <p>{t.footer.desc}</p>
          <p lang="mr" style={{ fontFamily: 'var(--display)', color: 'var(--gold-bright)', marginTop: '0.5rem' }}>
            {t.footer.mantra}
          </p>
        </div>

        {/* Column 2 — Quick Links */}
        <div className="footer-col">
          <h4 className="footer-col-title">{isMr ? 'त्वरित दुवे' : 'Quick Links'}</h4>
          <ul className="footer-links">
            <li><Link to="/">{isMr ? 'मुख्यपान' : 'Home'}</Link></li>
            <li><Link to="/#about">{isMr ? 'मंदिराबद्दल' : 'About Temple'}</Link></li>
            <li><Link to="/yatra">{isMr ? 'यात्रा महोत्सव' : 'Yatra Mahotsav'}</Link></li>
            <li><Link to="/gallery">{isMr ? 'फोटो गॅलरी' : 'Gallery'}</Link></li>
            <li><Link to="/news">{isMr ? 'बातम्या' : 'News'}</Link></li>
            <li><Link to="/committee">{isMr ? 'विश्वस्त मंडळ' : 'Committee'}</Link></li>
            <li><Link to="/ledger">{isMr ? 'देणगी हिशोब' : 'Daan Ledger'}</Link></li>
            <li><Link to="/donate" style={{ color: 'var(--gold-bright)', fontWeight: 600 }}>{isMr ? 'देणगी द्या' : 'Donate'}</Link></li>
          </ul>
        </div>

        {/* Column 3 — Contact Information */}
        <div className="footer-col">
          <h4 className="footer-col-title">{isMr ? 'संपर्क माहिती' : 'Contact Information'}</h4>
          <ul className="footer-contact-list">
            <li>
              <span className="fc-icon">📍</span>
              <span>
                <a href={TEMPLE_MAPS_SEARCH_URL} target="_blank" rel="noopener noreferrer">
                  {isMr
                    ? 'श्री क्षेत्र ब्रह्मदेव देवस्थान, कल्लाळी (कल्हाळी), कंधार, नांदेड, महाराष्ट्र - ४३१७१५'
                    : 'Shri Kshetra Brahmadev Devasthan, Kallali (Kalhali), Kandhar, Nanded, Maharashtra - 431715'}
                </a>
              </span>
            </li>
            <li>
              <span className="fc-icon">📞</span>
              <span>
                <a href="tel:+917588375204">+91 75883 75204</a><br />
                <a href="tel:+917588371245">+91 75883 71245</a>
              </span>
            </li>
            <li>
              <span className="fc-icon">✉️</span>
              <span><a href="mailto:brahmadevkallali@gmail.com">brahmadevkallali@gmail.com</a></span>
            </li>
            <li>
              <span className="fc-icon">🕐</span>
              <span>{isMr ? 'दर्शन वेळ: सकाळी ६:०० – रात्री ९:०० वाजेपर्यंत' : 'Darshan: 6:00 AM – 9:00 PM'}</span>
            </li>
          </ul>
        </div>

        {/* Column 4 — Follow Us */}
        <div className="footer-col">
          <h4 className="footer-col-title">{isMr ? 'आमच्यासोबत जुडा' : 'Follow Us On'}</h4>
          <ul className="footer-social">
            <li>
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
                <span className="social-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </span>
                Facebook
              </a>
            </li>
            <li>
              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                <span className="social-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </span>
                Instagram
              </a>
            </li>
            <li>
              <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer">
                <span className="social-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.4a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/></svg>
                </span>
                YouTube
              </a>
            </li>
            <li>
              <a href="https://wa.me/917588375204" target="_blank" rel="noopener noreferrer">
                <span className="social-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.5 2a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 11.5 2zm0 17.5a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/></svg>
                </span>
                WhatsApp
              </a>
            </li>
          </ul>
        </div>

      </div>

      {/* ── Bottom Bar ── */}
      <div className="footer-bottom">
        <div className="wrap footer-bottom-inner">
          <p className="footer-copy">© {new Date().getFullYear()} {t.footer.copyright}</p>
          <nav className="footer-legal-links" aria-label="Legal links">
            <Link to="/privacy-policy">{isMr ? 'गोपनीयता धोरण' : 'Privacy Policy'}</Link>
            <span aria-hidden="true">|</span>
            <Link to="/terms">{isMr ? 'अटी व शर्ती' : 'Terms & Conditions'}</Link>
            <span aria-hidden="true">|</span>
            <Link to="/#contact">{isMr ? 'संपर्क करा' : 'Contact Us'}</Link>
          </nav>
        </div>
      </div>

    </footer>
  );
}
