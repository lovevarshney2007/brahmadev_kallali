import { Link } from 'react-router-dom';
import { useSite } from '../SiteContext.jsx';

export default function Footer() {
  const { t } = useSite();

  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="prose">
          <h3>{t.brandFull}</h3>
          <p>{t.footer.desc}</p>
          <p lang="mr" style={{ fontFamily: 'var(--display)', color: 'var(--gold-bright)' }}>
            {t.footer.mantra}
          </p>
        </div>
        <ul>
          <li><Link to="/">{t.footer.home}</Link></li>
          <li><Link to="/#about">{t.footer.about}</Link></li>
          <li><Link to="/yatra">{t.footer.yatra}</Link></li>
          <li><Link to="/gallery">{t.footer.gallery}</Link></li>
          <li><Link to="/news">{t.footer.news}</Link></li>
          <li><Link to="/#visit">{t.footer.visit}</Link></li>
          <li><Link to="/committee">{t.footer.committee}</Link></li>
          <li><Link to="/ledger">{t.footer.ledger}</Link></li>
          <li><Link to="/#contact">{t.footer.contact}</Link></li>
          <li><Link to="/donate" style={{ color: 'var(--gold-bright)', fontWeight: 600 }}>{t.footer.donate}</Link></li>
          <li><Link to="/admin">{t.footer.trustLogin}</Link></li>
        </ul>
        <p className="copyline">© {new Date().getFullYear()} {t.footer.copyright}</p>
      </div>
    </footer>
  );
}
