import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, Check, BookOpen, ArrowRight, ArrowLeft, ChevronRight } from 'lucide-react';
import { useLoad } from '../hooks/useLoad';
import { Notice, Loader, Brand, LessonContent } from '../components/shared';
import { groupBy } from '../utils/groupBy.js';
import { api } from '../api.js';

export function Learn() {
  const { courseId, lessonId } = useParams();
  const [revision, setRevision] = useState(0);
  const { data: dashboard, error: dashboardError } = useLoad('/dashboard', revision);
  const { data: lesson, error, loading } = useLoad(`/learn/${courseId}/${lessonId}`);
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState('');
  const navigate = useNavigate();

  const course = dashboard?.courses.find((c) => c.id === courseId);
  const completed = course?.completed.includes(lessonId);
  const groups = course ? groupBy(course.lessons, (l) => l.module_title) : {};
  const next = course?.lessons[course.lessons.findIndex((l) => l.id === lessonId) + 1];

  async function complete() {
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

  return (
    <div className="learn-page">
      <header className="learn-header">
        <Brand />
        <Link className="back-link" to="/dashboard">
          <ArrowLeft size={16} />
          My learning
        </Link>
      </header>
      <div className="learn-layout">
        <aside className="lesson-sidebar">
          <span className="eyebrow">YOUR LEARNING PATH</span>
          <h2>{course?.title || 'Your programme'}</h2>
          <div className="progress-label">
            <span>Course progress</span>
            <strong>{course?.percent || 0}%</strong>
          </div>
          <progress value={course?.percent || 0} max="100" aria-label="Course completion" />
          {Object.entries(groups).map(([module, lessons], i) => (
            <div className="lesson-module" key={module}>
              <h3>
                {String(i + 1).padStart(2, '0')} / {module}
              </h3>
              {lessons.map((l) => (
                <Link
                  key={l.id}
                  className={lessonId === l.id ? 'lesson-nav active' : 'lesson-nav'}
                  to={`/learn/${courseId}/${l.id}`}
                >
                  {course.completed.includes(l.id) ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <span className="lesson-circle" />
                  )}
                  <span>
                    {l.title}
                    <small>{l.minutes} min</small>
                  </span>
                </Link>
              ))}
            </div>
          ))}
        </aside>

        <main className="lesson-main" id="main">
          {loading ? (
            <Loader />
          ) : error || dashboardError ? (
            <Notice>{error || dashboardError}</Notice>
          ) : (
            lesson && (
              <>
                <div className="lesson-breadcrumb">
                  {lesson.module_title}
                  <ChevronRight size={15} />
                  {lesson.minutes} min
                </div>
                {course?.is_sample && (
                  <Notice type="info">
                    Sample learning material · Your mentor's final course content will replace this
                    before launch.
                  </Notice>
                )}
                <h1>{lesson.title}</h1>
                <div className="lesson-byline">
                  <BookOpen size={16} />
                  FAME · Manmath Biradar
                </div>
                <LessonContent lesson={lesson} />
                <div className="lesson-action">
                  <div>
                    <span className="eyebrow">MAKE IT YOUR OWN</span>
                    <h3>Take the idea into your business.</h3>
                    <p>Write down one action from this lesson before moving on.</p>
                  </div>
                  <CheckCircle2 size={35} />
                </div>
                <Notice>{saveError}</Notice>
                <div className="lesson-controls">
                  <button
                    disabled={busy || !course}
                    className={`button ${completed ? 'outline' : ''}`}
                    onClick={complete}
                  >
                    {completed ? (
                      <>
                        <Check size={18} />
                        Completed · Undo
                      </>
                    ) : (
                      <>
                        Mark as complete <Check size={18} />
                      </>
                    )}
                  </button>
                  {next ? (
                    <button
                      className="text-link"
                      onClick={() => navigate(`/learn/${courseId}/${next.id}`)}
                    >
                      Next lesson <ArrowRight size={18} />
                    </button>
                  ) : (
                    <Link className="text-link" to="/dashboard">
                      Back to my learning <ArrowRight size={18} />
                    </Link>
                  )}
                </div>
              </>
            )
          )}
        </main>
      </div>
    </div>
  );
}
