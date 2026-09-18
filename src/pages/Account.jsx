import { useState } from 'react';
import { CheckCircle2, Mail, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StudentLayout } from '../components/StudentLayout';
import { Notice } from '../components/shared';
import { api } from '../api.js';

export function Account() {
  const { user, refresh, logout } = useAuth();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function act(fn) {
    setBusy(true);
    setMessage('');
    setError('');
    try {
      const r = await fn();
      setMessage(r.message || 'Your account has been updated.');
      await refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <StudentLayout>
      <span className="eyebrow">YOUR DETAILS</span>
      <h1>My account.</h1>
      <p>Keep your details up to date and your account secure.</p>
      <div className="account-panel">
        <Notice>{error}</Notice>
        <Notice type="success">{message}</Notice>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const name = new FormData(e.currentTarget).get('name');
            act(() => api('/account', { method: 'PATCH', body: { name } }));
          }}
        >
          <label>
            Full name
            <input name="name" defaultValue={user.name} required minLength={2} maxLength={80} />
          </label>
          <label>
            Email address
            <input value={user.email} disabled />
          </label>
          <div className="verification-status">
            {user.verified ? (
              <>
                <CheckCircle2 />
                Email verified
              </>
            ) : (
              <>
                <Mail />
                Email verification pending
              </>
            )}
          </div>
          <button className="button" disabled={busy}>
            Save changes <Check size={17} />
          </button>
        </form>
        {!user.verified && (
          <button
            disabled={busy}
            className="button outline"
            onClick={() => act(() => api('/auth/resend', { method: 'POST' }))}
          >
            Send verification email
          </button>
        )}
        <hr />
        <h3>Password &amp; security</h3>
        <p>
          We'll email you a one-time link to set a new password. Resetting your password signs out
          your existing sessions.
        </p>
        <button
          className="button outline"
          disabled={busy}
          onClick={() =>
            act(() => api('/auth/forgot', { method: 'POST', body: { email: user.email } }))
          }
        >
          Send password reset email
        </button>
        <button className="text-button" onClick={logout}>
          Sign out
        </button>
      </div>
    </StudentLayout>
  );
}
