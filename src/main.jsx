import React, { useState, useEffect, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import { Loader } from './components/shared';
import { api, setCsrf } from './api.js';
import './styles.css';

// ─── Lazy page chunks ─────────────────────────────────────────────────────────
const Home = lazy(() => import('./pages/Home').then((m) => ({ default: m.Home })));
const About = lazy(() => import('./pages/About').then((m) => ({ default: m.About })));
const Courses = lazy(() => import('./pages/Courses').then((m) => ({ default: m.Courses })));
const CourseDetail = lazy(() =>
  import('./pages/CourseDetail').then((m) => ({ default: m.CourseDetail }))
);
const AuthPage = lazy(() => import('./pages/AuthPage').then((m) => ({ default: m.AuthPage })));
const Dashboard = lazy(() =>
  import('./pages/Dashboard').then((m) => ({ default: m.Dashboard }))
);
const Learn = lazy(() => import('./pages/Learn').then((m) => ({ default: m.Learn })));
const Checkout = lazy(() => import('./pages/Checkout').then((m) => ({ default: m.Checkout })));
const Account = lazy(() => import('./pages/Account').then((m) => ({ default: m.Account })));
const Policy = lazy(() => import('./pages/Policy').then((m) => ({ default: m.Policy })));
const Admin = lazy(() => import('./owner.jsx').then((m) => ({ default: m.Admin })));

// ─── RequireAuth ──────────────────────────────────────────────────────────────
function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  return user ? children : <Navigate to="/login" replace />;
}

// ─── ErrorBoundary ────────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    if (this.state.error)
      return (
        <div className="empty-state">
          <h1>Let's try that again.</h1>
          <p>The page could not finish loading.</p>
          <a className="button" href="/">
            Return to FAME
          </a>
        </div>
      );
    return this.props.children;
  }
}

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  const [session, setSession] = useState({ user: null, loading: true, mode: 'demo' });
  const location = useLocation();
  const navigate = useNavigate();
  const [sessionError, setSessionError] = useState('');

  const refresh = async () => {
    const s = await api('/session');
    setSession({ ...s, loading: false });
    return s;
  };

  // Initial session load
  useEffect(() => {
    refresh().catch((e) => {
      setSessionError(e.message);
      setSession((s) => ({ ...s, loading: false }));
    });
  }, []);

  // Scroll-to-top + page title on route change
  useEffect(() => {
    window.scrollTo(0, 0);
    const titles = {
      '/': 'Build a food business that goes further',
      '/about': 'Meet Manmath Biradar',
      '/courses': 'Explore programmes',
      '/dashboard': 'My learning',
      '/account': 'My account',
      '/admin': 'Owner dashboard',
    };
    document.title = `FAME · ${titles[location.pathname] || 'Your learning journey'}`;
  }, [location.pathname]);

  // Optional MCP tool registration (non-standard, fails silently if unavailable)
  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try {
      Promise.resolve(
        context.registerTool(
          {
            name: 'fame_list_programmes',
            title: 'List FAME programmes',
            description: 'Read available FAME programmes and their public course information.',
            inputSchema: { type: 'object', properties: {}, additionalProperties: false },
            annotations: { readOnlyHint: true },
            execute: async (input) => {
              if (!input || Object.keys(input).length)
                throw new Error('No input fields are accepted.');
              const items = await api('/courses');
              return items.map((c) => ({
                title: c.title,
                slug: c.slug,
                price: c.price,
                currency: 'INR',
                status: c.status,
              }));
            },
          },
          { signal: lifecycle.signal }
        )
      ).catch(() => {});
    } catch {}
    return () => lifecycle.abort();
  }, []);

  const logout = async () => {
    await api('/auth/logout', { method: 'POST' });
    setCsrf('');
    await refresh();
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ ...session, refresh, logout }}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {session.mode === 'demo' && (
        <div className="demo-banner">
          PREVIEW MODE{' '}
          <span>Explore the platform. Payments are simulated; no money is charged.</span>
        </div>
      )}
      {sessionError ? (
        <div className="wrap section">
          <div className="notice error" role="alert">
            {sessionError}
          </div>
          <button className="button" onClick={() => window.location.reload()}>
            Reload
          </button>
        </div>
      ) : session.loading ? (
        <Loader />
      ) : (
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:slug" element={<CourseDetail />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage mode="register" />} />
            <Route path="/forgot-password" element={<AuthPage mode="forgot" />} />
            <Route path="/reset-password" element={<AuthPage mode="reset" />} />
            <Route path="/verify-email" element={<AuthPage mode="verify" />} />
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              }
            />
            <Route
              path="/account"
              element={
                <RequireAuth>
                  <Account />
                </RequireAuth>
              }
            />
            <Route
              path="/checkout/:slug"
              element={
                <RequireAuth>
                  <Checkout />
                </RequireAuth>
              }
            />
            <Route
              path="/learn/:courseId/:lessonId"
              element={
                <RequireAuth>
                  <Learn />
                </RequireAuth>
              }
            />
            <Route
              path="/admin"
              element={
                <RequireAuth>
                  <Admin />
                </RequireAuth>
              }
            />
            {['terms', 'privacy', 'refunds', 'contact'].map((kind) => (
              <Route path={`/${kind}`} key={kind} element={<Policy kind={kind} />} />
            ))}
            <Route
              path="*"
              element={
                <div className="wrap section empty-state">
                  <h1>A little off course.</h1>
                  <p>We couldn't find that page.</p>
                  <a className="button" href="/">
                    Back to FAME
                  </a>
                </div>
              }
            />
          </Routes>
        </Suspense>
      )}
    </AuthContext.Provider>
  );
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────
createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ErrorBoundary>
);
