import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { SiteProvider } from './SiteContext.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

// Route-level code-splitting: Keeps initial bundle tiny and fast
const Home = lazy(() => import('./pages/Home.jsx'));
const Donate = lazy(() => import('./pages/Donate.jsx'));
const Ledger = lazy(() => import('./pages/Ledger.jsx'));
const Gallery = lazy(() => import('./pages/Gallery.jsx'));
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

// Scrolls to #section links and to the top on page change.
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const id = hash.slice(1);
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      // Retry scroll once lazy-loaded page chunk finishes rendering
      const timer = setTimeout(() => {
        const target = document.getElementById(id);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      }, 350);
      return () => clearTimeout(timer);
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
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
              <Route path="/donate" element={<Donate />} />
              <Route path="/ledger" element={<Ledger />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </SiteProvider>
  );
}
