import { Link } from 'react-router-dom';
import { GraduationCap, Target, Users, ArrowRight } from 'lucide-react';
import { PublicLayout } from '../components/PublicLayout';
import { Arrow } from '../components/shared';

export function About() {
  return (
    <PublicLayout>
      <main id="main">
        <section className="wrap section about-hero">
          <div>
            <span className="eyebrow">MEET YOUR MENTOR</span>
            <h1>
              Manmath Biradar.
              <br />
              <em>Building with purpose.</em>
            </h1>
            <p className="large-copy">
              Industry experience. An entrepreneurial journey. A commitment to helping food and agro
              businesses move forward.
            </p>
            <p>
              I founded FAME—Future Ready Agro Food Entrepreneurship Community—to bring product
              selection, commercialization and sales into one practical learning journey.
            </p>
            <Link to="/courses" className="button">
              Learn with me <Arrow />
            </Link>
          </div>
          <img src="/images/manmath-biradar.jpg" alt="Manmath Biradar" />
        </section>

        <section className="experience-strip">
          <div className="wrap">
            <span>
              PROFESSIONAL
              <br />
              <strong>BACKGROUND</strong>
            </span>
            <div>Netafim</div>
            <div>Finolex Plastro</div>
            <div>Kirloskar Brothers</div>
            <div>MAIDC</div>
          </div>
        </section>

        <section className="wrap section story-grid">
          <div>
            <span className="eyebrow">WHY I BUILT FAME</span>
            <h2>
              A clear path for
              <br />
              <em>builders like you.</em>
            </h2>
          </div>
          <div>
            <p>
              My work has taken me across agriculture, industry and business development. Along the
              way, I saw how often a promising food business idea gets stuck between product
              decisions, investment choices and finding customers.
            </p>
            <p>
              In June 2023, I left my permanent role to build an independent business. FAME grew
              from that decision: a place where aspiring and established entrepreneurs can connect
              their ideas to practical action.
            </p>
            <p>
              My focus is commercialization—helping entrepreneurs understand what to make, how to
              build the business around it, and how to reach the right market.
            </p>
          </div>
        </section>

        <section className="wrap section portfolio">
          <span className="eyebrow">HOW I WORK WITH ENTREPRENEURS</span>
          <h2>
            Learning that connects
            <br />
            <em>to the real business.</em>
          </h2>
          <div className="pillar-grid">
            {[
              [
                GraduationCap,
                'Education & community',
                'Structured online learning, workshops, hackathons and Q&A conversations around food and agro entrepreneurship.',
              ],
              [
                Target,
                'Commercialization guidance',
                'Product selection, business-model decisions, launch planning and sales-channel thinking.',
              ],
              [
                Users,
                'Industry & institutional sessions',
                'Practical discussions with entrepreneurs, MSMEs, FPOs and institutions around market-driven business development.',
              ],
            ].map(([I, t, p]) => (
              <article className="pillar" key={t}>
                <I size={28} />
                <h3>{t}</h3>
                <p>{p}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="wrap cta-section">
          <div>
            <span className="eyebrow">START · SET UP · SCALE</span>
            <h2>
              Build your next step
              <br />
              <em>with FAME.</em>
            </h2>
          </div>
          <Link className="button light" to="/courses">
            Find your programme <Arrow />
          </Link>
        </section>
      </main>
    </PublicLayout>
  );
}
