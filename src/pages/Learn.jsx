import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Check,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Play,
  Maximize2,
  Minimize2,
  PenSquare,
  FileText,
  Sparkles,
  Layers,
  Download,
  Menu,
  X,
} from 'lucide-react';
import { useLoad } from '../hooks/useLoad';
import { Notice, Loader, Brand, formatVideoEmbedUrl } from '../components/shared';
import { groupBy } from '../utils/groupBy.js';
import { api } from '../api.js';

export function Learn() {
  const { courseId, lessonId } = useParams();
  const [revision, setRevision] = useState(0);
  const { data: dashboard, error: dashboardError } = useLoad('/dashboard', revision);
  const { data: lesson, error, loading } = useLoad(`/learn/${courseId}/${lessonId}`);
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [theaterMode, setTheaterMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('guide'); // 'guide' | 'notebook' | 'resources'
  const [notes, setNotes] = useState('');
  const [notesSaved, setNotesSaved] = useState(false);
  const navigate = useNavigate();

  const course = dashboard?.courses?.find((c) => c.id === courseId);
  const completed = course?.completed?.includes(lessonId);
  const groups = course ? groupBy(course.lessons, (l) => l.module_title) : {};
  const currentIdx = course?.lessons?.findIndex((l) => l.id === lessonId) ?? -1;
  const prev = currentIdx > 0 ? course?.lessons[currentIdx - 1] : null;
  const next = currentIdx >= 0 && currentIdx < (course?.lessons?.length ?? 0) - 1 ? course?.lessons[currentIdx + 1] : null;

  // Load saved notes for this lesson from localStorage
  useEffect(() => {
    if (lessonId) {
      const saved = localStorage.getItem(`fame_notes_${courseId}_${lessonId}`) || '';
      setNotes(saved);
      setNotesSaved(false);
    }
  }, [courseId, lessonId]);

  function handleNotesChange(e) {
    const val = e.target.value;
    setNotes(val);
    localStorage.setItem(`fame_notes_${courseId}_${lessonId}`, val);
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  }

  async function toggleComplete() {
    setBusy(true);
    setSaveError('');
    try {
      await api(`/progress/${lessonId}`, { method: 'PUT', body: { completed: !completed } });
      setRevision((v) => v + 1);
    } catch (e) {
      setSaveError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function completeAndNext() {
    if (!completed) {
      await toggleComplete();
    }
    if (next) {
      navigate(`/learn/${courseId}/${next.id}`);
    } else {
      navigate('/dashboard');
    }
  }

  const { url: videoEmbedUrl, isEmbed } = formatVideoEmbedUrl(lesson?.video_url);

  return (
    <div className={`learn-page ${theaterMode ? 'theater-active' : ''}`}>
      {/* ─── Top Navigation Bar ────────────────────────────────────────── */}
      <header className="learn-header">
        <div className="learn-header-left">
          <Brand />
          {course && (
            <div className="learn-course-badge">
              <span className="course-tier-tag">{course.eyebrow}</span>
              <span className="course-title-text">{course.title}</span>
            </div>
          )}
        </div>

        <div className="learn-header-center">
          <div className="learn-progress-compact">
            <span>Progress: {course?.percent || 0}%</span>
            <div className="compact-meter">
              <div
                className="compact-fill"
                style={{ width: `${course?.percent || 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className="learn-header-right">
          <button
            className={`learn-action-btn ${sidebarOpen ? 'active' : ''}`}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? 'Hide curriculum' : 'Show curriculum'}
            aria-label="Toggle curriculum sidebar"
          >
            <Layers size={17} />
            <span className="btn-label">Curriculum</span>
          </button>

          <button
            className={`learn-action-btn ${theaterMode ? 'active' : ''}`}
            onClick={() => setTheaterMode(!theaterMode)}
            title={theaterMode ? 'Exit theater mode' : 'Theater mode'}
            aria-label="Toggle theater mode"
          >
            {theaterMode ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
            <span className="btn-label">{theaterMode ? 'Standard' : 'Theater'}</span>
          </button>

          <Link className="back-link learn-back-btn" to="/dashboard">
            <ArrowLeft size={16} />
            <span>Dashboard</span>
          </Link>
        </div>
      </header>

      {/* ─── Main Workspace Layout ──────────────────────────────────────── */}
      <div className={`learn-layout ${sidebarOpen ? 'sidebar-visible' : 'sidebar-hidden'}`}>
        {/* ─── Collapsible Curriculum Sidebar ─────────────────────────── */}
        <aside className={`lesson-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="lesson-sidebar-head">
            <div>
              <span className="eyebrow">YOUR LEARNING PATH</span>
              <h2>{course?.title || 'Course Curriculum'}</h2>
            </div>
            <button
              className="icon-button mobile-sidebar-close"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close curriculum sidebar"
            >
              <X size={18} />
            </button>
          </div>

          <div className="progress-label">
            <span>Overall completion</span>
            <strong>{course?.percent || 0}%</strong>
          </div>
          <progress value={course?.percent || 0} max="100" aria-label="Course completion" />

          <div className="lesson-sidebar-scroll">
            {Object.entries(groups).map(([module, lessons], i) => (
              <div className="lesson-module" key={module}>
                <h3>
                  {String(i + 1).padStart(2, '0')} · {module}
                </h3>
                {lessons.map((l) => {
                  const isCurrent = lessonId === l.id;
                  const isDone = course?.completed?.includes(l.id);
                  return (
                    <Link
                      key={l.id}
                      className={`lesson-nav ${isCurrent ? 'active' : ''} ${isDone ? 'done' : ''}`}
                      to={`/learn/${courseId}/${l.id}`}
                    >
                      {isDone ? (
                        <CheckCircle2 size={18} className="lesson-status-icon checked" />
                      ) : isCurrent ? (
                        <div className="lesson-playing-dot" title="Now playing" />
                      ) : (
                        <span className="lesson-circle" />
                      )}
                      <div className="lesson-nav-copy">
                        <span className="lesson-nav-title">{l.title}</span>
                        <div className="lesson-nav-meta">
                          <span className="video-badge-tiny">
                            <Play size={10} fill="currentColor" /> Video
                          </span>
                          <span>{l.minutes} min</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </aside>

        {/* ─── Cinema Center Stage ─────────────────────────────────────── */}
        <main className="lesson-main" id="main">
          {loading ? (
            <Loader />
          ) : error || dashboardError ? (
            <Notice>{error || dashboardError}</Notice>
          ) : (
            lesson && (
              <div className="lesson-stage">
                {/* ─── Breadcrumb & Title ──────────────────────────────── */}
                <div className="lesson-stage-header">
                  <div className="lesson-breadcrumb">
                    <span className="crumb-module">{lesson.module_title}</span>
                    <ChevronRight size={14} />
                    <span className="crumb-lesson">Lesson {currentIdx + 1} of {course?.lessons?.length || 1}</span>
                    <ChevronRight size={14} />
                    <span className="crumb-time">{lesson.minutes} min watch</span>
                  </div>

                  <h1 className="lesson-title">{lesson.title}</h1>

                  <div className="lesson-byline-bar">
                    <div className="byline-item">
                      <BookOpen size={15} />
                      <span>FAME · Manmath Biradar</span>
                    </div>
                    {lesson.is_preview ? (
                      <span className="preview-badge-pill">Free Preview Available</span>
                    ) : null}
                  </div>
                </div>

                {course?.is_sample && (
                  <Notice type="info">
                    Sample curriculum mode · Your mentor Manmath Biradar's full series of masterclass sessions is in place.
                  </Notice>
                )}

                {/* ─── Cinema Video Player Theater ────────────────────── */}
                <div className="cinema-container">
                  <div className="cinema-frame">
                    {videoEmbedUrl ? (
                      isEmbed ? (
                        <iframe
                          className="lesson-iframe"
                          title={lesson.title}
                          src={videoEmbedUrl}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          referrerPolicy="strict-origin-when-cross-origin"
                        />
                      ) : (
                        <video
                          className="lesson-iframe"
                          controls
                          controlsList="nodownload"
                          preload="metadata"
                          src={videoEmbedUrl}
                        >
                          Your browser does not support this video player.
                        </video>
                      )
                    ) : (
                      <div className="cinema-placeholder">
                        <div className="cinema-placeholder-icon">
                          <Play size={44} fill="currentColor" />
                        </div>
                        <h3>Video session streaming soon</h3>
                        <p>Manmath Biradar is finalizing the video masterclass for this lesson.</p>
                      </div>
                    )}
                  </div>

                  {/* Cinema Bottom Control Bar */}
                  <div className="cinema-bar">
                    <div className="cinema-bar-left">
                      <span className="stream-badge">
                        <span className="stream-pulse" />
                        YouTube High Definition Video
                      </span>
                    </div>

                    <div className="cinema-bar-right">
                      {prev && (
                        <button
                          className="cinema-nav-btn"
                          onClick={() => navigate(`/learn/${courseId}/${prev.id}`)}
                          title={`Previous: ${prev.title}`}
                        >
                          <ArrowLeft size={15} />
                          <span>Previous</span>
                        </button>
                      )}

                      <button
                        disabled={busy}
                        className={`cinema-complete-btn ${completed ? 'completed' : ''}`}
                        onClick={toggleComplete}
                        title={completed ? 'Click to mark uncompleted' : 'Mark this lesson completed'}
                      >
                        {completed ? (
                          <>
                            <Check size={16} /> Completed
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={16} /> Mark as Complete
                          </>
                        )}
                      </button>

                      {next ? (
                        <button
                          className="cinema-next-btn"
                          onClick={completeAndNext}
                          title={`Next: ${next.title}`}
                        >
                          <span>{completed ? 'Next Lesson' : 'Complete & Next'}</span>
                          <ArrowRight size={15} />
                        </button>
                      ) : (
                        <Link className="cinema-next-btn" to="/dashboard">
                          <span>Complete Course</span>
                          <ArrowRight size={15} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                <Notice>{saveError}</Notice>

                {/* ─── Interactive Tabs (Guide / Notebook / Templates) ─── */}
                <div className="lesson-tabs-section">
                  <div className="lesson-tabs-nav" role="tablist">
                    <button
                      className={`tab-btn ${activeTab === 'guide' ? 'active' : ''}`}
                      onClick={() => setActiveTab('guide')}
                      role="tab"
                      aria-selected={activeTab === 'guide'}
                    >
                      <FileText size={16} />
                      <span>Session Guide &amp; Key Principles</span>
                    </button>

                    <button
                      className={`tab-btn ${activeTab === 'notebook' ? 'active' : ''}`}
                      onClick={() => setActiveTab('notebook')}
                      role="tab"
                      aria-selected={activeTab === 'notebook'}
                    >
                      <PenSquare size={16} />
                      <span>My Action Notebook</span>
                      {notes && <span className="notebook-dot" title="Has notes" />}
                    </button>

                    <button
                      className={`tab-btn ${activeTab === 'resources' ? 'active' : ''}`}
                      onClick={() => setActiveTab('resources')}
                      role="tab"
                      aria-selected={activeTab === 'resources'}
                    >
                      <Sparkles size={16} />
                      <span>Templates &amp; Formulas</span>
                    </button>
                  </div>

                  <div className="tab-content">
                    {/* Tab 1: Session Guide */}
                    {activeTab === 'guide' && (
                      <div className="tab-pane guide-pane">
                        <div className="lesson-copy">
                          {lesson.body
                            .split('\n\n')
                            .filter(Boolean)
                            .map((p, i) => (
                              <p key={i}>{p}</p>
                            ))}
                        </div>

                        <div className="lesson-action-box">
                          <div className="action-box-left">
                            <span className="eyebrow">PRACTICAL ENTREPRENEURSHIP ACTION</span>
                            <h3>Make this decision for your food business.</h3>
                            <p>
                              Before moving to the next session, capture your target buyer, operational model, or financial assumption in your Action Notebook.
                            </p>
                          </div>
                          <button
                            className="button small"
                            onClick={() => setActiveTab('notebook')}
                          >
                            <PenSquare size={15} /> Open Notebook
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Tab 2: Action Notebook */}
                    {activeTab === 'notebook' && (
                      <div className="tab-pane notebook-pane">
                        <div className="notebook-header">
                          <div>
                            <h3>Your Food Business Notebook</h3>
                            <p>
                              Record the decisions and customer assumptions you will validate. Notes are saved automatically on this device.
                            </p>
                          </div>
                          {notesSaved && (
                            <span className="save-indicator">
                              <Check size={14} /> Saved automatically
                            </span>
                          )}
                        </div>

                        <textarea
                          className="notebook-textarea"
                          rows={10}
                          placeholder={`Write your decisions for ${lesson.title}...\n\nExample:\n- One decision I make today: ...\n- One customer assumption to verify: ...\n- Next concrete step: ...`}
                          value={notes}
                          onChange={handleNotesChange}
                        />

                        <div className="notebook-footer">
                          <span className="notebook-tip">
                            Tip: Manmath advises reviewing your notebook every 7 days against actual customer conversations.
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Tab 3: Resources & Formulas */}
                    {activeTab === 'resources' && (
                      <div className="tab-pane resources-pane">
                        <h3>Core Tools &amp; Frameworks for this Module</h3>
                        <p>Download or reference these frameworks when calculating your business feasibility:</p>

                        <div className="resources-grid">
                          <div className="resource-card">
                            <div className="resource-icon">
                              <FileText size={20} />
                            </div>
                            <div className="resource-info">
                              <h4>Food Business Decision Matrix</h4>
                              <p>Shortlist product options against customer demand, raw materials and shelf life.</p>
                            </div>
                          </div>

                          <div className="resource-card">
                            <div className="resource-icon">
                              <Sparkles size={20} />
                            </div>
                            <div className="resource-info">
                              <h4>Unit Economics Calculator</h4>
                              <p>Selling price less variable costs, packaging, processing and channel margins.</p>
                            </div>
                          </div>

                          <div className="resource-card">
                            <div className="resource-icon">
                              <BookOpen size={20} />
                            </div>
                            <div className="resource-info">
                              <h4>Pilot Batch Validation Checklist</h4>
                              <p>Food safety compliance, pack test, feedback questions and repeat purchase test.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ─── Bottom Course Navigation Bar ───────────────────── */}
                <div className="lesson-footer-nav">
                  {prev ? (
                    <button
                      className="footer-nav-btn prev"
                      onClick={() => navigate(`/learn/${courseId}/${prev.id}`)}
                    >
                      <ArrowLeft size={16} />
                      <div>
                        <small>Previous lesson</small>
                        <span>{prev.title}</span>
                      </div>
                    </button>
                  ) : (
                    <div />
                  )}

                  {next ? (
                    <button
                      className="footer-nav-btn next"
                      onClick={completeAndNext}
                    >
                      <div>
                        <small>Up next</small>
                        <span>{next.title}</span>
                      </div>
                      <ArrowRight size={16} />
                    </button>
                  ) : (
                    <Link className="footer-nav-btn next finish" to="/dashboard">
                      <div>
                        <small>You reached the end</small>
                        <span>Return to Dashboard</span>
                      </div>
                      <ArrowRight size={16} />
                    </Link>
                  )}
                </div>
              </div>
            )
          )}
        </main>
      </div>
    </div>
  );
}
