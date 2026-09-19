import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Share2, Check, MapPin, Calendar, Globe, Linkedin, 
  Instagram, Twitter, Award, MessageSquare, ThumbsUp, 
  CheckCircle2, ArrowRight, ShieldCheck, Sparkles, AlertCircle, Edit3
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

  const { profile, badges, stats, recentPosts } = profileData;
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
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
