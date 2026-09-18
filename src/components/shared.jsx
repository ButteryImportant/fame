import { Link } from 'react-router-dom';
import { ArrowUpRight, BookOpen, Plus, Award, Crown, Gem } from 'lucide-react';
import { money } from '../api.js';

// ─── Arrow ────────────────────────────────────────────────────────────────────
export const Arrow = () => <ArrowUpRight size={18} aria-hidden="true" />;

// ─── Brand ───────────────────────────────────────────────────────────────────
export function Brand() {
  return (
    <Link className="brand" to="/" aria-label="FAME home">
      <span className="brand-symbol">f</span>
      <span>
        FAME<span className="brand-caption">WITH MANMATH BIRADAR</span>
      </span>
    </Link>
  );
}

// ─── Notice ───────────────────────────────────────────────────────────────────
export function Notice({ children, type = 'error' }) {
  return children ? (
    <div className={`notice ${type}`} role={type === 'error' ? 'alert' : 'status'}>
      {children}
    </div>
  ) : null;
}

// ─── Loader ───────────────────────────────────────────────────────────────────
export function Loader() {
  return (
    <div className="loading" role="status">
      <span className="spinner" />
      Loading your next step…
    </div>
  );
}

// ─── CourseArt & Tier Configuration ──────────────────────────────────────────
const TIER_CONFIG = {
  green: {
    key: 'silver',
    tier: 'Silver',
    badge: 'Silver Tier',
    Icon: Award,
    pillar: 'PRODUCT · FOUNDATION · MARKET',
  },
  silver: {
    key: 'silver',
    tier: 'Silver',
    badge: 'Silver Tier',
    Icon: Award,
    pillar: 'PRODUCT · FOUNDATION · MARKET',
  },
  blue: {
    key: 'gold',
    tier: 'Gold',
    badge: 'Gold Tier',
    Icon: Crown,
    pillar: 'MODEL · OPERATIONS · LAUNCH',
  },
  gold: {
    key: 'gold',
    tier: 'Gold',
    badge: 'Gold Tier',
    Icon: Crown,
    pillar: 'MODEL · OPERATIONS · LAUNCH',
  },
  dark: {
    key: 'diamond',
    tier: 'Diamond',
    badge: 'Diamond Tier',
    Icon: Gem,
    pillar: 'SCALE · COMMERCIAL · MASTERY',
  },
  diamond: {
    key: 'diamond',
    tier: 'Diamond',
    badge: 'Diamond Tier',
    Icon: Gem,
    pillar: 'SCALE · COMMERCIAL · MASTERY',
  },
};

export function CourseArt({ course, compact = false }) {
  const config =
    TIER_CONFIG[course.accent] ||
    (course.level === 'L2' ? TIER_CONFIG.blue : course.level === 'L3' ? TIER_CONFIG.dark : TIER_CONFIG.green);
  const TierIcon = config.Icon;
  const tierKey = config.key;

  return (
    <div className={`course-art ${course.accent} tier-${tierKey} ${compact ? 'compact' : ''}`}>
      {/* Luxury watermark guilloche seal */}
      <svg className="course-art-watermark" viewBox="0 0 160 160" fill="none" aria-hidden="true">
        <circle cx="80" cy="80" r="74" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.35" />
        <circle cx="80" cy="80" r="62" stroke="currentColor" strokeWidth="1.2" opacity="0.3" />
        <circle cx="80" cy="80" r="50" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 4" opacity="0.45" />
        <polygon points="80,16 98,62 144,80 98,98 80,144 62,98 16,80 62,62" stroke="currentColor" strokeWidth="1.2" opacity="0.3" />
        <circle cx="80" cy="80" r="24" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
        <circle cx="80" cy="80" r="10" fill="currentColor" opacity="0.2" />
      </svg>

      <div className="course-art-inner">
        <span className="course-art-level">
          <span className="tier-dot" />FAME / {course.level || (tierKey === 'gold' ? 'L2' : tierKey === 'diamond' ? 'L3' : 'L1')}
        </span>
        <span className="course-art-badge">
          <TierIcon size={13} className="tier-icon" />
          <span>{config.tier}</span>
        </span>
      </div>

      <span className="course-art-title">
        {course.level === 'L1' ? (
          <>
            Start with
            <br />
            <em>clarity.</em>
          </>
        ) : course.level === 'L2' ? (
          <>
            Build with
            <br />
            <em>purpose.</em>
          </>
        ) : (
          <>
            Grow with
            <br />
            <em>direction.</em>
          </>
        )}
      </span>

      <span className="course-art-bottom">
        <span className="course-art-pillar">{config.pillar}</span>
        <span className="course-art-arrow">
          <ArrowUpRight size={16} />
        </span>
      </span>
    </div>
  );
}

