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
          <p lang="mr" style={{ fontFamily: 'var(--display)', color: 'var(--gold-bright)' }}>{t.footer.mantra}</p>
        </div>
        <ul>
          <li><Link to="/">{t.footer.home}</Link></li>
          <li><Link to="/#about">{t.nav.about}</Link></li>
          <li><Link to="/#history">{t.nav.history}</Link></li>
          <li><Link to="/#worship">{t.nav.worship}</Link></li>
          <li><Link to="/#festivals">{t.nav.festivals}</Link></li>
          <li><Link to="/gallery">{t.nav.gallery}</Link></li>
          <li><Link to="/donate">{t.nav.donate}</Link></li>
          <li><Link to="/ledger">{t.nav.ledger}</Link></li>
          <li><Link to="/#contact">{t.nav.contact}</Link></li>
          <li><Link to="/admin">{t.footer.trustLogin}</Link></li>
        </ul>
        <p className="copyline">© {new Date().getFullYear()} {t.footer.copyright}</p>
      </div>
    </footer>
  );
}
