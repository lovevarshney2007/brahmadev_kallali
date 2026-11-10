import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useSite } from '../SiteContext.jsx';

export function Logo({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <path d="M20 2l2.5 5h-5z" fill="#F5C542" />
      <path d="M20 8c-5 6-7 12-8 18h16c-1-6-3-12-8-18z" fill="#D48216" />
      <rect x="9" y="26" width="22" height="3" fill="#F5C542" />
      <rect x="7" y="29" width="26" height="9" fill="#F5C542" opacity=".7" />
    </svg>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const { settings, lang, setLang, t } = useSite();
  const close = () => setOpen(false);

  const links = [
    ['/#about', t.nav.about],
    ['/#history', t.nav.history],
    ['/#worship', t.nav.worship],
    ['/#festivals', t.nav.festivals],
    ['/#visit', t.nav.visit],
    ['/gallery', t.nav.gallery],
    ['/ledger', t.nav.ledger],
    ['/#contact', t.nav.contact],
  ];

  // Close mobile navigation on Escape key
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  // Lock background scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <header className="site-header">
        <div className="wrap">
          <Link className="brand" to="/" onClick={close}>
            <Logo />
            <span><b>{t.brandTitle}</b><small>{t.brandSub}</small></span>
          </Link>

          <div className="header-actions">
            <div className="lang-toggle" role="group" aria-label="Language selection">
              <button
                type="button"
                className={`lang-btn${lang === 'mr' ? ' active' : ''}`}
                onClick={() => setLang('mr')}
                aria-pressed={lang === 'mr'}
                title="मराठी"
              >
                मराठी
              </button>
              <button
                type="button"
                className={`lang-btn${lang === 'en' ? ' active' : ''}`}
                onClick={() => setLang('en')}
                aria-pressed={lang === 'en'}
                title="English"
              >
                EN
              </button>
            </div>

            <button
              className="menu-btn"
              aria-expanded={open}
              aria-controls="mainNav"
              aria-label="Toggle navigation menu"
              onClick={() => setOpen(!open)}
            >
              {open ? '✕' : 'Menu'}
            </button>
          </div>

          {open && <div className="nav-backdrop" onClick={close} aria-hidden="true" />}
          <nav id="mainNav" className={`site-nav${open ? ' open' : ''}`} aria-label="Main">
            <ul>
              {links.map(([to, label]) => (
                <li key={to}>
                  {to.startsWith('/#')
                    ? <Link to={to} onClick={close}>{label}</Link>
                    : <NavLink to={to} onClick={close}>{label}</NavLink>}
                </li>
              ))}
              <li><NavLink className="cta" to="/donate" onClick={close}>{t.nav.donate}</NavLink></li>
            </ul>
          </nav>
        </div>
      </header>
      {settings?.announcement && (
        <div className="announce" role="status"><div className="wrap">{settings.announcement}</div></div>
      )}
    </>
  );
}
