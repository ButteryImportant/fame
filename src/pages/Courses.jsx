import { BookOpen, ShieldCheck } from 'lucide-react';
import { PublicLayout } from '../components/PublicLayout';
import { Notice, Loader, CourseCard, FAQ } from '../components/shared';
import { useLoad } from '../hooks/useLoad';

export function Courses() {
  const { data, error, loading } = useLoad('/courses');
  return (
    <PublicLayout>
      <main id="main" className="wrap section">
        <div className="catalog-heading">
          <span className="eyebrow">FAME LEARNING</span>
          <h1>
            Your next step.
            <br />
            <em>Your learning path.</em>
          </h1>
          <p>
            Choose the programme that meets you where you are—from finding your first product to
            building your next stage of growth.
          </p>
        </div>
        {loading ? (
          <Loader />
        ) : error ? (
          <Notice>{error}</Notice>
        ) : data.length ? (
          <div className="course-grid">
            {data.map((c) => (
              <CourseCard course={c} key={c.id} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <BookOpen />
            <h2>Our next programmes are being prepared.</h2>
            <p>Please check back soon.</p>
          </div>
        )}
        <div className="catalog-note">
          <ShieldCheck />
          <p>
            Your courses, in one place. Learn at your own pace and keep track of every completed
            lesson.
          </p>
        </div>
      </main>
      <FAQ />
    </PublicLayout>
  );
}
