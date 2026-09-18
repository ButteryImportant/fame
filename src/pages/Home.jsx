import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Globe2,
  Users,
  Play,
  Leaf,
  Compass,
  Layers,
  TrendingUp,
  ArrowRight,
  GraduationCap,
  Target,
} from 'lucide-react';
import { PublicLayout } from '../components/PublicLayout';
import { Arrow, Notice, Loader, CourseCard, FAQ } from '../components/shared';
import { useLoad } from '../hooks/useLoad';

export function Home() {
  const { data: courses, error: courseError, loading: courseLoading } = useLoad('/courses');
  return (
    <PublicLayout>
      <main id="main">
        <section className="hero wrap">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="line" />
              FOOD &amp; AGRO ENTREPRENEURSHIP
            </span>
            <h1>
              Your food business.
              <br />
              Built with <em>clarity.</em>
            </h1>
            <p className="hero-description">
              From your first idea to your next stage of growth. Build a practical path with Manmath
              Biradar and the FAME community.
            </p>
            <div className="hero-buttons">
              <Link className="button" to="/courses">
                Find your starting point <Arrow />
              </Link>
              <Link className="text-link" to="/about">
                <span className="play-small">
                  <Play size={13} fill="currentColor" />
                </span>
                Meet your mentor
              </Link>
            </div>
            <div className="hero-reasons">
              <span>
                <CheckCircle2 />
                Practical guidance
              </span>
              <span>
                <Globe2 />
                Hindi + English
              </span>
              <span>
                <Users />
                Community-led
              </span>
            </div>
          </div>
          <div className="hero-portrait">
            <img
              src="/images/manmath-biradar.jpg"
              alt="Manmath Biradar, founder of FAME"
              fetchPriority="high"
            />
            <div className="portrait-label">
              <span className="tiny-pill">YOUR MENTOR. YOUR NEXT CHAPTER.</span>
              <h2>Manmath Biradar</h2>
              <p>Founder, FAME · Food &amp; Agro Business Mentor</p>
            </div>
            <div className="portrait-tag">
              <Leaf size={20} />
              <span>
                Rooted in experience.
                <br />
                <strong>Focused on your future.</strong>
              </span>
            </div>
          </div>
        </section>

        <section id="method" className="section wrap">
          <div className="section-heading">
            <div>
              <span className="eyebrow">THE FAME APPROACH</span>
              <h2>
                Big ambition.
                <br />
                <em>Three clear decisions.</em>
              </h2>
            </div>
            <p>
              Business-building gets simpler when you know what to focus on. FAME connects your
              product, your model and your market.
            </p>
          </div>
          <div className="pillar-grid">
            {[
              [
                Compass,
                '01',
                'The right product',
                'Find the overlap between customer demand, your strengths and a product you can deliver.',
              ],
              [
                Layers,
                '02',
                'The right business model',
                'Choose how you will create value—manufacturing, outsourcing or sourcing—with a realistic plan.',
              ],
              [
                TrendingUp,
                '03',
                'The right sales channels',
                'Reach the right buyers with a focused sales and distribution system.',
              ],
            ].map(([Icon, n, t, b]) => (
              <article className="pillar" key={n}>
                <div className="pillar-top">
                  <Icon size={26} />
                  <span>{n}</span>
                </div>
                <h3>{t}</h3>
                <p>{b}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="programmes-section">
          <div className="wrap section">
            <div className="section-heading">
              <div>
                <span className="eyebrow">YOUR LEARNING PATH</span>
                <h2>
                  One community.
                  <br />
                  <em>Three stages of growth.</em>
                </h2>
              </div>
              <Link className="text-link" to="/courses">
                Explore all programmes <ArrowRight size={18} />
              </Link>
            </div>
            <Notice>{courseError}</Notice>
            {courseLoading ? (
              <Loader />
            ) : (
              <div className="course-grid">
                {courses?.map((c) => (
                  <CourseCard course={c} key={c.id} />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="section wrap mentor-section">
          <div className="mentor-intro">
            <span className="eyebrow">A MENTOR WHO UNDERSTANDS THE JOURNEY</span>
            <h2>
              From industry experience
              <br />
              to <em>entrepreneurial purpose.</em>
            </h2>
          </div>
          <div>
            <p className="large-copy">
              An idea needs a product, a business model, and a way to reach customers.
            </p>
            <p>
              After a career across agriculture and industry, I stepped into entrepreneurship in
              2023. I built FAME to help food and agro entrepreneurs move forward with structure,
              practical guidance and a community around them.
            </p>
            <Link className="text-link" to="/about">
              Get to know Manmath <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        <section className="cta-section wrap">
          <div>
            <span className="eyebrow">YOUR NEXT CHAPTER</span>
            <h2>
              You bring the ambition.
              <br />
              <em>Let's build the plan.</em>
            </h2>
            <p>Start where you are. Take one clear step forward.</p>
          </div>
          <Link className="button light" to="/courses">
            Explore FAME programmes <Arrow />
          </Link>
        </section>

        <FAQ />
      </main>
    </PublicLayout>
  );
}
