import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Globe2,
  TrendingUp,
  ShieldCheck,
  Package,
  Layers,
  Sparkles,
  BookOpen,
  ArrowRight,
  Target,
  FileText,
  Building2,
  Award,
  Zap,
} from 'lucide-react';
import { PublicLayout } from '../components/PublicLayout';
import { Arrow } from '../components/shared';

export function About() {
  return (
    <PublicLayout>
      <main id="main" className="mentor-profile-page">
        {/* HERO SECTION */}
        <section className="mentor-hero-wrapper">
          <div className="wrap mentor-hero-grid">
            <div className="mentor-hero-content">
              <span className="mentor-badge">
                <Sparkles size={14} />
                FOUNDER &amp; CHIEF MENTOR · FAME
              </span>
              <h1 className="mentor-title">
                Manmath Biradar.
                <br />
                <span className="mentor-subtitle">Building with Ground Reality.</span>
              </h1>
              <p className="mentor-lead-copy">
                15+ years of practical immersion across agriculture, food processing, and agribusiness
                commercialization. FAME was created with one uncompromising mission: to help food
                entrepreneurs stop guessing and build sustainable, profitable enterprises.
              </p>

              <div className="mentor-quick-tags">
                <span className="quick-tag">
                  <CheckCircle2 size={15} />
                  Zero Fluff Guidance
                </span>
                <span className="quick-tag">
                  <Globe2 size={15} />
                  Hindi + English Delivery
                </span>
                <span className="quick-tag">
                  <ShieldCheck size={15} />
                  Unit Economics Focus
                </span>
              </div>

              <div className="mentor-cta-row">
                <Link to="/courses" className="button">
                  Explore programmes with Manmath <Arrow />
                </Link>
                <a href="#story" className="text-link">
                  Read the journey
                </a>
              </div>
            </div>

            <div className="mentor-hero-visual">
              <div className="mentor-portrait-frame">
                <img
                  src="/images/manmath-biradar.jpg"
                  alt="Manmath Biradar, Founder and Mentor at FAME"
                  className="mentor-portrait-img"
                  fetchPriority="high"
                />
                <div className="mentor-portrait-overlay">
                  <span className="portrait-pill">MANMATH BIRADAR</span>
                  <h3>Founder &amp; Mentor, FAME</h3>
                  <p>Guiding food builders from first concept to market scale.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS & CREDIBILITY BAR (NO COMPANY NAMES) */}
        <section className="mentor-metrics-bar wrap">
          <div className="metrics-grid">
            <div className="metric-item">
              <strong>15+</strong>
              <span>Years of On-the-Ground Industry Immersion</span>
            </div>
            <div className="metric-item">
              <strong>3-Tier</strong>
              <span>Framework: Start (L1) · Set Up (L2) · Scale (L3)</span>
            </div>
            <div className="metric-item">
              <strong>100%</strong>
              <span>Action-Driven Worksheets &amp; Unit Economics Models</span>
            </div>
            <div className="metric-item">
              <strong>Practical</strong>
              <span>Bilingual Guidance: Real Hindi + English Delivery</span>
            </div>
          </div>
        </section>

        {/* DEEP STORY / MISSION: THE GROUND REALITY */}
        <section id="story" className="wrap section mentor-story-section">
          <div className="story-layout">
            <div className="story-sidebar">
              <span className="eyebrow">THE GROUND REALITY</span>
              <h2>
                Why most food businesses
                <br />
                <em>stumble before scaling.</em>
              </h2>
              <div className="mentor-quote-card">
                <blockquote>
                  &ldquo;Most food businesses in India don’t fail because the recipe is bad. They
                  fail because the founder overcapitalized on machinery before verifying channel
                  economics, got trapped in distributor credit cycles, or couldn&apos;t achieve shelf
                  stability at ambient temperature.&rdquo;
                </blockquote>
                <cite>— Manmath Biradar</cite>
              </div>
            </div>

            <div className="story-body">
              <p className="story-paragraph highlight">
                In June 2023, after more than a decade operating across large-scale agricultural
                systems, irrigation networks, and food processing supply chains, I left the corporate
                world to build an independent community. FAME grew directly from that decision.
              </p>

              <p className="story-paragraph">
                Every month, I met passionate farmers, homemakers, FMCG professionals, and young
                creators pouring their entire life savings into food ideas. They bought ₹15–25 lakh
                machinery, printed thousands of packaging boxes, and perfected their taste. But within
                6 months, their working capital evaporated.
              </p>

              <div className="story-insight-box">
                <h4>The 3 Costly Traps Food Founders Fall Into:</h4>
                <ul>
                  <li>
                    <strong>The Equipment Trap:</strong> Buying heavy stainless-steel machines before
                    selling even 500 units to real, paying strangers.
                  </li>
                  <li>
                    <strong>The Margin Trap:</strong> Believing a 50% kitchen gross margin equals
                    profit, without calculating distributor cuts (25–35%), retail margins (15–20%),
                    and delivery breakages.
                  </li>
                  <li>
                    <strong>The Channel Trap:</strong> Trying to launch on D2C, Amazon, quick-commerce,
                    and 50 local supermarkets all at once, splitting attention and drying up cash.
                  </li>
                </ul>
              </div>

              <p className="story-paragraph">
                FAME exists to solve this exact bottleneck. We bring product selection,
                commercialization science, and sales channel reality into one structured, step-by-step
                pathway. You get the math, the operational frameworks, and the confidence to build a
                business that survives and thrives in the real market.
              </p>
            </div>
          </div>
        </section>

        {/* 4 CORE MENTORSHIP TENETS */}
        <section className="wrap section mentor-tenets-section">
          <div className="section-head-center">
            <span className="eyebrow">THE FOUR TENETS OF FOOD COMMERCIALIZATION</span>
            <h2>
              The principles we teach
              <br />
              <em>inside every masterclass.</em>
            </h2>
            <p className="head-desc">
              These are not theories from academic textbooks. They are battle-tested rules designed to
              protect your capital and maximize your probability of success.
            </p>
          </div>

          <div className="tenets-grid">
            <article className="tenet-card">
              <div className="tenet-num">01</div>
              <div className="tenet-icon-wrap">
                <Target size={24} />
              </div>
              <h3>Validate Before You Buy Iron</h3>
              <p className="tenet-subtitle">Overcoming The Machinery Capital Trap</p>
              <p>
                Never spend ₹15–25 lakhs on automated packaging or processing plants on day one. Run
                pilot runs, use contract manufacturing or test-kitchen setups, and sell your first 500
                units to prove repeat demand.
              </p>
            </article>

            <article className="tenet-card">
              <div className="tenet-num">02</div>
              <div className="tenet-icon-wrap">
                <TrendingUp size={24} />
              </div>
              <h3>Master True Landed Margins</h3>
              <p className="tenet-subtitle">Beyond Misleading Kitchen Math</p>
              <p>
                Your gross margin shrinks fast when distributor margins (25–35%), retailer cuts
                (15–20%), transit wastage (3–5%), and marketing allowances apply. We teach you how to
                price for real bottom-line profitability.
              </p>
            </article>

            <article className="tenet-card">
              <div className="tenet-num">03</div>
              <div className="tenet-icon-wrap">
                <Package size={24} />
              </div>
              <h3>Food Science &amp; Ambient Stability</h3>
              <p className="tenet-subtitle">Shelf-Life Is Your Real Competitive Moat</p>
              <p>
                A product that spoils or separates after 14 days in ambient Indian warehouse heat will
                kill your distributor relations. Master water activity ($a_w$), moisture control, barrier
                packaging, and FSSAI standards.
              </p>
            </article>

            <article className="tenet-card">
              <div className="tenet-num">04</div>
              <div className="tenet-icon-wrap">
                <Layers size={24} />
              </div>
              <h3>Own One Channel First</h3>
              <p className="tenet-subtitle">Focus Over Fragmentation</p>
              <p>
                Retail, D2C, institutional catering, and marketplaces each require completely different
                working capital cycles. Pick one primary channel, achieve unit-economic mastery and cash
                flow velocity, then expand.
              </p>
            </article>
          </div>
        </section>

        {/* DOMAIN EXPERTISE & ACTIONABLE FOCUS */}
        <section className="wrap section mentor-domains-section">
          <span className="eyebrow">COMPREHENSIVE COVERAGE</span>
          <h2>
            What we dive deep into
            <br />
            <em>throughout the curriculum.</em>
          </h2>

          <div className="domains-grid">
            <div className="domain-card">
              <BookOpen className="domain-icon" size={26} />
              <h4>Product Matrix &amp; Viability</h4>
              <p>
                Analyzing value-added agro commodities, ready-to-cook (RTC), ready-to-eat (RTE),
                beverages, bakery, and health foods for seasonal raw material viability and processing
                yields.
              </p>
            </div>

            <div className="domain-card">
              <FileText className="domain-icon" size={26} />
              <h4>Packaging &amp; Regulatory Compliance</h4>
              <p>
                Selecting the right packaging barrier (metallized, multi-layer, vacuum, tin), FSSAI
                State and Central licensing, nutritional testing parameters, and compliant label
                declarations.
              </p>
            </div>

            <div className="domain-card">
              <Building2 className="domain-icon" size={26} />
              <h4>B2B, Retail &amp; Institutional Sales</h4>
              <p>
                Cracking trade distributor networks, pitching to corporate canteens and horeca (hotels,
                restaurants, cafes), managing credit periods, and negotiating sustainable retail shelf
                placements.
              </p>
            </div>

            <div className="domain-card">
              <Zap className="domain-icon" size={26} />
              <h4>Working Capital &amp; Cash Flow Survival</h4>
              <p>
                Managing the critical gap between supplier cash payments and distributor 45-day credit
                cycles. Cash-flow forecasting models so you never run out of liquidity mid-expansion.
              </p>
            </div>
          </div>
        </section>

        {/* PERSONAL NOTE FROM MANMATH */}
        <section className="wrap section mentor-letter-section">
          <div className="mentor-letter-card">
            <div className="letter-header">
              <span className="eyebrow">A PERSONAL MESSAGE FROM THE FOUNDER</span>
              <h3>To every aspiring and ambitious food entrepreneur:</h3>
            </div>
            <div className="letter-body">
              <p>
                Starting a food enterprise is one of the most noble and rewarding journeys in India.
                You are connecting the hard work of agriculture to the daily nourishment of families,
                creating employment, and building lasting value.
              </p>
              <p>
                However, passion without a solid operational compass is dangerous. You don’t need
                another vague motivation speech. You need actionable checklists, financial clarity,
                and someone who tells you the truth about margins, distributor politics, and
                manufacturing trade-offs.
              </p>
              <p>
                That is what FAME stands for. If you are prepared to build on solid ground, I look
                forward to working with you inside our programmes.
              </p>
            </div>
            <div className="letter-footer">
              <div className="founder-signature-block">
                <strong>Manmath Biradar</strong>
                <span>Founder &amp; Mentor · FAME</span>
              </div>
              <Link to="/courses" className="button">
                Start learning with Manmath <Arrow />
              </Link>
            </div>
          </div>
        </section>

        {/* PROGRAMMES CTA */}
        <section className="wrap cta-section mentor-final-cta">
          <div>
            <span className="eyebrow">CHOOSE YOUR PATHWAY</span>
            <h2>
              Ready to build your
              <br />
              <em>food business with clarity?</em>
            </h2>
            <p>
              Explore our structured programmes: Silver (L1 · Start), Gold (L2 · Set Up), and Diamond
              (L3 · Scale).
            </p>
          </div>
          <Link className="button light" to="/courses">
            View all programmes <Arrow />
          </Link>
        </section>
      </main>
    </PublicLayout>
  );
}
