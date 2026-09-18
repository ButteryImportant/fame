import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle2, GraduationCap, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLoad } from '../hooks/useLoad';
import { StudentLayout } from '../components/StudentLayout';
import { Arrow, Notice, Loader, CourseArt } from '../components/shared';
import { money } from '../api.js';

export function Dashboard() {
  const { user } = useAuth();
  const { data, error, loading } = useLoad('/dashboard');

  return (
    <StudentLayout>
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">YOUR NEXT STEP STARTS HERE</span>
          <h1>
            Welcome, {user.name.split(' ')[0]}
            <span className="green-period">.</span>
          </h1>
          <p>A little progress today. A clearer path tomorrow.</p>
        </div>
        <Link className="button outline" to="/courses">
          Explore programmes <Arrow />
        </Link>
      </div>

      {!user.verified && (
        <div className="verification-note">
          <Mail size={18} />
          <span>
            Your account is ready. <Link to="/account">Verify your email</Link> before live
            checkout.
          </span>
        </div>
      )}

      {loading ? (
        <Loader />
      ) : error ? (
        <Notice>{error}</Notice>
      ) : (
        <>
          <div className="stats-grid">
            <div>
              <BookOpen />
              <strong>{data.courses.length}</strong>
              <span>Enrolled programmes</span>
            </div>
            <div>
              <CheckCircle2 />
              <strong>{data.courses.reduce((n, c) => n + c.completed.length, 0)}</strong>
              <span>Lessons completed</span>
            </div>
            <div>
              <GraduationCap />
              <strong>{data.courses.filter((c) => c.percent === 100).length}</strong>
              <span>Programmes completed</span>
            </div>
          </div>

          <div className="dashboard-subheading">
            <h2>My learning</h2>
            <span>Your progress is saved automatically</span>
          </div>

          {data.courses.length ? (
            <div className="learning-grid">
              {data.courses.map((c) => {
                const next =
                  c.lessons.find((l) => !c.completed.includes(l.id)) || c.lessons[0];
                return (
                  <article className="learning-card" key={c.id}>
                    <CourseArt course={c} compact />
                    <div className="learning-card-content">
                      <span className="eyebrow">{c.eyebrow}</span>
                      <h3>{c.title}</h3>
                      <div className="progress-label">
                        <span>
                          {c.completed.length} of {c.lessonCount} lessons complete
                        </span>
                        <strong>{c.percent}%</strong>
                      </div>
                      <progress
                        value={c.percent}
                        max="100"
                        aria-label={`${c.title} progress`}
                      />
                      {next && (
                        <Link
                          className="button full"
                          to={`/learn/${c.id}/${next.id}`}
                        >
                          {c.percent === 100
                            ? 'Review programme'
                            : c.percent > 0
                              ? 'Continue learning'
                              : 'Start learning'}
                          <ArrowRight size={18} />
                        </Link>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <BookOpen size={36} />
              <h2>Your learning journey is waiting.</h2>
              <p>Choose a programme and it will appear here after enrolment.</p>
              <Link className="button" to="/courses">
                Find my programme <Arrow />
              </Link>
            </div>
          )}

          <div className="dashboard-subheading">
            <h2>My orders</h2>
            <span>Payments and enrolments</span>
          </div>

          {data.orders.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Programme</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.orders.map((o) => (
                    <tr key={o.id}>
                      <td>
                        {o.title}
                        <small>{o.id.slice(0, 8)}</small>
                      </td>
                      <td>{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                      <td>{money(o.amount)}</td>
                      <td>
                        <span className={`status ${o.status}`}>
                          {o.status === 'demo'
                            ? 'Demo · no charge'
                            : o.status === 'captured'
                              ? 'Paid'
                              : o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="muted">Your order history will appear here.</p>
          )}
        </>
      )}
    </StudentLayout>
  );
}
