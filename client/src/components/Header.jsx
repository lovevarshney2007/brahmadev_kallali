import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useSite } from '../SiteContext.jsx';
import { Toran } from './Decor.jsx';

export function Logo({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <path d="M20 2l2.5 5h-5z" fill="#F5B041" />
      <path d="M20 8c-5 6-7 12-8 18h16c-1-6-3-12-8-18z" fill="#E67E22" />
      <rect x="9" y="26" width="22" height="3" fill="#C88A2E" />
      <rect x="7" y="29" width="26" height="9" fill="#C88A2E" opacity=".7" />
    </svg>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null); // null | 'about' | 'yatra'
  const { settings, lang, setLang, t } = useSite();
  const location = useLocation();
  const navRef = useRef(null);
  const timerRef = useRef(null);

  const close = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpen(false);
    setActiveDropdown(null);
  };

  const handleMouseEnter = (name) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setActiveDropdown(name);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 180);
  };

  const toggleDropdown = (name) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  // Close menus when route changes
  useEffect(() => {
    close();
  }, [location.pathname, location.hash, location.search]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile navigation on Escape key
  useEffect(() => {
    if (!open && !activeDropdown) return;
    function onKeyDown(e) {
      if (e.key === 'Escape') close();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, activeDropdown]);

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

  const isAboutOpen = activeDropdown === 'about';
  const isYatraOpen = activeDropdown === 'yatra';

  return (
    <>
      <header className="site-header">
        <div className="wrap header-wrap">
          {/* Brand Left */}
          <Link className="brand" to="/" onClick={close}>
            <Logo />
            <span>
              <b>{t.brandTitle}</b>
              <small>{t.brandSub}</small>
            </span>
          </Link>

          {/* Center Navigation */}
          {open && <div className="nav-backdrop" onClick={close} aria-hidden="true" />}
          <nav
            id="mainNav"
            ref={navRef}
            className={`site-nav${open ? ' open' : ''}`}
            aria-label="Main navigation"
          >
            <ul className="nav-list">
              <li>
                <NavLink to="/" end onClick={close}>
                  {t.nav.home}
                </NavLink>
              </li>

              {/* About Us Dropdown */}
              <li
                className={`nav-item-dropdown${isAboutOpen ? ' expanded' : ''}`}
                onMouseEnter={() => handleMouseEnter('about')}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  className="nav-dropdown-trigger"
                  aria-expanded={isAboutOpen}
                  aria-haspopup="true"
                  onClick={() => toggleDropdown('about')}
                >
                  {t.nav.aboutUs}
                  <span className="dropdown-caret" aria-hidden="true">▾</span>
                </button>
                <ul className={`nav-dropdown-menu${isAboutOpen ? ' open' : ''}`}>
                  <li>
                    <Link to="/#about" onClick={close}>
                      {t.nav.aboutTemple}
                    </Link>
                  </li>
                  <li>
                    <Link to="/#history" onClick={close}>
                      {t.nav.historyHeritage}
                    </Link>
                  </li>
                  <li>
                    <NavLink to="/ledger" onClick={close}>
                      {t.nav.daanLedger}
                    </NavLink>
                  </li>
                </ul>
              </li>

              {/* Yatra Mahotsav Dropdown */}
              <li
                className={`nav-item-dropdown${isYatraOpen ? ' expanded' : ''}`}
                onMouseEnter={() => handleMouseEnter('yatra')}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  className="nav-dropdown-trigger"
                  aria-expanded={isYatraOpen}
                  aria-haspopup="true"
                  onClick={() => toggleDropdown('yatra')}
                >
                  {t.nav.yatraMahotsav}
                  <span className="dropdown-caret" aria-hidden="true">▾</span>
                </button>
                <ul className={`nav-dropdown-menu${isYatraOpen ? ' open' : ''}`}>
                  <li>
                    <NavLink to="/yatra" end onClick={close}>
                      {t.nav.yatraOverview}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/yatra?tab=schedule" onClick={close}>
                      {t.nav.programmeSchedule}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/yatra?tab=rituals" onClick={close}>
                      {t.nav.ritualsTraditions}
                    </NavLink>
                  </li>
                </ul>
              </li>

              <li>
                <NavLink to="/gallery" onClick={close}>
                  {t.nav.gallery}
                </NavLink>
              </li>

              <li>
                <NavLink to="/news" onClick={close}>
                  {t.nav.news}
                </NavLink>
              </li>

              <li>
                <Link to="/#visit" onClick={close}>
                  {t.nav.visit}
                </Link>
              </li>

              <li>
                <NavLink to="/committee" onClick={close}>
                  {t.nav.committee}
                </NavLink>
              </li>

              <li>
                <Link to="/#contact" onClick={close}>
                  {t.nav.contact}
                </Link>
              </li>

              {/* Mobile-only donate link inside nav list */}
              <li className="mobile-only-donate">
                <Link className="cta-donate full-width" to="/donate" onClick={close}>
                  {t.nav.donate}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Right Actions: Lang toggle + Prominent Saffron Donate + Mobile Menu Button */}
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

            {/* Prominent Saffron DONATE button at far right */}
            <Link className="cta-donate header-donate" to="/donate" onClick={close}>
              {t.nav.donate}
            </Link>

            <button
              className="menu-btn"
              aria-expanded={open}
              aria-controls="mainNav"
              aria-label="Toggle navigation menu"
              onClick={() => setOpen(!open)}
            >
              {open ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </header>

      {settings?.announcement && (
        <div className="announce" role="status">
          <div className="wrap">{settings.announcement}</div>
        </div>
      )}

      <Toran />
    </>
  );
}
