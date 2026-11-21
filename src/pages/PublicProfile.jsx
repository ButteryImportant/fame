import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Share2, Check, MapPin, Calendar, Globe, Linkedin, 
  Instagram, Twitter, Award, MessageSquare, ThumbsUp, 
  CheckCircle2, ArrowRight, ShieldCheck, Sparkles, AlertCircle, Edit3,
  GraduationCap
} from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { Loader } from '../components/shared';
import { api } from '../api.js';

function timeAgo(dateOrEpoch) {
  const diff = Date.now() - Number(dateOrEpoch);
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function PublicProfile() {
  const { handle } = useParams();
  const { user } = useAuth();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  async function loadProfile() {
    try {
      setLoading(true);
      setError('');
      const res = await api(`/u/${handle}`);
      setProfileData(res);
    } catch (e) {
      setError(e.message || 'Profile not found.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, [handle]);

  function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `${profileData.profile.name} (@${profileData.profile.handle}) — FAME`,
        text: profileData.profile.headline || `Check out ${profileData.profile.name}'s profile on FAME`,
        url,
      }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  if (loading) {
    return (
      <div className="site-shell">
        <Header />
        <div className="wrap section" style={{ textAlign: 'center', padding: '120px 0' }}>
          <Loader />
          <p>Loading founder profile...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="site-shell">
        <Header />
        <div className="wrap section empty-state">
          <AlertCircle size={48} />
          <h1>Founder Profile Not Found</h1>
          <p>{error || "The requested profile handle doesn't exist."}</p>
          <Link to="/community" className="button primary">
            Explore Community
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const { profile, badges, stats, recentPosts, enrolledCourses = [], progress = {} } = profileData;
  const isOwnProfile = user && user.id === profile.user_id;

  return (
    <div className="site-shell">
      <Header />
      <main id="main" className="profile-page">
        {/* Profile Header Banner */}
        <section className="profile-hero">
          <div className="wrap profile-hero-container">
            {/* Avatar & Key Info */}
            <div className="profile-main-card">
              <div className="profile-avatar-wrapper">
                {profile.avatar ? (
                  <img src={profile.avatar} alt={profile.name} className="profile-avatar-large" />
                ) : (
                  <div className="profile-avatar-placeholder">
                    {profile.name?.slice(0, 1).toUpperCase() || 'U'}
                  </div>
                )}
              </div>

              <div className="profile-identity">
                <div className="profile-name-row">
                  <h1 className="profile-name">{profile.name}</h1>
                  {profile.role === 'admin' && (
                    <span className="badge mentor-badge">
                      <ShieldCheck size={14} /> Chief Mentor
                    </span>
                  )}
                </div>

                <div className="profile-handle">@{profile.handle}</div>

                {profile.headline ? (
                  <p className="profile-headline">{profile.headline}</p>
                ) : (
                  <p className="profile-headline text-muted">Food Innovator &amp; FAME Community Member</p>
                )}

                <div className="profile-meta-chips">
                  {profile.location && (
                    <span className="meta-chip">
                      <MapPin size={14} /> {profile.location}
                    </span>
                  )}
                  {profile.member_since && (
                    <span className="meta-chip">
                      <Calendar size={14} /> Joined {new Date(profile.member_since).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>

                {/* Badges Section */}
                {badges && badges.length > 0 && (
                  <div className="profile-badges-row">
                    {badges.map(b => (
                      <span key={b.name} className={`badge-pill badge-${b.type}`}>
                        <Award size={13} /> {b.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="profile-actions">
                <button className="button primary" onClick={handleShare}>
                  {copied ? <Check size={16} /> : <Share2 size={16} />}
                  {copied ? 'Profile Link Copied!' : 'Share Profile'}
                </button>
                {isOwnProfile && (
                  <Link to="/account" className="button outline">
                    <Edit3 size={15} /> Edit Profile
                  </Link>
                )}
              </div>
            </div>

            {/* Personality Details Grid */}
            <div className="profile-details-grid">
              {/* Bio Card */}
              <div className="profile-info-card">
                <h3>About &amp; Vision</h3>
                {profile.bio ? (
                  <p className="profile-bio-text">{profile.bio}</p>
                ) : (
                  <p className="text-muted">No founder bio added yet.</p>
                )}

                <hr className="divider-subtle" />

                <div className="profile-meta-list">
                  <div className="profile-meta-item">
                    <span className="meta-label">Business Stage</span>
                    <span className="meta-value stage-tag">{profile.business_stage || 'Idea Phase'}</span>
                  </div>
                  {profile.focus_area && (
                    <div className="profile-meta-item">
                      <span className="meta-label">Focus Areas</span>
                      <span className="meta-value">{profile.focus_area}</span>
                    </div>
                  )}
                </div>

                {/* Social & Web Links */}
                <div className="profile-social-links">
                  {profile.website && (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="social-link-btn" title="Website">
                      <Globe size={18} />
                      <span>Website</span>
                    </a>
                  )}
                  {profile.linkedin && (
                    <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="social-link-btn" title="LinkedIn">
                      <Linkedin size={18} />
                      <span>LinkedIn</span>
                    </a>
                  )}
                  {profile.instagram && (
                    <a href={profile.instagram} target="_blank" rel="noopener noreferrer" className="social-link-btn" title="Instagram">
                      <Instagram size={18} />
                      <span>Instagram</span>
                    </a>
                  )}
                  {profile.twitter && (
                    <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="social-link-btn" title="X / Twitter">
                      <Twitter size={18} />
                      <span>X (Twitter)</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Activity Stats & Recent Doubts */}
              <div className="profile-activity-card">
                <div className="activity-stats-row">
                  <div className="stat-box">
                    <span className="stat-number">{stats?.postsCount || 0}</span>
                    <span className="stat-label">Questions Asked</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-number">{stats?.repliesCount || 0}</span>
                    <span className="stat-label">Answers Given</span>
                  </div>
                </div>

                <h3>Recent Community Doubts</h3>
                {recentPosts && recentPosts.length > 0 ? (
                  <div className="profile-posts-list">
                    {recentPosts.map(p => (
                      <Link to={`/community/${p.id}`} key={p.id} className="profile-post-item">
                        <div className="post-item-header">
                          <span className="badge category-badge small">{p.category}</span>
                          {p.is_resolved ? (
                            <span className="badge resolved-badge small">
                              <CheckCircle2 size={11} /> Resolved
                            </span>
                          ) : null}
                          <span className="post-time">{timeAgo(p.created_at)}</span>
                        </div>
                        <h4 className="post-item-title">{p.title}</h4>
                        <div className="post-item-meta">
                          <span><ThumbsUp size={13} /> {p.upvotes}</span>
                          <span><MessageSquare size={13} /> {p.reply_count} answers</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted" style={{ marginTop: '16px' }}>
                    Has not posted any doubts yet.
                  </p>
                )}
              </div>

              {/* Enrolled Programmes Card */}
              {enrolledCourses && enrolledCourses.length > 0 && (
                <div className="profile-info-card profile-progress-card" style={{ gridColumn: '1 / -1' }}>
                  <div className="profile-card-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                      <GraduationCap size={20} style={{ color: 'var(--green)' }} />
                      <span>{progress && progress.totalLessons > 0 ? 'Enrolled Programmes & Progress' : 'Enrolled Programmes'}</span>
                    </h3>
                    {progress && progress.totalLessons > 0 && (
                      <span className="overall-progress-pill" style={{ background: '#eef6f2', color: 'var(--green)', padding: '4px 12px', borderRadius: '20px', fontWeight: 700, fontSize: '.78rem' }}>
                        {progress.percent}% Overall Curriculum Complete
                      </span>
                    )}
                  </div>

                  <div className="profile-courses-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                    {enrolledCourses.map(c => {
                      const hasProgress = typeof c.percent === 'number' && typeof c.lessonCount === 'number';
                      return (
                        <div key={c.id} className="profile-course-item" style={{ borderRadius: '10px', padding: '18px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: hasProgress ? '10px' : '0' }}>
                            <div>
                              <span className="badge category-badge small">{c.eyebrow || 'Programme'}</span>
                              <h4 style={{ margin: '6px 0 0', fontSize: '1.05rem', fontWeight: 650 }}>{c.title}</h4>
                            </div>
                            {hasProgress ? (
                              <span className="course-progress-badge" style={{ background: '#e6f4ea', color: '#137333', fontWeight: 700, fontSize: '.76rem', padding: '3px 8px', borderRadius: '4px' }}>
                                {c.percent}%
                              </span>
                            ) : (
                              <span className="badge stage-tag" style={{ fontSize: '.72rem' }}>
                                Enrolled
                              </span>
                            )}
                          </div>

                          {hasProgress && (
                            <>
                              <div className="course-progress-track" style={{ height: '7px', background: '#e5ede8', borderRadius: '5px', overflow: 'hidden', margin: '12px 0 8px' }}>
                                <div 
                                  className="course-progress-fill" 
                                  style={{ height: '100%', background: 'var(--green)', borderRadius: '5px', width: `${Math.min(100, Math.max(0, c.percent))}%` }} 
                                  title={`${c.completedCount} of ${c.lessonCount} lessons completed`}
                                />
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '.76rem', color: 'var(--muted)' }}>
                                <span>{c.completedCount} of {c.lessonCount} lessons completed</span>
                                {c.percent === 100 && (
                                  <span style={{ color: '#137333', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                                    <CheckCircle2 size={12} /> 100% Completed
                                  </span>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
