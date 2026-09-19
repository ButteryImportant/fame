import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { LockKeyhole, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Notice, Brand } from '../components/shared';
import { ThemeToggle } from '../components/ThemeToggle';
import { api } from '../api.js';

export function AuthPage({ mode = 'login' }) {
  const { user, refresh } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const requested = params.get('next');
  const next =
    requested && /^\/(checkout|courses)\/[a-z0-9-]+$/.test(requested) ? requested : '/dashboard';
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setError('');
    setMessage('');
  }, [mode]);

  if (user && ['login', 'register'].includes(mode)) return <Navigate to={next} replace />;

  const title = {
    login: 'Welcome back.',
    register: 'Your next chapter starts here.',
    forgot: "Let's get you back in.",
    reset: 'Set a new password.',
    verify: 'Confirm your email.',
  }[mode];

  async function submit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setBusy(true);
    const f = new FormData(e.currentTarget);
    try {
      let result;
      if (mode === 'verify') {
        result = await api('/auth/verify', {
          method: 'POST',
          body: { token: params.get('token') || '' },
        });
      } else if (mode === 'reset') {
        result = await api('/auth/reset', {
          method: 'POST',
          body: { password: f.get('password'), token: params.get('token') || '' },
        });
      } else {
        result = await api(`/auth/${mode}`, {
          method: 'POST',
          body:
            mode === 'register'
              ? { name: f.get('name')?.toString().trim(), email: f.get('email')?.toString().trim(), password: f.get('password') }
              : mode === 'forgot'
                ? { email: f.get('email')?.toString().trim() }
                : { email: f.get('email')?.toString().trim(), password: f.get('password') },
        });
      }
      if (['login', 'register'].includes(mode)) {
        const session = await refresh();
        const dest =
          requested && /^\/(checkout|courses|admin)\/[a-z0-9-]+$/.test(requested)
            ? requested
            : session?.user?.role === 'admin'
              ? '/admin'
              : next;
        navigate(dest, { replace: true });
      } else {
        setMessage(result.message);
        await refresh();
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <aside className="auth-story">
        <Brand />
        <div>
          <span className="eyebrow">START · SET UP · SCALE</span>
          <h2>
            Big ideas grow
            <br />
            with <em>clear direction.</em>
          </h2>
          <p>
            Product. Business model. Market.
            <br />
            Your food business journey starts with clarity.
          </p>
        </div>
        <div className="auth-mentor">
          <img src="/images/manmath-biradar.jpg" alt="Manmath Biradar" />
          <span>
            Manmath Biradar<small>Founder, FAME</small>
          </span>
        </div>
      </aside>
      <main className="auth-main" id="main">
        <div className="auth-top-bar">
          <Link className="back-link" to="/">
            <ArrowLeft size={16} />
            Back to FAME
          </Link>
          <ThemeToggle />
        </div>
        <div className="auth-form">
          <span className="eyebrow">YOUR FAME ACCOUNT</span>
          <h1>{title}</h1>
          <p>
            {mode === 'register'
              ? 'Create an account to enrol, learn and track your progress.'
              : mode === 'login'
                ? 'Continue building your food business journey.'
                : mode === 'forgot'
                  ? "Enter your account email and we'll send you a reset link."
                  : mode === 'verify'
                    ? 'Confirm below to verify your email address.'
                    : 'Use a unique password with at least 12 characters.'}
          </p>
          <Notice>{error}</Notice>
          <Notice type="success">{message}</Notice>
          {!message && (
            <form onSubmit={submit}>
              {mode === 'register' && (
                <label>
                  Full name
                  <input
                    name="name"
                    autoComplete="name"
                    required
                    minLength={2}
                    maxLength={80}
                    placeholder="Your name"
                  />
                </label>
              )}
              {['login', 'register', 'forgot'].includes(mode) && (
                <label>
                  Email address
                  <input
                    name="email"
                    type={mode === 'login' ? 'text' : 'email'}
                    autoComplete={mode === 'login' ? 'username' : 'email'}
                    required
                    maxLength={254}
                    placeholder="you@example.com"
                  />
                </label>
              )}
              {['login', 'register', 'reset'].includes(mode) && (
                <label>
                  Password
                  <input
                    name="password"
                    type="password"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    required
                    minLength={mode === 'login' ? 1 : 12}
                    maxLength={128}
                    placeholder={mode === 'login' ? 'Enter your password' : 'At least 12 characters'}
                  />
                </label>
              )}
              {mode === 'login' && (
                <Link className="forgot-link" to="/forgot-password">
                  Forgot password?
                </Link>
              )}
              {mode === 'register' && (
                <p className="form-note">
                  By creating an account, you agree to the{' '}
                  <Link to="/terms">Terms of use</Link> and acknowledge the{' '}
                  <Link to="/privacy">Privacy policy</Link>.
                </p>
              )}
              <button disabled={busy} className="button full">
                {busy
                  ? 'Please wait…'
                  : {
                      login: 'Sign in',
                      register: 'Create my account',
                      forgot: 'Send reset link',
                      reset: 'Update password',
                      verify: 'Verify my email',
                    }[mode]}
                <ArrowRight size={18} />
              </button>
            </form>
          )}
          {message && (
            <Link className="button full" to={user ? '/dashboard' : '/login'}>
              Continue <ArrowRight size={18} />
            </Link>
          )}
          {['login', 'register'].includes(mode) && (
            <p className="auth-switch">
              {mode === 'login' ? 'New to FAME?' : 'Already part of FAME?'}{' '}
              <Link
                to={`/${mode === 'login' ? 'register' : 'login'}?next=${encodeURIComponent(next)}`}
              >
                {mode === 'login' ? 'Create an account' : 'Sign in'}
              </Link>
            </p>
          )}
          <div className="safe-note">
            <LockKeyhole size={15} />
            Your learning, securely in one place.
          </div>
        </div>
      </main>
    </div>
  );
}
