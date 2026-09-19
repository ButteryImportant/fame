import React, { useState, useEffect, useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  Plus,
  Save,
  Trash2,
  Video,
  BookOpen,
  Users,
  CreditCard,
  ArrowLeft,
  CheckCircle2,
  Eye,
  ExternalLink,
  Play,
  Layers,
  Clock,
  AlertCircle,
  RefreshCw,
  Sliders,
  Settings,
  Shield,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { StudentLayout } from './components/StudentLayout';
import { Notice, Loader, formatVideoEmbedUrl } from './components/shared';
import { api, money } from './api.js';

const blankCourse = {
  title: '',
  slug: '',
  eyebrow: 'SILVER · START',
  description: '',
  summary: '',
  price: 0,
  level: 'L1',
  accent: 'green',
  status: 'draft',
  is_sample: false,
  outcomes: [],
};

const blankLesson = {
  module_title: 'Module 1: Foundations',
  title: '',
  body: '',
  video_url: '',
  minutes: 15,
  position: 0,
  is_preview: false,
};

const courseBody = (c) => Object.fromEntries(Object.keys(blankCourse).map((k) => [k, c[k]]));

export function Admin() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [view, setView] = useState('overview'); // 'overview' | 'course' | 'settings' | 'orders'
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [lesson, setLesson] = useState(null);
  const [activeCourseTab, setActiveCourseTab] = useState('lessons'); // 'lessons' | 'details'

  async function refresh() {
    setError('');
    const d = await api('/admin/overview');
    setData(d);
    return d;
  }

  useEffect(() => {
    if (user?.role === 'admin') {
      refresh().catch((e) => setError(e.message));
    }
  }, [user]);

  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;

  async function run(fn, successMsg = 'Saved successfully.') {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await fn();
      setMessage(successMsg);
      await refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function editCourse(c) {
    setSelected({ ...c, is_sample: !!c.is_sample });
    setView('course');
    setLesson(null);
    setActiveCourseTab('lessons');
    setError('');
    try {
      const courseLessons = await api(`/admin/courses/${c.id}/lessons`);
      setLessons(courseLessons);
    } catch (e) {
      setError(e.message);
    }
  }

  const updateCourse = (key, value) => setSelected((c) => ({ ...c, [key]: value }));

  async function deleteLesson(lessonId) {
    if (!window.confirm('Are you sure you want to delete this lesson? This cannot be undone.')) return;
    run(async () => {
      await api(`/admin/lessons/${lessonId}`, { method: 'DELETE' });
      const updated = await api(`/admin/courses/${selected.id}/lessons`);
      setLessons(updated);
      if (lesson?.id === lessonId) setLesson(null);
    }, 'Lesson deleted successfully.');
  }

  async function deleteCourse(courseId) {
    if (!window.confirm('Are you sure you want to delete this programme and all its lessons?')) return;
    run(async () => {
      await api(`/admin/courses/${courseId}`, { method: 'DELETE' });
      setView('overview');
      setSelected(null);
      setLesson(null);
    }, 'Programme deleted successfully.');
  }

  // Extract unique module names for quick auto-complete
  const existingModules = useMemo(() => {
    return Array.from(new Set(lessons.map((l) => l.module_title).filter(Boolean)));
  }, [lessons]);

  return (
    <StudentLayout>
      <div className="admin-header-area">
        <div className="dashboard-heading">
          <div>
            <div className="admin-badge-pill">
              <Shield size={13} />
              OWNER &amp; CHIEF MENTOR · MANMATH
            </div>
            <h1>Platform Administration</h1>
            <p>Full control over programmes, video embeds, pricing, lessons, and business policies.</p>
          </div>
          <div className="admin-quick-actions">
            <button
              className="button"
              onClick={() => {
                setSelected({ ...blankCourse, slug: `programme-${Date.now().toString().slice(-4)}` });
                setLessons([]);
                setView('course');
                setLesson(null);
                setActiveCourseTab('details');
              }}
            >
              <Plus size={18} />
              New programme
            </button>
          </div>
        </div>

        <div className="owner-tabs">
          <button
            className={view === 'overview' ? 'active' : ''}
            onClick={() => {
              setView('overview');
              setMessage('');
              setError('');
            }}
          >
            <BookOpen size={16} />
            Programmes &amp; Overview
          </button>
          <button
            className={view === 'settings' ? 'active' : ''}
            onClick={() => {
              setView('settings');
              setMessage('');
              setError('');
            }}
          >
            <Settings size={16} />
            Business &amp; Policies
          </button>
        </div>
      </div>

      <Notice>{error}</Notice>
      <Notice type="success">{message}</Notice>

      {!data ? (
        <Loader />
      ) : view === 'overview' ? (
        <>
          {/* STATS */}
          <div className="stats-grid">
            <div>
              <Users />
              <strong>{data.stats.students}</strong>
              <span>Registered students</span>
            </div>
            <div>
              <CreditCard />
              <strong>{money(data.stats.revenue)}</strong>
              <span>Captured revenue</span>
            </div>
            <div>
              <BookOpen />
              <strong>{data.stats.paidOrders}</strong>
              <span>Paid course enrolments</span>
            </div>
          </div>

          {/* COURSE LIST */}
          <div className="dashboard-subheading">
            <h2>Course Catalog ({data.courses.length})</h2>
            <span className="muted">Click manage to edit lessons, embed YouTube videos, or change prices</span>
          </div>

          <div className="admin-cards-grid">
            {data.courses.map((c) => (
              <article key={c.id} className="admin-course-card">
                <div className="admin-card-head">
                  <span className={`admin-tier-badge tier-${c.level.toLowerCase()}`}>{c.eyebrow}</span>
                  <span className={`admin-status-pill status-${c.status}`}>{c.status}</span>
                </div>
                <h3 className="admin-card-title">{c.title}</h3>
                <p className="admin-card-desc">{c.description || 'No description added yet.'}</p>
                <div className="admin-card-metrics">
                  <div className="metric">
                    <Clock size={14} />
                    <span>{c.lessonCount} lessons</span>
                  </div>
                  <div className="metric">
                    <CreditCard size={14} />
                    <strong>{money(c.price)}</strong>
                  </div>
                </div>
                <div className="admin-card-actions">
                  <button className="button small full" onClick={() => editCourse(c)}>
                    <Play size={14} />
                    Manage Lessons &amp; Content
                  </button>
                  <Link
                    to={`/courses/${c.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="button small outline full admin-preview-btn"
                  >
                    <ExternalLink size={14} />
                    Preview as Student
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* RECENT ORDERS */}
          <div className="dashboard-subheading" style={{ marginTop: '50px' }}>
            <h2>Recent Enrolments &amp; Orders</h2>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Learner</th>
                  <th>Programme</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.orders.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <strong>{o.name}</strong>
                      <small>{o.email}</small>
                    </td>
                    <td>{o.title}</td>
                    <td>
                      <strong>{money(o.amount)}</strong>
                    </td>
                    <td>
                      <span className={`status ${o.status}`}>{o.status}</span>
                    </td>
                    <td>
                      <small>{new Date(o.created_at).toLocaleDateString()}</small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!data.orders.length && <p className="muted" style={{ padding: '24px' }}>No orders recorded yet.</p>}
          </div>
        </>
      ) : view === 'settings' ? (
        <SettingsForm
          data={data.settings}
          busy={busy}
          onSave={(body) => run(() => api('/admin/settings', { method: 'PUT', body }), 'Business settings updated.')}
        />
      ) : selected ? (
        <div className="owner-editor-workspace">
          <div className="workspace-top-bar">
            <button
              className="back-link"
              onClick={() => {
                setView('overview');
                setLesson(null);
              }}
            >
              <ArrowLeft size={16} />
              Back to all programmes
            </button>
            <div className="workspace-title-wrap">
              <span className="eyebrow">{selected.eyebrow}</span>
              <h2>{selected.title || 'Untitled Programme'}</h2>
            </div>
            <div className="workspace-tabs">
              <button
                className={`workspace-tab ${activeCourseTab === 'lessons' ? 'active' : ''}`}
                onClick={() => setActiveCourseTab('lessons')}
              >
                <Video size={16} />
                Lessons &amp; YouTube Embeds ({lessons.length})
              </button>
              <button
                className={`workspace-tab ${activeCourseTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveCourseTab('details')}
              >
                <Sliders size={16} />
                Programme Pricing &amp; Details
              </button>
            </div>
          </div>

          {activeCourseTab === 'details' ? (
            /* PROGRAMME DETAILS FORM */
            <div className="owner-editor">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  run(async () => {
                    if (selected.id) {
                      await api(`/admin/courses/${selected.id}`, {
                        method: 'PUT',
                        body: courseBody(selected),
                      });
                    } else {
                      const created = await api('/admin/courses', {
                        method: 'POST',
                        body: courseBody(selected),
                      });
                      setSelected((c) => ({ ...c, id: created.id }));
                    }
                  }, 'Programme details saved.');
                }}
              >
                <div className="form-head-row">
                  <h3>Programme Configuration</h3>
                  {selected.id && (
                    <button
                      type="button"
                      className="button outline small"
                      style={{ color: '#a83232', borderColor: '#f2caca' }}
                      onClick={() => deleteCourse(selected.id)}
                    >
                      <Trash2 size={14} />
                      Delete Programme
                    </button>
                  )}
                </div>

                <div className="form-grid">
                  <label>
                    Programme title
                    <input
                      required
                      minLength={3}
                      maxLength={100}
                      value={selected.title}
                      onChange={(e) => updateCourse('title', e.target.value)}
                      placeholder="e.g. Food Business Blueprint"
                    />
                  </label>
                  <label>
                    URL slug (web address)
                    <input
                      required
                      pattern="[a-z0-9]+(-[a-z0-9]+)*"
                      value={selected.slug}
                      onChange={(e) => updateCourse('slug', e.target.value)}
                      placeholder="food-business-blueprint"
                    />
                  </label>
                  <label>
                    Badge label
                    <input
                      value={selected.eyebrow}
                      onChange={(e) => updateCourse('eyebrow', e.target.value)}
                      placeholder="SILVER · START"
                    />
                  </label>
                  <label>
                    Price in Rupees (₹)
                    <input
                      required
                      type="number"
                      min="0"
                      max="1000000"
                      step="1"
                      value={selected.price / 100}
                      onChange={(e) => updateCourse('price', Math.round(Number(e.target.value) * 100))}
                      placeholder="7499"
                    />
                  </label>
                  <label>
                    Tier Level
                    <select value={selected.level} onChange={(e) => updateCourse('level', e.target.value)}>
                      <option value="L1">L1 · Foundation / Start</option>
                      <option value="L2">L2 · Accelerator / Set Up</option>
                      <option value="L3">L3 · Mastery / Scale</option>
                    </select>
                  </label>
                  <label>
                    Visual Style Accent
                    <select value={selected.accent} onChange={(e) => updateCourse('accent', e.target.value)}>
                      <option value="green">Silver Tier (L1)</option>
                      <option value="blue">Gold Tier (L2)</option>
                      <option value="dark">Diamond Tier (L3)</option>
                    </select>
                  </label>
                </div>

                <label>
                  Short description
                  <textarea
                    rows={2}
                    value={selected.description}
                    onChange={(e) => updateCourse('description', e.target.value)}
                    maxLength={300}
                    placeholder="Concise one or two sentences explaining the programme."
                  />
                </label>

                <label>
                  Detailed programme overview
                  <textarea
                    rows={4}
                    value={selected.summary}
                    onChange={(e) => updateCourse('summary', e.target.value)}
                    maxLength={2000}
                    placeholder="In-depth explanation of the curriculum, who it is for, and what founders achieve."
                  />
                </label>

                <label>
                  Key learning outcomes (one per line)
                  <textarea
                    rows={4}
                    value={selected.outcomes.join('\n')}
                    onChange={(e) => updateCourse('outcomes', e.target.value.split('\n'))}
                    placeholder="Product-market validation roadmap&#10;Unit economics margin calculation&#10;FSSAI and regulatory compliance"
                  />
                </label>

                <label>
                  Publishing status
                  <select value={selected.status} onChange={(e) => updateCourse('status', e.target.value)}>
                    <option value="draft">Draft (Hidden from public catalog)</option>
                    <option value="upcoming">Upcoming (Visible, pre-launch)</option>
                    <option value="published">Published (Live &amp; accepting enrolments)</option>
                  </select>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selected.is_sample}
                    onChange={(e) => updateCourse('is_sample', e.target.checked)}
                  />
                  <span>Mark as sample programme (keeps checkout simulated in development)</span>
                </label>

                <button className="button" disabled={busy}>
                  <Save size={17} />
                  Save programme settings
                </button>
              </form>
            </div>
          ) : (
            /* LESSONS MANAGEMENT & VIDEO EMBEDDING */
            <div className="admin-lessons-workspace">
              <div className="lessons-workspace-grid">
                {/* LESSONS LIST ON LEFT */}
                <aside className="admin-lessons-sidebar">
                  <div className="sidebar-action-header">
                    <h3>Curriculum ({lessons.length})</h3>
                    <button
                      className="button small"
                      onClick={() =>
                        setLesson({
                          ...blankLesson,
                          module_title: existingModules[0] || 'Module 1: Foundations',
                          position: lessons.length,
                        })
                      }
                    >
                      <Plus size={15} />
                      Add Lesson
                    </button>
                  </div>

                  <div className="admin-lessons-list">
                    {lessons.map((l, idx) => (
                      <div
                        key={l.id}
                        className={`admin-lesson-item ${lesson?.id === l.id ? 'active' : ''}`}
                        onClick={() => setLesson({ ...l, is_preview: !!l.is_preview })}
                      >
                        <div className="lesson-order-num">{idx + 1}</div>
                        <div className="lesson-summary-info">
                          <span className="admin-lesson-module">{l.module_title}</span>
                          <strong className="admin-lesson-title">{l.title || 'Untitled lesson'}</strong>
                          <div className="admin-lesson-meta-chips">
                            <span className="chip-time">
                              <Clock size={11} /> {l.minutes} min
                            </span>
                            {l.video_url && (
                              <span className="chip-video">
                                <Video size={11} /> Video
                              </span>
                            )}
                            {l.is_preview && <span className="chip-preview">Free Preview</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                    {!lessons.length && (
                      <div className="empty-lessons-prompt">
                        <p>No lessons added yet.</p>
                        <button
                          className="button small outline"
                          onClick={() => setLesson({ ...blankLesson, position: 0 })}
                        >
                          <Plus size={15} /> Create your first lesson
                        </button>
                      </div>
                    )}
                  </div>
                </aside>

                {/* LESSON EDITOR FORM ON RIGHT */}
                <main className="admin-lesson-editor-pane">
                  {lesson ? (
                    <LessonInteractiveEditor
                      lesson={lesson}
                      setLesson={setLesson}
                      busy={busy}
                      existingModules={existingModules}
                      onDelete={() => deleteLesson(lesson.id)}
                      onSave={() => {
                        run(async () => {
                          const { id, course_id, ...body } = lesson;
                          if (id) {
                            await api(`/admin/lessons/${id}`, { method: 'PUT', body });
                          } else {
                            await api(`/admin/courses/${selected.id}/lessons`, { method: 'POST', body });
                          }
                          const updated = await api(`/admin/courses/${selected.id}/lessons`);
                          setLessons(updated);
                        }, 'Lesson saved successfully.');
                      }}
                      onCancel={() => setLesson(null)}
                    />
                  ) : (
                    <div className="select-lesson-placeholder">
                      <Video size={48} />
                      <h3>Select or Add a Lesson</h3>
                      <p>
                        Choose an existing lesson from the list to edit its YouTube video embed, text notes, and
                        duration, or create a new lesson.
                      </p>
                      <button
                        className="button"
                        onClick={() =>
                          setLesson({
                            ...blankLesson,
                            module_title: existingModules[0] || 'Module 1: Foundations',
                            position: lessons.length,
                          })
                        }
                      >
                        <Plus size={16} />
                        Add New Lesson
                      </button>
                    </div>
                  )}
                </main>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </StudentLayout>
  );
}

// ─── INTERACTIVE LESSON EDITOR COMPONENT ──────────────────────────────────────
function LessonInteractiveEditor({
  lesson,
  setLesson,
  busy,
  existingModules,
  onSave,
  onDelete,
  onCancel,
}) {
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('');
  const [isYoutube, setIsYoutube] = useState(false);

  // Live video preview generation
  useEffect(() => {
    if (lesson.video_url) {
      const { url, isEmbed } = formatVideoEmbedUrl(lesson.video_url);
      setVideoPreviewUrl(url);
      setIsYoutube(isEmbed);
    } else {
      setVideoPreviewUrl('');
      setIsYoutube(false);
    }
  }, [lesson.video_url]);

  return (
    <form
      className="lesson-interactive-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
    >
      <div className="form-head-row">
        <div>
          <span className="eyebrow">LESSON EDITOR</span>
          <h2>{lesson.id ? 'Edit Lesson' : 'Create New Lesson'}</h2>
        </div>
        <div className="head-buttons">
          {lesson.id && (
            <button
              type="button"
              className="button small outline"
              style={{ color: '#a83232', borderColor: '#f2caca' }}
              onClick={onDelete}
            >
              <Trash2 size={15} />
              Delete Lesson
            </button>
          )}
        </div>
      </div>

      <div className="form-grid">
        <label>
          Module / Section name
          <input
            required
            list="module-options"
            value={lesson.module_title}
            onChange={(e) => setLesson((l) => ({ ...l, module_title: e.target.value }))}
            placeholder="e.g. Module 1: Foundations"
          />
          <datalist id="module-options">
            {existingModules.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </label>

        <label>
          Lesson title
          <input
            required
            minLength={2}
            value={lesson.title}
            onChange={(e) => setLesson((l) => ({ ...l, title: e.target.value }))}
            placeholder="e.g. 01 · The Agro-Food Matrix"
          />
        </label>

        <label>
          Estimated duration (minutes)
          <input
            required
            type="number"
            min="1"
            max="600"
            value={lesson.minutes}
            onChange={(e) => setLesson((l) => ({ ...l, minutes: Number(e.target.value) }))}
          />
        </label>

        <label>
          Display order position (starts at 0)
          <input
            required
            type="number"
            min="0"
            value={lesson.position}
            onChange={(e) => setLesson((l) => ({ ...l, position: Number(e.target.value) }))}
          />
        </label>
      </div>

      {/* YOUTUBE EMBED VIDEO SECTION */}
      <div className="admin-video-embed-card">
        <div className="embed-card-header">
          <div className="embed-header-left">
            <Video className="embed-icon" size={20} />
            <div>
              <strong>Video Masterclass Link</strong>
              <small>Paste any YouTube link, unlisted URL, Vimeo link, or media:filename</small>
            </div>
          </div>
          {isYoutube && (
            <span className="embed-valid-pill">
              <CheckCircle2 size={13} />
              YouTube Video Linked
            </span>
          )}
        </div>

        <input
          className="embed-url-input"
          value={lesson.video_url || ''}
          onChange={(e) => setLesson((l) => ({ ...l, video_url: e.target.value }))}
          placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
        />

        <p className="embed-hint-text">
          Supports all standard links: <code>https://www.youtube.com/watch?v=...</code>,{' '}
          <code>https://youtu.be/...</code>, unlisted videos, or Vimeo links.
        </p>

        {/* LIVE EMBED PREVIEW */}
        {videoPreviewUrl && isYoutube && (
          <div className="live-preview-box">
            <span className="preview-indicator">
              <Play size={13} /> Live Preview (This is what your students will see in the cinema player)
            </span>
            <div className="admin-cinema-aspect">
              <iframe
                src={videoPreviewUrl}
                title="Lesson video preview"
                className="admin-preview-iframe"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}
      </div>

      <label>
        Lesson text guide &amp; action worksheet (Markdown &amp; plain text)
        <textarea
          rows={10}
          value={lesson.body || ''}
          onChange={(e) => setLesson((l) => ({ ...l, body: e.target.value }))}
          placeholder="Add lesson summary, unit economic formulas, key action steps, and assignments for the learner..."
        />
      </label>

      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={lesson.is_preview}
          onChange={(e) => setLesson((l) => ({ ...l, is_preview: e.target.checked }))}
        />
        <span>Allow this lesson as a Free Public Preview (unlocked for visitors before purchasing)</span>
      </label>

      <div className="button-row" style={{ marginTop: '25px' }}>
        <button className="button" disabled={busy}>
          <Save size={17} />
          {busy ? 'Saving...' : 'Save lesson'}
        </button>
        <button type="button" className="button outline" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── SETTINGS FORM COMPONENT ──────────────────────────────────────────────────
function SettingsForm({ data, busy, onSave }) {
  const [s, set] = useState({ ...data, legal_ready: data.legal_ready === 'true' });
  const change = (k, v) => set((s) => ({ ...s, [k]: v }));

  return (
    <form
      className="owner-editor"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(s);
      }}
    >
      <h2>Business details &amp; policies</h2>
      <p>These details appear on your support and legal policy pages.</p>
      <div className="form-grid">
        <label>
          Business name
          <input required value={s.business_name || ''} onChange={(e) => change('business_name', e.target.value)} />
        </label>
        <label>
          Support email
          <input
            type="email"
            required
            value={s.support_email || ''}
            onChange={(e) => change('support_email', e.target.value)}
          />
        </label>
      </div>
      <label>
        Business address
        <textarea
          required
          minLength={5}
          rows={3}
          value={s.business_address || ''}
          onChange={(e) => change('business_address', e.target.value)}
        />
      </label>
      {[
        ['terms', 'Terms of use'],
        ['privacy', 'Privacy policy'],
        ['refunds', 'Refund policy'],
      ].map(([k, label]) => (
        <label key={k}>
          {label}
          <textarea
            rows={8}
            value={s[k] || ''}
            onChange={(e) => change(k, e.target.value)}
            placeholder={`Add your approved ${label.toLowerCase()} here.`}
          />
        </label>
      ))}
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={s.legal_ready}
          onChange={(e) => change('legal_ready', e.target.checked)}
        />
        <span>I have reviewed these business details and policies and am ready to open enrolment.</span>
      </label>
      <button disabled={busy} className="button">
        <CheckCircle2 size={17} />
        Save business settings
      </button>
    </form>
  );
}
