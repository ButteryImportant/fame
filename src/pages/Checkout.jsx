import { useState } from 'react';
import { Link, useParams, useNavigate, Navigate } from 'react-router-dom';
import {
  LockKeyhole,
  ShieldCheck,
  BookOpen,
  Globe2,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLoad } from '../hooks/useLoad';
import { PublicLayout } from '../components/PublicLayout';
import { Arrow, Notice, Loader } from '../components/shared';
import { api, money, loadRazorpay } from '../api.js';

export function Checkout() {
  const { slug } = useParams();
  const { user, mode } = useAuth();
  const { data: c, error, loading } = useLoad(`/courses/${slug}`);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [order, setOrder] = useState(null);
  const [accepted, setAccepted] = useState(false);
  const navigate = useNavigate();

  async function checkStatus(id) {
    const o = await api(`/orders/${id}`);
    if (['captured', 'demo'].includes(o.status)) {
      navigate('/dashboard?enrolled=1');
      return true;
    }
    setMessage(
      o.status === 'refunded'
        ? 'This payment has been refunded.'
        : 'Payment confirmation is still pending. If you have been charged, do not pay again. Check status here or return to My Learning shortly.'
    );
    return false;
  }

  async function pay() {
    setBusy(true);
    setMessage('');
    try {
      const o = await api('/payments/order', { method: 'POST', body: { courseId: c.id } });
      if (o.alreadyEnrolled) {
        navigate('/dashboard');
        return;
      }
      setOrder(o);
      if (o.mode === 'demo') {
        await api('/payments/demo-complete', { method: 'POST', body: { orderId: o.orderId } });
        navigate('/dashboard?enrolled=1');
        return;
      }
      await loadRazorpay();
      const checkout = new window.Razorpay({
        key: o.keyId,
        amount: o.amount,
        currency: o.currency,
        order_id: o.razorpayOrderId,
        name: 'FAME',
        description: c.title,
        prefill: { name: user.name, email: user.email },
        theme: { color: '#0b5b45' },
        modal: {
          ondismiss: () => {
            setBusy(false);
            setMessage(
              'Checkout closed. If you completed a payment, check its status before trying again.'
            );
          },
        },
        handler: async (response) => {
          try {
            const verified = await api('/payments/verify', {
              method: 'POST',
              body: { orderId: o.orderId, ...response },
            });
            if (verified.ok) navigate('/dashboard?enrolled=1');
            else await checkStatus(o.orderId);
          } catch (e) {
            setMessage(e.message + ' You can check payment status below.');
          } finally {
            setBusy(false);
          }
        },
      });
      checkout.on('payment.failed', () => {
        setBusy(false);
        setMessage('Payment did not complete. Check its status before trying again.');
      });
      checkout.open();
    } catch (e) {
      setMessage(e.message);
      setBusy(false);
    }
  }

  if (loading)
    return (
      <PublicLayout>
        <Loader />
      </PublicLayout>
    );
  if (error)
    return (
      <PublicLayout>
        <div className="wrap section">
          <Notice>{error}</Notice>
        </div>
      </PublicLayout>
    );
  if (c.hasAccess) return <Navigate to="/dashboard" replace />;

  return (
    <PublicLayout>
      <main id="main" className="wrap section checkout-grid">
        <div>
          <Link className="back-link" to={`/courses/${slug}`}>
            <ArrowLeft size={16} />
            Back to programme
          </Link>
          <span className="eyebrow">ONE CLEAR STEP FORWARD</span>
          <h1>
            Your journey
            <br />
            <em>starts here.</em>
          </h1>
          <div className="checkout-account">
            <CheckCircle2 />
            <div>
              <strong>Account ready</strong>
              <p>
                {user.name} · {user.email}
              </p>
            </div>
          </div>
          <div className="checkout-benefits">
            <h3>What happens next?</h3>
            {[
              [
                '01',
                'Complete your payment',
                'Pay through Razorpay with the available UPI, card or banking options.',
              ],
              [
                '02',
                'Open your learning space',
                'Your course unlocks after payment confirmation.',
              ],
              [
                '03',
                'Make progress, at your pace',
                'Work through the lessons. Your progress stays with your account.',
              ],
            ].map(([n, t, p]) => (
              <div key={n}>
                <span>{n}</span>
                <section>
                  <h4>{t}</h4>
                  <p>{p}</p>
                </section>
              </div>
            ))}
          </div>
        </div>

        <aside className="checkout-summary">
          <span className="eyebrow">YOUR PROGRAMME</span>
          <h2>{c.title}</h2>
          <div className="course-meta">
            <BookOpen size={16} />
            {c.lessonCount} lessons
            <Globe2 size={16} />
            Hindi + English
          </div>
          <div className="checkout-total">
            <span>Total payable</span>
            <strong>{money(c.price)}</strong>
          </div>
          <p className="muted">One-time payment. The displayed amount is the final checkout total.</p>
          {!user.verified && mode !== 'demo' && (
            <Notice type="info">
              Please <Link to="/account">verify your email</Link> before paying.
            </Notice>
          )}
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
            />
            <span>
              I agree to the <Link to="/terms">Terms</Link> and{' '}
              <Link to="/refunds">Refund policy</Link>.
            </span>
          </label>
          <Notice>{message}</Notice>
          <button
            className="button full"
            disabled={
              busy ||
              !accepted ||
              (mode !== 'demo' && !user.verified) ||
              c.status === 'upcoming'
            }
            onClick={pay}
          >
            {busy ? 'Processing enrolment…' : `Pay ${money(c.price)}`}
            <LockKeyhole size={18} />
          </button>
          {order && (
            <button
              className="button outline full"
              disabled={busy}
              onClick={async () => {
                try {
                  await checkStatus(order.orderId);
                } catch (e) {
                  setMessage(e.message);
                }
              }}
            >
              <RefreshCw size={17} />
              Check payment status
            </button>
          )}
          <div className="safe-note">
            <ShieldCheck size={17} />
            Payments processed securely by Razorpay
          </div>
        </aside>
      </main>
    </PublicLayout>
  );
}
