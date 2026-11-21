import { useState, useEffect, useRef } from 'react';
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
  Trophy,
  Zap,
  Clock,
  Flame,
} from 'lucide-react';
import { useLoad } from '../hooks/useLoad';
import { Notice, Loader, Brand, formatVideoEmbedUrl } from '../components/shared';
import { ThemeToggle } from '../components/ThemeToggle';
import { groupBy } from '../utils/groupBy.js';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext';
import { CourseLeaderboard } from '../components/CourseLeaderboard';
import {
  recordWatchTime,
  awardLessonCompletionXP,
  getStoredUserXP,
  getTierInfo,
} from '../utils/xpSystem';

export function Learn() {
  const { courseId, lessonId } = useParams();
  const { user } = useAuth();
  const [revision, setRevision] = useState(0);
  const { data: dashboard, error: dashboardError } = useLoad('/dashboard', revision);
  const { data: lesson, error, loading } = useLoad(`/learn/${courseId}/${lessonId}`);
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [theaterMode, setTheaterMode] = useState(false);

  // Responsive mobile sidebar default: closed on mobile (< 900px), open on desktop
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 900 : false
  );
  const [sidebarOpen, setSidebarOpen] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 900 : true
  );

  const [activeTab, setActiveTab] = useState('guide'); // 'guide' | 'notebook' | 'leaderboard' | 'resources'
  const [notes, setNotes] = useState('');
  const [notesSaved, setNotesSaved] = useState(false);
  const [liveWatchSeconds, setLiveWatchSeconds] = useState(0);
  const [xpToast, setXpToast] = useState(null);
  const [userXPState, setUserXPState] = useState(() =>
    getStoredUserXP(user?.id || user?.email)
  );

  const navigate = useNavigate();
  const videoRef = useRef(null);
  const isVideoPlayingRef = useRef(true); // default active when focused

  const course = dashboard?.courses?.find((c) => c.id === courseId);
  const completed = course?.completed?.includes(lessonId);
  const groups = course ? groupBy(course.lessons, (l) => l.module_title) : {};
  const currentIdx = course?.lessons?.findIndex((l) => l.id === lessonId) ?? -1;
  const prev = currentIdx > 0 ? course?.lessons[currentIdx - 1] : null;
  const next =
    currentIdx >= 0 && currentIdx < (course?.lessons?.length ?? 0) - 1
      ? course?.lessons[currentIdx + 1]
      : null;

  const tier = getTierInfo(courseId);
  const currentCourseXP =
    (userXPState.courseXP && userXPState.courseXP[courseId]) || 0;

  // Window resize listener to handle responsive states
  useEffect(() => {
    function handleResize() {
      const mobile = window.innerWidth < 900;
      setIsMobile(mobile);
      if (mobile && theaterMode) {
        setTheaterMode(false);
      }
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [theaterMode]);

  // Load saved notes for this lesson from localStorage
  useEffect(() => {
    if (lessonId) {
      const saved = localStorage.getItem(`fame_notes_${courseId}_${lessonId}`) || '';
      setNotes(saved);
      setNotesSaved(false);
    }
  }, [courseId, lessonId]);

  // Listen for global XP events to update the UI counter
  useEffect(() => {
    function handleXPEvent(e) {
      const detail = e.detail;
      setUserXPState(getStoredUserXP(user?.id || user?.email));
      if (detail && detail.gainedXP) {
        setXpToast({
          amount: detail.gainedXP,
          reason:
            detail.reason === 'lesson_completed'
              ? 'Lesson Completed Bonus!'
              : '1 min watched (+2 XP)',
        });
        setTimeout(() => setXpToast(null), 3200);
      }
    }
    window.addEventListener('fame_xp_updated', handleXPEvent);
    return () => window.removeEventListener('fame_xp_updated', handleXPEvent);
  }, [user]);

  // Active watch time ticker: 2 XP for every 1 minute watched (1 XP every 30 seconds)
  useEffect(() => {
    if (!lessonId || !courseId) return;

    // Reset local seconds for current session view
    setLiveWatchSeconds(0);

    const interval = setInterval(() => {
      // Only count if document/tab is active & focused
      if (typeof document !== 'undefined' && !document.hidden && isVideoPlayingRef.current) {
        setLiveWatchSeconds((s) => s + 1);
        recordWatchTime(user?.id || user?.email, courseId, lessonId, 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [courseId, lessonId, user]);

  // Listen to postMessage from YouTube iframe
  useEffect(() => {
    function handleMessage(event) {
      try {
        if (typeof event.data === 'string') {
          const data = JSON.parse(event.data);
          // YouTube API onStateChange: 1 = playing, 2 = paused, 0 = ended
          if (data.event === 'onStateChange') {
            if (data.info === 1) {
              isVideoPlayingRef.current = true;
            } else if (data.info === 2 || data.info === 0) {
              isVideoPlayingRef.current = false;
            }
          }
        }
      } catch {}
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

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
      const willBeCompleted = !completed;
      await api(`/progress/${lessonId}`, {
        method: 'PUT',
        body: { completed: willBeCompleted },
      });
      setRevision((v) => v + 1);

      // Award bonus XP if marking as complete
      if (willBeCompleted) {
        awardLessonCompletionXP(user?.id || user?.email, courseId, lessonId);
      }
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
      if (isMobile) setSidebarOpen(false);
    } else {
      navigate('/dashboard');
    }
  }

  const { url: videoEmbedUrl, isEmbed } = formatVideoEmbedUrl(lesson?.video_url);

  return (
    <div className={`learn-page tier-${tier.tier} ${theaterMode ? 'theater-active' : ''}`}>
      {/* ─── Top Navigation Bar ────────────────────────────────────────── */}
      <header className="learn-header">
        <div className="learn-header-left">
          <Link className="learn-mobile-back" to="/dashboard" aria-label="Back to Dashboard">
            <ArrowLeft size={18} />
          </Link>
          <Brand />
          {course && (
            <div className="learn-course-badge">
              <span className={`course-tier-tag ${tier.tier}`}>{course.eyebrow}</span>
              <span className="course-title-text">{course.title}</span>
            </div>
          )}
        </div>

        <div className="learn-header-center">
          {/* Live XP Pill */}
          <button
            className={`learn-xp-pill ${activeTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('leaderboard')}
            title="View Course Leaderboard (2 XP / min watched)"
            aria-label="View Course Leaderboard"
          >
            <Zap size={14} className="xp-bolt pulse" />
            <span className="xp-val">{currentCourseXP} XP</span>
            <span className="xp-rate-tag">+2/min</span>
          </button>

          <div className="learn-progress-compact desktop-only">
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
            className={`learn-action-btn desktop-only ${theaterMode ? 'active' : ''}`}
            onClick={() => setTheaterMode(!theaterMode)}
            title={theaterMode ? 'Exit theater mode' : 'Theater mode'}
            aria-label="Toggle theater mode"
          >
            {theaterMode ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
            <span className="btn-label">{theaterMode ? 'Standard' : 'Theater'}</span>
          </button>

          <ThemeToggle />

          <Link className="back-link learn-back-btn desktop-only" to="/dashboard">
            <ArrowLeft size={16} />
            <span>Dashboard</span>
          </Link>
        </div>
      </header>

      {/* ─── Mobile Sidebar Overlay Backdrop ───────────────────────────── */}
      {isMobile && sidebarOpen && (
        <div
          className="learn-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

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

          {/* Quick Leaderboard Shortcut in Sidebar */}
          <button
            className="sidebar-leaderboard-cta"
            onClick={() => {
              setActiveTab('leaderboard');
              if (isMobile) setSidebarOpen(false);
            }}
          >
            <Trophy size={16} className="trophy-icon" />
            <div className="cta-copy">
              <span>Course Leaderboard</span>
              <small>{currentCourseXP} XP earned · View standings</small>
            </div>
            <ChevronRight size={14} />
          </button>

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
                      onClick={() => {
                        if (isMobile) setSidebarOpen(false);
                      }}
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
                          <span className="xp-tag-tiny">+{l.minutes * 2} XP</span>
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
                    <ChevronRight size={14} className="crumb-sep" />
                    <span className="crumb-lesson">
                      Lesson {currentIdx + 1} of {course?.lessons?.length || 1}
                    </span>
                    <ChevronRight size={14} className="crumb-sep desktop-only" />
                    <span className="crumb-time desktop-only">{lesson.minutes} min watch</span>
                  </div>

                  <h1 className="lesson-title">{lesson.title}</h1>

                  <div className="lesson-byline-bar">
                    <div className="byline-item">
                      <BookOpen size={15} />
                      <span>FAME · Manmath Biradar</span>
                    </div>
                    <div className="byline-xp-badge">
                      <Zap size={13} />
                      <span>Earn 2 XP / min watched</span>
                    </div>
                    {lesson.is_preview ? (
                      <span className="preview-badge-pill">Free Preview</span>
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
                  {/* Real-time floating XP toast */}
                  {xpToast && (
                    <div className="xp-floating-toast" role="status">
                      <Zap size={16} className="toast-bolt" />
                      <div className="toast-text">
                        <strong>+{xpToast.amount} XP!</strong>
                        <span>{xpToast.reason}</span>
                      </div>
                    </div>
                  )}

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
                          ref={videoRef}
                          className="lesson-iframe"
                          controls
                          controlsList="nodownload"
                          preload="metadata"
                          src={videoEmbedUrl}
                          onPlay={() => {
                            isVideoPlayingRef.current = true;
                          }}
                          onPause={() => {
                            isVideoPlayingRef.current = false;
                          }}
                          onEnded={() => {
                            isVideoPlayingRef.current = false;
                            if (!completed) toggleComplete();
                          }}
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
                        <span className="stream-badge-text">HD Masterclass</span>
                      </span>

                      {/* Live XP Tracker in Cinema Bar */}
                      <div className="cinema-xp-pill" title="You earn 2 XP for every 1 minute of video watched">
                        <Zap size={13} className="xp-icon pulse" />
                        <span>
                          <strong>+{Math.floor(liveWatchSeconds / 30)} XP</strong> watched
                        </span>
                      </div>
                    </div>

                    <div className="cinema-bar-right">
                      {prev && (
                        <button
                          className="cinema-nav-btn prev-btn"
                          onClick={() => navigate(`/learn/${courseId}/${prev.id}`)}
                          title={`Previous: ${prev.title}`}
                        >
                          <ArrowLeft size={15} />
                          <span>Prev</span>
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
                            <Check size={16} /> <span className="btn-text">Completed</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={16} /> <span className="btn-text">Mark Complete (+10 XP)</span>
                          </>
                        )}
                      </button>

                      {next ? (
                        <button
                          className="cinema-next-btn"
                          onClick={completeAndNext}
                          title={`Next: ${next.title}`}
                        >
                          <span className="btn-text">{completed ? 'Next' : 'Complete & Next'}</span>
                          <ArrowRight size={15} />
                        </button>
                      ) : (
                        <Link className="cinema-next-btn finish" to="/dashboard">
                          <span className="btn-text">Finish</span>
                          <ArrowRight size={15} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                <Notice>{saveError}</Notice>

                {/* ─── Interactive Tabs (Guide / Notebook / Leaderboard / Resources) ─── */}
                <div className="lesson-tabs-section">
                  <div className="lesson-tabs-nav" role="tablist">
                    <button
                      className={`tab-btn ${activeTab === 'guide' ? 'active' : ''}`}
                      onClick={() => setActiveTab('guide')}
                      role="tab"
                      aria-selected={activeTab === 'guide'}
                    >
                      <FileText size={16} />
                      <span>Session Guide</span>
                    </button>

                    <button
                      className={`tab-btn ${activeTab === 'notebook' ? 'active' : ''}`}
                      onClick={() => setActiveTab('notebook')}
                      role="tab"
                      aria-selected={activeTab === 'notebook'}
                    >
                      <PenSquare size={16} />
                      <span>Action Notebook</span>
                      {notes && <span className="notebook-dot" title="Has notes" />}
                    </button>

                    <button
                      className={`tab-btn tab-leaderboard-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
                      onClick={() => setActiveTab('leaderboard')}
                      role="tab"
                      aria-selected={activeTab === 'leaderboard'}
                    >
                      <Trophy size={16} />
                      <span>Leaderboard ({tier.tierName})</span>
                    </button>

                    <button
                      className={`tab-btn ${activeTab === 'resources' ? 'active' : ''}`}
                      onClick={() => setActiveTab('resources')}
                      role="tab"
                      aria-selected={activeTab === 'resources'}
                    >
                      <Sparkles size={16} />
                      <span>Formulas</span>
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

                    {/* Tab 3: Course Leaderboard */}
                    {activeTab === 'leaderboard' && (
                      <div className="tab-pane leaderboard-pane">
                        <CourseLeaderboard
                          initialCourseId={courseId}
                          compact={isMobile}
                        />
                      </div>
                    )}

                    {/* Tab 4: Resources & Formulas */}
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
                      onClick={() => {
                        navigate(`/learn/${courseId}/${prev.id}`);
                        if (isMobile) setSidebarOpen(false);
                      }}
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
