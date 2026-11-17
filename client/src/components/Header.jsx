import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useSite } from '../SiteContext.jsx';
import { Toran } from './Decor.jsx';
import SearchModal from './SearchModal.jsx';

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
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { settings, lang, setLang, fontSize, setFontSize, t } = useSite();
  const location = useLocation();
  const navRef = useRef(null);
  const timerRef = useRef(null);

  // Dynamic header elevation and reading scroll progress
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollTop = window.scrollY || document.documentElement.scrollTop;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
          setScrollProgress(Math.min(100, Math.max(0, progress)));
          setIsScrolled(scrollTop > 20);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Global Ctrl+K / Cmd+K shortcut to open search modal
  useEffect(() => {
    function onKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

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
      <header className={`site-header${isScrolled ? ' is-scrolled' : ''}`}>
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

          {/* Right Actions: Font Resizer + Search + Lang toggle + Donate + Mobile Menu Button */}
          <div className="header-actions">
            {/* Font Size Accessibility Controls (A- A A+) */}
            <div className="font-resizer" role="group" aria-label="Font size controls">
              <button
                type="button"
                className={`font-btn${fontSize === 'small' ? ' active' : ''}`}
                onClick={() => setFontSize('small')}
                title="लहान अक्षर / Small text (A-)"
                aria-label="Small font size (A-)"
              >
                A-
              </button>
              <button
                type="button"
                className={`font-btn${fontSize === 'normal' ? ' active' : ''}`}
                onClick={() => setFontSize('normal')}
                title="सामान्य अक्षर / Normal text (A)"
                aria-label="Normal font size (A)"
              >
                A
              </button>
              <button
                type="button"
                className={`font-btn${fontSize === 'large' ? ' active' : ''}`}
                onClick={() => setFontSize('large')}
                title="मोठे अक्षर / Large text (A+)"
                aria-label="Large font size (A+)"
              >
                A+
              </button>
            </div>

            {/* Quick Search Button (🔍) */}
            <button
              type="button"
              className="header-search-btn"
              onClick={() => setSearchOpen(true)}
              title={lang === 'mr' ? 'वेबसाईटवर शोधा (Ctrl+K)' : 'Search temple site (Ctrl+K)'}
              aria-label="Search temple website"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>

            {/* Language Selection Toggle */}
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

        {/* Auspicious golden scroll reading progress indicator */}
        <div
          className="scroll-progress-bar"
          style={{ width: `${scrollProgress}%` }}
          aria-hidden="true"
        />
      </header>

      {settings?.announcement && (
        <div className="announce" role="status">
          <div className="wrap">{settings.announcement}</div>
        </div>
      )}

      <Toran />

      {/* Global Interactive Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
