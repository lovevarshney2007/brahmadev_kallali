import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { SiteProvider } from './SiteContext.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
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
  const { pathname, hash } = useLocation();
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

    if (targetId) {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      // Retry scroll once lazy-loaded page chunk finishes rendering
      const timer = setTimeout(() => {
        const target = document.getElementById(targetId);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      }, 350);
      return () => clearTimeout(timer);
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  // Staggered Scroll Reveal Observer
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
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
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -30px 0px',
      }
    );

    const scan = () => {
      // 1. Observe elements explicitly marked with .reveal-on-scroll
      document.querySelectorAll('.reveal-on-scroll:not(.is-revealed)').forEach((el) => {
        observer.observe(el);
      });

      // 2. Automatically observe major section and card blocks across all pages
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
        'main .committee-card'
      ];
      document.querySelectorAll(autoSelectors.join(', ')).forEach((el) => {
        if (!el.classList.contains('reveal-on-scroll') && !el.classList.contains('is-revealed')) {
          el.classList.add('reveal-on-scroll');
          observer.observe(el);
        }
      });
    };

    scan();
    const timer1 = setTimeout(scan, 200);
    const timer2 = setTimeout(scan, 600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}

export default function App() {
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
      <ScrollToTop />
    </SiteProvider>
  );
}