// ─── CourseCard ───────────────────────────────────────────────────────────────
export function CourseCard({ course }) {
  return (
    <article className="course-card">
      <Link to={`/courses/${course.slug}`} aria-label={`Explore ${course.title}`}>
        <CourseArt course={course} />
      </Link>
      <div className="course-card-content">
        <div className="eyebrow">{course.eyebrow}</div>
        <h3>
          <Link to={`/courses/${course.slug}`}>{course.title}</Link>
        </h3>
        <p>{course.description}</p>
        <div className="course-meta">
          <BookOpen size={15} />
          <span>
            {course.lessonCount
              ? `${course.lessonCount} ${course.is_sample ? 'sample ' : ''}lessons`
              : 'Programme overview'}
          </span>
          <span className="divider-dot">·</span>
          <span>Hindi + English</span>
        </div>
        <div className="course-card-foot">
          <span className="price">
            {course.status === 'upcoming' ? 'Coming next' : money(course.price)}
            {course.status !== 'upcoming' && <small>one-time payment</small>}
          </span>
          <Link
            className="circle-link"
            to={`/courses/${course.slug}`}
            aria-label={`View ${course.title}`}
          >
            <Arrow />
          </Link>
        </div>
      </div>
    </article>
  );
}

// ─── Video Embed Normalization ────────────────────────────────────────────────
export function formatVideoEmbedUrl(url) {
  if (!url) return { url: '', isEmbed: false };
  try {
    const trimmed = url.trim();
    if (trimmed.includes('player.vimeo.com') || trimmed.includes('youtube-nocookie.com/embed/')) {
      return { url: trimmed, isEmbed: true };
    }
    const parsed = new URL(trimmed);
    const hostname = parsed.hostname.toLowerCase();

    // YouTube URLs: watch?v=, youtu.be/, embed/, shorts/
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      let videoId = '';
      if (hostname.includes('youtu.be')) {
        videoId = parsed.pathname.replace(/^\//, '').split('/')[0].split('?')[0];
      } else if (parsed.pathname.includes('/embed/')) {
        videoId = parsed.pathname.split('/embed/')[1].split('/')[0].split('?')[0];
      } else if (parsed.pathname.includes('/shorts/')) {
        videoId = parsed.pathname.split('/shorts/')[1].split('/')[0].split('?')[0];
      } else if (parsed.searchParams.has('v')) {
        videoId = parsed.searchParams.get('v');
      }

      if (videoId) {
        return {
          url: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&enablejsapi=1`,
          isEmbed: true,
        };
      }
    }

    // Vimeo standard URLs: vimeo.com/123456
    if (hostname.includes('vimeo.com')) {
      const match = parsed.pathname.match(/\/(\d+)/);
      if (match) {
        return {
          url: `https://player.vimeo.com/video/${match[1]}`,
          isEmbed: true,
        };
      }
    }
  } catch {}

  return { url, isEmbed: false };
}

// ─── LessonContent ────────────────────────────────────────────────────────────
export function LessonContent({ lesson }) {
  const { url: videoUrl, isEmbed } = formatVideoEmbedUrl(lesson.video_url);
  return (
    <>
      {videoUrl &&
        (isEmbed ? (
          <iframe
            className="lesson-video"
            title={lesson.title}
            src={videoUrl}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <video
            className="lesson-video"
            controls
            controlsList="nodownload"
            preload="metadata"
            src={videoUrl}
          >
            Your browser does not support this video.
          </video>
        ))}
      <div className="lesson-copy">
        {lesson.body
          .split('\n\n')
          .filter(Boolean)
          .map((p, i) => (
            <p key={i}>{p}</p>
          ))}
      </div>
    </>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  [
    'Who are these programmes for?',
    'FAME is for aspiring food entrepreneurs, existing food and agro MSMEs, professionals exploring entrepreneurship, and FPO teams. Choose the programme that matches your current stage.',
  ],
  [
    'Where should I start?',
    'If you are still choosing a product or business model, start with the Food Business Blueprint. If you already operate a business, explore Food Business Mastery and its current curriculum.',
  ],
  [
    'How do I access my course?',
    'Create your account and complete checkout. After payment is confirmed, your course appears in My Learning. You can return to your account to continue where you left off.',
  ],
  [
    'Can I learn on my phone?',
    'Yes. Your account, lessons and completion progress work across desktop, tablet and mobile. Sign in with the same account on each device.',
  ],
  [
    'What language is used?',
    "FAME programmes are designed around Hindi with English business terminology. Check each programme's lesson description for the available format.",
  ],
];

export function FAQ() {
  return (
    <section className="section wrap faq">
      <div>
        <span className="eyebrow">A LITTLE MORE CLARITY</span>
        <h2>
          Before you
          <br />
          <em>take the next step.</em>
        </h2>
      </div>
      <div>
        {FAQ_ITEMS.map(([q, a]) => (
          <details key={q}>
            <summary>
              {q}
              <Plus size={18} />
            </summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
