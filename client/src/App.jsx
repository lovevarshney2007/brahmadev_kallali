import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { SiteProvider } from './SiteContext.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import QuickActionBadges from './components/QuickActionBadges.jsx';
import SocialFloatingBar from './components/SocialFloatingBar.jsx';
import FloatingDiya from './components/FloatingDiya.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

// Route-level code-splitting: Keeps initial bundle tiny and fast
const Home = lazy(() => import('./pages/Home.jsx'));
const Donate = lazy(() => import('./pages/Donate.jsx'));
const Ledger = lazy(() => import('./pages/Ledger.jsx'));
const Gallery = lazy(() => import('./pages/Gallery.jsx'));
const Yatra = lazy(() => import('./pages/Yatra.jsx'));
const News = lazy(() => import('./pages/News.jsx'));
const Committee = lazy(() => import('./pages/Committee.jsx'));
const AdminLogin = lazy(() => import('./pages/admin/Login.jsx'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

function PageLoader() {
  return (
    <div className="page-loader" role="status" aria-label="Loading page content">
      <div className="loader-spinner" />
      <span className="small muted">Loading…</span>
    </div>
  );
}

// Scrolls to #section links and to the top on page change, or scrolls to alias sections
function ScrollManager() {
  const { pathname, hash, key } = useLocation();
  useEffect(() => {
    const aliasMap = {
      '/visit': 'visit',
      '/contact': 'contact',
      '/about': 'about',
      '/history': 'history',
      '/worship': 'worship',
      '/festivals': 'festivals',
    };
    const targetId = hash ? hash.slice(1) : aliasMap[pathname];

    if (!targetId) {
      window.scrollTo(0, 0);
      return;
    }

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 40;
    let pollTimer = null;
    let resyncTimer = null;

    const getDocTop = (el) => el.getBoundingClientRect().top + window.scrollY;

    const scrollToTarget = () => {
      if (cancelled) return null;
      const el = document.getElementById(targetId);
      if (!el) return null;

      if (el.classList.contains('reveal-on-scroll')) {
        el.classList.add('is-revealed');
      }
      el.querySelectorAll('.reveal-on-scroll').forEach((node) => {
        node.classList.add('is-revealed');
      });

      const docTop = getDocTop(el);
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return docTop;
    };

    const tryScroll = () => {
      if (cancelled) return;
      const initialDocTop = scrollToTarget();
      if (initialDocTop !== null) {
        resyncTimer = setTimeout(() => {
          if (cancelled) return;
          const el = document.getElementById(targetId);
          if (el) {
            const newDocTop = getDocTop(el);
            if (Math.abs(newDocTop - initialDocTop) > 40) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }
        }, 650);
        return;
      }
      attempts += 1;
      if (attempts < maxAttempts) {
        pollTimer = setTimeout(tryScroll, 80);
      }
    };

    const raf = requestAnimationFrame(tryScroll);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      if (pollTimer) clearTimeout(pollTimer);
      if (resyncTimer) clearTimeout(resyncTimer);
    };
  }, [pathname, hash, key]);

  // Staggered Scroll Reveal Observer
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (
      !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
        el.classList.add('is-revealed');
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting || entry.boundingClientRect.top < window.innerHeight) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.01,
        rootMargin: '80px 0px 80px 0px',
      }
    );

    const autoSelectors = [
      'main .sec > .wrap > .head',
      'main .sec .card',
      'main .sec .tile',
      'main .split > *',
      'main .cols > *',
      'main .photo-item',
      'main .video-card',
      'main .home-video-card',
      'main .travel-card',
      'main .fest-cal-card',
      'main .timeline li',
      'main .tablebox',
      'main .committee-card',
    ].join(', ');

    const revealVisible = () => {
      const vh = window.innerHeight || 900;
      document.querySelectorAll('.reveal-on-scroll:not(.is-revealed)').forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.height > 0 && rect.top <= vh + 60) {
          el.classList.add('is-revealed');
          observer.unobserve(el);
        }
      });
    };

    const scan = () => {
      document.querySelectorAll(autoSelectors).forEach((el) => {
        if (!el.classList.contains('reveal-on-scroll') && !el.classList.contains('is-revealed')) {
          el.classList.add('reveal-on-scroll');
          observer.observe(el);
        }
      });
      document.querySelectorAll('.reveal-on-scroll:not(.is-revealed)').forEach((el) => {
        observer.observe(el);
      });
      revealVisible();
    };

    scan();
    const mainEl = document.querySelector('main');
    let mutObserver = null;
    if (mainEl && 'MutationObserver' in window) {
      mutObserver = new MutationObserver(() => {
        scan();
      });
      mutObserver.observe(mainEl, { childList: true, subtree: true });
    }

    const timer1 = setTimeout(scan, 150);
    const timer2 = setTimeout(scan, 500);
    window.addEventListener('scroll', revealVisible, { passive: true });

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener('scroll', revealVisible);
      if (mutObserver) mutObserver.disconnect();
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}

export default function App() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <SiteProvider>
      <ScrollManager />
      <Header />
      <main>
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<Home />} />
              <Route path="/history" element={<Home />} />
              <Route path="/worship" element={<Home />} />
              <Route path="/festivals" element={<Home />} />
              <Route path="/visit" element={<Home />} />
              <Route path="/contact" element={<Home />} />
              <Route path="/donate" element={<Donate />} />
              <Route path="/ledger" element={<Ledger />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/yatra" element={<Yatra />} />
              <Route path="/news" element={<News />} />
              <Route path="/committee" element={<Committee />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
      {!isAdmin && <QuickActionBadges />}
      {!isAdmin && <SocialFloatingBar />}
      <ScrollToTop />
      {!isAdmin && <FloatingDiya />}
    </SiteProvider>
  );
}
