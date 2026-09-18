import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Play,
  BookOpen,
  Globe2,
  Clock,
  Compass,
  Check,
  CheckCircle2,
  X,
  ShieldCheck,
} from 'lucide-react';
import { PublicLayout } from '../components/PublicLayout';
import { Arrow, Notice, Loader, CourseArt, LessonContent } from '../components/shared';
import { useLoad } from '../hooks/useLoad';
import { useAuth } from '../context/AuthContext';
import { api, money } from '../api.js';
import { groupBy } from '../utils/groupBy.js';

export function CourseDetail() {
  const { slug } = useParams();
  const { data: c, error, loading } = useLoad(`/courses/${slug}`);
  const [preview, setPreview] = useState(null);
  const [previewError, setPreviewError] = useState('');
  const { user } = useAuth();

  // Keyboard trap + focus restore for the preview modal
  useEffect(() => {
    if (!preview) return;
    const previous = document.activeElement;
    const modal = document.querySelector('.preview-modal');
    const listener = (e) => {
      if (e.key === 'Escape') setPreview(null);
      if (e.key === 'Tab') {
        const items = modal?.querySelectorAll('button, a[href], input, [tabindex="0"]');
        if (!items?.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', listener);
    return () => {
      document.removeEventListener('keydown', listener);
      previous?.focus();
    };
  }, [preview]);

  if (loading)
    return (
      <PublicLayout>
        <Loader />
      </PublicLayout>
    );
  if (error)
    return (
      <PublicLayout>
        <main className="wrap section">
          <Notice>{error}</Notice>
          <Link to="/courses">Back to courses</Link>
        </main>
      </PublicLayout>
    );

  const groups = groupBy(c.lessons, (l) => l.module_title);

  return (
    <PublicLayout>
      <main id="main">
        <section className="course-detail-top">
          <div className="wrap detail-grid">
            <div>
              <Link className="back-link" to="/courses">
                <ArrowLeft size={16} />
                All programmes
              </Link>
              <span className="eyebrow">{c.eyebrow}</span>
              <h1>{c.title}</h1>
              <p className="large-copy">{c.description}</p>
              <p>{c.summary}</p>
              <div className="hero-reasons">
                <span>
                  <Globe2 />
                  Hindi + English
                </span>
                <span>
                  <BookOpen />
                  {c.lessonCount} lessons
                </span>
                <span>
                  <Clock />
                  At your pace
                </span>
              </div>
              <div className="mentor-mini">
                <img src="/images/manmath-biradar.jpg" alt="" />
                <span>
                  Learn with<strong>Manmath Biradar</strong>
                </span>
              </div>
            </div>
            <aside className="enrol-card">
              <CourseArt course={c} compact />
              <div className="enrol-content">
                <span className="price">
                  {c.status === 'upcoming' ? 'Coming next' : money(c.price)}
                </span>
                <p>
                  {c.status === 'upcoming'
                    ? 'Enrolment dates will be announced here.'
                    : 'One-time payment · Course access in your account'}
                </p>
                {c.hasAccess ? (
                  <Link className="button full" to="/dashboard">
                    Continue learning <Arrow />
                  </Link>
                ) : c.status === 'upcoming' ? (
                  <span className="button disabled full">Enrolment not open</span>
                ) : (
                  <Link
                    className="button full"
                    to={
                      user
                        ? `/checkout/${c.slug}`
                        : `/register?next=${encodeURIComponent(`/checkout/${c.slug}`)}`
                    }
                  >
                    Start your journey <Arrow />
                  </Link>
                )}
                <ul className="clean-list">
                  <li>
                    <Check />
                    Structured learning path
                  </li>
                  <li>
                    <Check />
                    Saved lesson progress
                  </li>
                  <li>
                    <Check />
                    Access on mobile &amp; desktop
                  </li>
                </ul>
                <small>
                  <ShieldCheck size={15} /> Secure checkout with Razorpay
                </small>
              </div>
            </aside>
          </div>
        </section>

        <section className="wrap section detail-body">
          <div>
            <span className="eyebrow">WHAT YOU'LL WORK TOWARDS</span>
            <h2>
              Clarity you can
              <br />
              <em>put into action.</em>
            </h2>
            <div className="outcomes">
              {c.outcomes.map((o) => (
                <div key={o}>
                  <CheckCircle2 />
                  {o}
                </div>
              ))}
            </div>
            <div className="curriculum-title">
              <h2>Your learning path</h2>
              <span>{c.lessonCount} lessons</span>
            </div>
            {Object.entries(groups).map(([module, lessons], i) => (
              <details className="curriculum-group" key={module} open={i === 0}>
                <summary>
                  <span>
                    <small>MODULE {String(i + 1).padStart(2, '0')}</small>
                    {module}
                  </span>
                  <ChevronDown size={18} />
                </summary>
                <div>
                  {lessons.map((l) => (
                    <div className="curriculum-lesson" key={l.id}>
                      <Play size={15} />
                      <span>{l.title}</span>
                      <small>{l.minutes} min</small>
                      {!!l.is_preview && (
                        <button
                          className="text-button"
                          onClick={async () => {
                            setPreviewError('');
                            try {
                              setPreview(await api(`/preview/${l.id}`));
                            } catch (e) {
                              setPreviewError(e.message);
                            }
                          }}
                        >
                          Preview
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </details>
            ))}
            {!c.lessons.length && (
              <p>The detailed curriculum will be published when this programme opens.</p>
            )}
            <Notice>{previewError}</Notice>
          </div>
          <aside className="detail-aside">
            <Compass size={30} />
            <h3>A practical place to start.</h3>
            <p>
              Move through the lessons, take notes and turn each idea into a decision for your own
              business.
            </p>
            <Link to="/contact" className="text-link">
              Have a question? <ArrowRight size={16} />
            </Link>
          </aside>
        </section>

        {preview && (
          <div className="modal-backdrop" onClick={() => setPreview(null)}>
            <section
              className="preview-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="preview-title"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                autoFocus
                className="icon-button close-modal"
                aria-label="Close lesson preview"
                onClick={() => setPreview(null)}
              >
                <X />
              </button>
              <span className="eyebrow">FREE LESSON PREVIEW</span>
              <h2 id="preview-title">{preview.title}</h2>
              <LessonContent lesson={preview} />
              <button className="button" onClick={() => setPreview(null)}>
                Back to programme
              </button>
            </section>
          </div>
        )}
      </main>
    </PublicLayout>
  );
}
