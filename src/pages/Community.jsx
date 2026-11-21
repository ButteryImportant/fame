import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  MessageSquare, ThumbsUp, CheckCircle2, Search, Plus, 
  HelpCircle, Sparkles, Filter, X, ArrowRight, UserCheck, ShieldCheck,
  Users, GraduationCap, Award, TrendingUp, BookOpen, MapPin, Trophy, Zap
} from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { Notice, Loader } from '../components/shared';
import { CourseLeaderboard } from '../components/CourseLeaderboard';
import { api } from '../api.js';

const CATEGORIES = [
  'All',
  'Packaging & Compliance',
  'Unit Economics & Sourcing',
  'Recipe Formulation & Testing',
  'Machinery & Plant Setup',
  'Branding & Distribution',
  'General'
];

function timeAgo(dateOrEpoch) {
  const diff = Date.now() - Number(dateOrEpoch);
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(Number(dateOrEpoch)).toLocaleDateString();
}

export function Community() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState(
    searchParams.get('tab') === 'members'
      ? 'members'
      : searchParams.get('tab') === 'leaderboard'
        ? 'leaderboard'
        : 'doubts'
  );

  // Doubts state
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [category, setCategory] = useState('All');
  const [filter, setFilter] = useState('all'); // all, resolved, open
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // New doubt form state
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newCategory, setNewCategory] = useState('Packaging & Compliance');

  // Enrolled Members state
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [memberSearch, setMemberSearch] = useState('');
  const [memberCourse, setMemberCourse] = useState('all');
  const [memberSort, setMemberSort] = useState('recent'); // recent, progress, alphabetical
  const [coursesList, setCoursesList] = useState([]);

  // Sync tab with URL
  useEffect(() => {
    if (activeTab === 'members') {
      setSearchParams({ tab: 'members' }, { replace: true });
    } else if (activeTab === 'leaderboard') {
      setSearchParams({ tab: 'leaderboard' }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [activeTab]);

  // Load Doubts
  async function loadPosts() {
    try {
      setLoadingPosts(true);
      const q = new URLSearchParams();
      if (category !== 'All') q.set('category', category);
      if (filter !== 'all') q.set('filter', filter);
      if (search.trim()) q.set('search', search.trim());
      const res = await api(`/community/posts?${q.toString()}`);
      setPosts(res.posts || []);
    } catch (e) {
      console.error('Failed to load posts:', e);
    } finally {
      setLoadingPosts(false);
    }
  }

  // Load Enrolled Members
  async function loadMembers() {
    try {
      setLoadingMembers(true);
      const q = new URLSearchParams();
      if (memberSearch.trim()) q.set('search', memberSearch.trim());
      if (memberCourse !== 'all') q.set('courseId', memberCourse);
      if (memberSort) q.set('sort', memberSort);
      const res = await api(`/community/members?${q.toString()}`);
      setMembers(res.members || []);

      // Extract unique course titles for filter dropdown
      const coursesMap = new Map();
      (res.members || []).forEach(m => {
        (m.enrolled_courses || []).forEach(c => {
          if (!coursesMap.has(c.id)) {
            coursesMap.set(c.id, c.title);
          }
        });
      });
      setCoursesList(Array.from(coursesMap.entries()).map(([id, title]) => ({ id, title })));
    } catch (e) {
      console.error('Failed to load members:', e);
    } finally {
      setLoadingMembers(false);
    }
  }

  useEffect(() => {
    loadPosts();
  }, [category, filter]);

  useEffect(() => {
    const t = setTimeout(() => loadPosts(), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    loadMembers();
  }, [memberCourse, memberSort]);

  useEffect(() => {
    const t = setTimeout(() => loadMembers(), 300);
    return () => clearTimeout(t);
  }, [memberSearch]);

  async function handleUpvote(postId, e) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const willUpvote = !p.user_has_upvoted;
      return {
        ...p,
        user_has_upvoted: willUpvote ? 1 : 0,
        upvote_count: willUpvote ? p.upvote_count + 1 : Math.max(0, p.upvote_count - 1),
      };
    }));

    try {
      const r = await api(`/community/posts/${postId}/upvote`, { method: 'POST' });
      setPosts(prev => prev.map(p => (p.id === postId ? { ...p, upvote_count: r.count, user_has_upvoted: r.upvoted ? 1 : 0 } : p)));
    } catch (err) {
      console.error('Upvote failed:', err);
      loadPosts();
    }
  }

  async function handleCreatePost(e) {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await api('/community/posts', {
        method: 'POST',
        body: {
          title: newTitle,
          body: newBody,
          category: newCategory,
        },
      });
      setModalOpen(false);
      setNewTitle('');
      setNewBody('');
      navigate(`/community/${res.id}`);
    } catch (err) {
      setError(err.message || 'Could not post your doubt. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="site-shell">
      <Header />
      <main id="main" className="community-page">
        {/* Hero Section */}
        <section className="community-hero">
          <div className="wrap">
            <div className="community-hero-content">
              <span className="eyebrow"><Sparkles size={14} /> FAME FOUNDER NETWORK</span>
              <h1>Food Business &amp; Agro Innovators.</h1>
              <p>
                Collaborate with fellow enrolled founders and get real-world answers on formulations, packaging film specs, FSSAI compliance, machinery selection, and shelf-life directly from founder Manmath Biradar.
              </p>
              <div className="community-hero-actions">
                <button 
                  className="button primary" 
                  onClick={() => user ? setModalOpen(true) : navigate('/login')}
                >
                  <Plus size={18} /> Ask a Doubt
                </button>
                <button
                  className={`button ${activeTab === 'members' ? 'outline light' : 'outline light'}`}
                  onClick={() => setActiveTab(activeTab === 'members' ? 'doubts' : 'members')}
                >
                  <Users size={18} /> {activeTab === 'members' ? 'View Doubts & Feed' : 'Enrolled Members'}
                </button>
                {user && (
                  <Link to={`/u/${user.handle || 'me'}`} className="button outline light">
                    <UserCheck size={18} /> My Profile
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Container */}
        <div className="wrap community-container">
          {/* Primary Top Navigation Tabs */}
          <div className="community-main-tabs-row">
            <button
              className={`community-nav-tab ${activeTab === 'doubts' ? 'active' : ''}`}
              onClick={() => setActiveTab('doubts')}
            >
              <MessageSquare size={17} />
              <span>Doubts &amp; Discussions</span>
              <span className="tab-pill">{posts.length}</span>
            </button>
            <button
              className={`community-nav-tab ${activeTab === 'members' ? 'active' : ''}`}
              onClick={() => setActiveTab('members')}
            >
              <Users size={17} />
              <span>Enrolled Founders</span>
              <span className="tab-pill">{members.length}</span>
            </button>
            <button
              className={`community-nav-tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('leaderboard')}
            >
              <Trophy size={17} />
              <span>Course Leaderboards</span>
              <span className="tab-pill xp-pill-tab">XP</span>
            </button>
          </div>

          {/* ═════════════════ TAB 1: DOUBTS & DISCUSSIONS ═════════════════ */}
          {activeTab === 'doubts' && (
            <>
              {/* Controls */}
              <div className="community-controls">
                {/* Search Input */}
                <div className="community-search-box">
                  <Search size={18} className="search-icon" />
                  <input 
                    type="text" 
                    placeholder="Search doubts by keyword, ingredient, machinery..." 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                  {search && (
                    <button className="clear-search" onClick={() => setSearch('')} title="Clear search">
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Status Filter */}
                <div className="community-status-tabs">
                  <button 
                    className={`status-tab ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                  >
                    All
                  </button>
                  <button 
                    className={`status-tab ${filter === 'resolved' ? 'active' : ''}`}
                    onClick={() => setFilter('resolved')}
                  >
                    <CheckCircle2 size={15} /> Verified Solutions
                  </button>
                  <button 
                    className={`status-tab ${filter === 'open' ? 'active' : ''}`}
                    onClick={() => setFilter('open')}
                  >
                    Open Doubts
                  </button>
                </div>
              </div>

              {/* Category Chips */}
              <div className="community-categories">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    className={`category-chip ${category === cat ? 'active' : ''}`}
                    onClick={() => setCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Posts Feed */}
              {loadingPosts ? (
                <div className="community-loading">
                  <Loader />
                  <p>Loading community questions...</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="community-empty">
                  <HelpCircle size={48} />
                  <h3>No doubts found in this category</h3>
                  <p>Be the first founder to ask a question and get actionable guidance from Manmath Biradar.</p>
                  <button 
                    className="button primary" 
                    onClick={() => user ? setModalOpen(true) : navigate('/login')}
                  >
                    <Plus size={18} /> Ask a Doubt Now
                  </button>
                </div>
              ) : (
                <div className="community-feed">
                  {posts.map(post => (
                    <article key={post.id} className="doubt-card">
                      {/* Author Header */}
                      <div className="doubt-card-header">
                        <Link to={`/u/${post.author_handle}`} className="author-link" title={`View @${post.author_handle}'s profile`}>
                          {post.author_avatar ? (
                            <img src={post.author_avatar} alt={post.author_name} className="author-avatar-img" />
                          ) : (
                            <div className="author-avatar-initials">
                              {post.author_name?.slice(0, 1).toUpperCase() || 'U'}
                            </div>
                          )}
                          <div className="author-meta">
                            <div className="author-name-row">
                              <span className="author-name">{post.author_name}</span>
                              <span className="author-handle">@{post.author_handle}</span>
                              {post.author_role === 'admin' && (
                                <span className="badge mentor-badge">
                                  <ShieldCheck size={12} /> Chief Mentor
                                </span>
                              )}
                            </div>
                            {post.author_headline ? (
                              <span className="author-headline">{post.author_headline}</span>
                            ) : null}
                          </div>
                        </Link>
                        <span className="doubt-timestamp">{timeAgo(post.created_at)}</span>
                      </div>

                      {/* Doubt Content */}
                      <div className="doubt-card-body">
                        <div className="doubt-tags">
                          <span className="badge category-badge">{post.category}</span>
                          {post.is_resolved ? (
                            <span className="badge resolved-badge">
                              <CheckCircle2 size={13} /> Verified Solution
                            </span>
                          ) : null}
                          {post.course_title && (
                            <span className="badge course-context-badge">
                              {post.course_title}
                            </span>
                          )}
                        </div>
                        <h2 className="doubt-title">
                          <Link to={`/community/${post.id}`}>{post.title}</Link>
                        </h2>
                        <p className="doubt-snippet">{post.body}</p>
                      </div>

                      {/* Doubt Card Footer */}
                      <div className="doubt-card-footer">
                        <div className="doubt-stats">
                          <button 
                            className={`upvote-btn ${post.user_has_upvoted ? 'upvoted' : ''}`}
                            onClick={(e) => handleUpvote(post.id, e)}
                            title={post.user_has_upvoted ? 'Remove upvote' : 'Upvote this doubt'}
                          >
                            <ThumbsUp size={16} />
                            <span>{post.upvote_count}</span>
                          </button>
                          <Link to={`/community/${post.id}`} className="replies-counter">
                            <MessageSquare size={16} />
                            <span>{post.reply_count} {post.reply_count === 1 ? 'answer' : 'answers'}</span>
                          </Link>
                        </div>
                        <Link to={`/community/${post.id}`} className="view-thread-link">
                          View Thread <ArrowRight size={15} />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ═════════════════ TAB 2: ENROLLED MEMBERS & PROGRESS ═════════════════ */}
          {activeTab === 'members' && (
            <div className="enrolled-members-section">
              {/* Member Search & Filters */}
              <div className="members-filter-bar">
                <div className="members-search-wrapper">
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search members by name, @handle, headline, or programme..."
                    value={memberSearch}
                    onChange={e => setMemberSearch(e.target.value)}
                  />
                  {memberSearch && (
                    <button className="clear-search" onClick={() => setMemberSearch('')} title="Clear search">
                      <X size={16} />
                    </button>
                  )}
                </div>

                <div className="members-filter-controls">
                  {coursesList.length > 0 && (
                    <label className="member-filter-label">
                      <span>Programme:</span>
                      <select 
                        value={memberCourse} 
                        onChange={e => setMemberCourse(e.target.value)}
                        className="member-select"
                      >
                        <option value="all">All Programmes</option>
                        {coursesList.map(c => (
                          <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                      </select>
                    </label>
                  )}

                  <label className="member-filter-label">
                    <span>Sort by:</span>
                    <select 
                      value={memberSort} 
                      onChange={e => setMemberSort(e.target.value)}
                      className="member-select"
                    >
                      <option value="recent">Recently Joined</option>
                      <option value="alphabetical">Name (A-Z)</option>
                    </select>
                  </label>
                </div>
              </div>

              {/* Members Grid */}
              {loadingMembers ? (
                <div className="community-loading">
                  <Loader />
                  <p>Loading enrolled members...</p>
                </div>
              ) : members.length === 0 ? (
                <div className="community-empty">
                  <Users size={48} />
                  <h3>No enrolled members match your criteria</h3>
                  <p>Try refining your search query or programme filter.</p>
                  <button 
                    className="button outline" 
                    onClick={() => { setMemberSearch(''); setMemberCourse('all'); setMemberSort('recent'); }}
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="enrolled-members-grid">
                  {members.map(m => (
                    <div key={m.id} className="member-card">
                      {/* Member Header */}
                      <div className="member-card-header">
                        <Link to={`/u/${m.handle}`} className="member-avatar-link" title={`View @${m.handle}'s profile`}>
                          {m.avatar ? (
                            <img src={m.avatar} alt={m.name} className="member-avatar-img" />
                          ) : (
                            <div className="member-avatar-initials">
                              {m.name?.slice(0, 1).toUpperCase() || 'M'}
                            </div>
                          )}
                        </Link>

                        <div className="member-header-info">
                          <div className="member-name-row">
                            <Link to={`/u/${m.handle}`} className="member-name-clickable" title={`Visit @${m.handle}'s profile`}>
                              {m.name}
                            </Link>
                            {m.role === 'admin' ? (
                              <span className="badge mentor-badge">
                                <ShieldCheck size={12} /> Chief Mentor
                              </span>
                            ) : (
                              <span className="badge founder-badge">
                                <UserCheck size={12} /> Enrolled Founder
                              </span>
                            )}
                          </div>
                          <Link to={`/u/${m.handle}`} className="member-handle-clickable">
                            @{m.handle}
                          </Link>
                        </div>
                      </div>

                      {/* Member Headline & Bio */}
                      <div className="member-card-body">
                        {m.headline ? (
                          <p className="member-headline">{m.headline}</p>
                        ) : (
                          <p className="member-headline text-muted">Food Innovator &amp; FAME Member</p>
                        )}

                        <div className="member-meta-row">
                          {m.location && (
                            <span className="member-meta-item">
                              <MapPin size={13} /> {m.location}
                            </span>
                          )}
                          <span className="member-meta-item stage-tag">
                            {m.business_stage || 'Idea Phase'}
                          </span>
                        </div>

                        {/* Enrolled Programmes Badges */}
                        <div className="member-courses-section">
                          <div className="courses-section-title">
                            <GraduationCap size={15} />
                            <span>Enrolled Programmes</span>
                          </div>

                          {m.enrolled_courses && m.enrolled_courses.length > 0 ? (
                            <div className="member-enrolled-badges">
                              {m.enrolled_courses.map(c => (
                                <span key={c.id} className="member-programme-badge" title={c.title}>
                                  {c.eyebrow ? `${c.eyebrow} · ` : ''}{c.title}
                                </span>
                              ))}
                            </div>
                          ) : m.role === 'admin' ? (
                            <div className="mentor-course-note">
                              <ShieldCheck size={15} />
                              <span>Chief Mentor &amp; Curriculum Architect (All Programmes)</span>
                            </div>
                          ) : (
                            <div className="empty-course-note">
                              <span>Enrolled in FAME Platform</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Footer: Clickable Profile Link Button */}
                      <div className="member-card-footer">
                        <Link to={`/u/${m.handle}`} className="member-view-profile-btn">
                          View Founder Profile &amp; Journey <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═════════════════ TAB 3: COURSE LEADERBOARDS ═════════════════ */}
          {activeTab === 'leaderboard' && (
            <div className="community-leaderboard-wrapper" style={{ marginTop: '24px' }}>
              <CourseLeaderboard liveMembers={members} />
            </div>
          )}
        </div>

        {/* Ask a Doubt Modal */}
        {modalOpen && (
          <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
            <div className="modal-dialog doubt-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Ask the FAME Community &amp; Mentor</h2>
                <button className="icon-button" onClick={() => setModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleCreatePost} className="modal-body doubt-form">
                {error && <Notice type="error">{error}</Notice>}
                <label>
                  Category
                  <select 
                    value={newCategory} 
                    onChange={e => setNewCategory(e.target.value)}
                    required
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Specific Question / Title
                  <input 
                    type="text" 
                    placeholder="e.g. How to select barrier packaging film for vacuum fried chips?" 
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    required
                    minLength={5}
                    maxLength={200}
                  />
                  <small>Make your question concise so fellow founders immediately understand your challenge.</small>
                </label>
                <label>
                  Detailed Context &amp; Experimentation
                  <textarea 
                    rows={6}
                    placeholder="Share your current formulation, lab test numbers, trial batch size, equipment used, target retail price, or where you're currently stuck..."
                    value={newBody}
                    onChange={e => setNewBody(e.target.value)}
                    required
                    minLength={10}
                    maxLength={20000}
                  />
                </label>
                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="button outline" 
                    onClick={() => setModalOpen(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="button primary"
                    disabled={submitting || !newTitle.trim() || !newBody.trim()}
                  >
                    {submitting ? 'Posting...' : 'Post Doubt'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
