import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ThumbsUp, CheckCircle2, ShieldCheck, 
  MessageSquare, Send, Check, AlertCircle, Share2, Sparkles
} from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { Notice, Loader } from '../components/shared';
import { api } from '../api.js';

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

export function CommunityPost() {
  const { postId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Reply form state
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [copied, setCopied] = useState(false);

  async function loadThread() {
    try {
      setLoading(true);
      setError('');
      const res = await api(`/community/posts/${postId}`);
      setPost(res.post);
      setReplies(res.replies || []);
    } catch (e) {
      setError(e.message || 'Discussion thread not found.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadThread();
  }, [postId]);

  async function handleUpvote() {
    if (!user) {
      navigate('/login');
      return;
    }
    const willUpvote = !post.user_has_upvoted;
    setPost(prev => ({
      ...prev,
      user_has_upvoted: willUpvote ? 1 : 0,
      upvote_count: willUpvote ? prev.upvote_count + 1 : Math.max(0, prev.upvote_count - 1),
    }));

    try {
      const res = await api(`/community/posts/${postId}/upvote`, { method: 'POST' });
      setPost(prev => ({
        ...prev,
        upvote_count: res.count,
        user_has_upvoted: res.upvoted ? 1 : 0,
      }));
    } catch (err) {
      console.error('Upvote failed:', err);
      loadThread();
    }
  }

  async function handlePostReply(e) {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!replyText.trim()) return;

    setSubmittingReply(true);
    try {
      await api(`/community/posts/${postId}/replies`, {
        method: 'POST',
        body: { body: replyText.trim() },
      });
      setReplyText('');
      await loadThread();
    } catch (err) {
      alert(err.message || 'Could not post reply. Please try again.');
    } finally {
      setSubmittingReply(false);
    }
  }

  async function handleToggleSolution(replyId) {
    try {
      const res = await api(`/community/replies/${replyId}/solution`, { method: 'POST' });
      setReplies(prev =>
        prev.map(r => (r.id === replyId ? { ...r, is_solution: res.is_solution ? 1 : 0 } : { ...r, is_solution: 0 }))
      );
      setPost(prev => ({ ...prev, is_resolved: res.is_solution ? 1 : 0 }));
    } catch (err) {
      alert(err.message || 'Could not update solution status.');
    }
  }

  function handleShare() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (loading) {
    return (
      <div className="site-shell">
        <Header />
        <div className="wrap section" style={{ textAlign: 'center', padding: '100px 0' }}>
          <Loader />
          <p>Loading discussion thread...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="site-shell">
        <Header />
        <div className="wrap section empty-state">
          <AlertCircle size={48} />
          <h1>Discussion Not Found</h1>
          <p>{error || 'This question might have been removed or moved.'}</p>
          <Link to="/community" className="button primary">
            Back to Community
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isAuthorOrAdmin = user && (user.id === post.author_id || user.role === 'admin');

  return (
    <div className="site-shell">
      <Header />
      <main id="main" className="thread-page wrap">
        {/* Navigation Bar */}
        <div className="thread-nav-bar">
          <Link to="/community" className="back-link">
            <ArrowLeft size={16} /> Back to all doubts
          </Link>
          <button className="button small outline" onClick={handleShare}>
            {copied ? <Check size={16} /> : <Share2 size={16} />}
            {copied ? 'Link Copied!' : 'Share Question'}
          </button>
        </div>

        {/* Main Question Card */}
        <article className="thread-question-card">
          <div className="thread-meta-top">
            <div className="doubt-tags">
              <span className="badge category-badge">{post.category}</span>
              {post.is_resolved ? (
                <span className="badge resolved-badge">
                  <CheckCircle2 size={13} /> Solution Verified
                </span>
              ) : null}
              {post.course_title && (
                <span className="badge course-context-badge">
                  {post.course_title}
                </span>
              )}
            </div>
            <span className="doubt-timestamp">Asked {timeAgo(post.created_at)}</span>
          </div>

          <h1 className="thread-title">{post.title}</h1>

          {/* Author info pill */}
          <div className="thread-author-strip">
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
                {post.author_headline && (
                  <span className="author-headline">{post.author_headline}</span>
                )}
              </div>
            </Link>
          </div>

          {/* Question Body */}
          <div className="thread-body">
            {post.body.split('\n\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          {/* Question Actions */}
          <div className="thread-action-bar">
            <button 
              className={`upvote-btn ${post.user_has_upvoted ? 'upvoted' : ''}`}
              onClick={handleUpvote}
            >
              <ThumbsUp size={16} />
              <span>{post.upvote_count} Upvotes</span>
            </button>
            <div className="replies-counter">
              <MessageSquare size={16} />
              <span>{replies.length} {replies.length === 1 ? 'Answer' : 'Answers'}</span>
            </div>
          </div>
        </article>

        {/* Replies / Answers Section */}
        <section className="thread-answers-section">
          <div className="answers-header">
            <h2>{replies.length} Community {replies.length === 1 ? 'Answer' : 'Answers'}</h2>
            {post.is_resolved ? (
              <span className="badge resolved-badge">
                <CheckCircle2 size={14} /> Has Accepted Solution
              </span>
            ) : null}
          </div>

          <div className="answers-list">
            {replies.map(reply => (
              <div 
                key={reply.id} 
                className={`answer-card ${reply.is_solution ? 'solution-card' : ''}`}
              >
                {reply.is_solution ? (
                  <div className="solution-banner">
                    <CheckCircle2 size={16} />
                    <span>ACCEPTED SOLUTION / MENTOR VERIFIED</span>
                  </div>
                ) : null}

                <div className="answer-header">
                  <Link to={`/u/${reply.author_handle}`} className="author-link">
                    {reply.author_avatar ? (
                      <img src={reply.author_avatar} alt={reply.author_name} className="author-avatar-img" />
                    ) : (
                      <div className="author-avatar-initials">
                        {reply.author_name?.slice(0, 1).toUpperCase() || 'U'}
                      </div>
                    )}
                    <div className="author-meta">
                      <div className="author-name-row">
                        <span className="author-name">{reply.author_name}</span>
                        <span className="author-handle">@{reply.author_handle}</span>
                        {reply.author_role === 'admin' && (
                          <span className="badge mentor-badge">
                            <ShieldCheck size={12} /> Chief Mentor
                          </span>
                        )}
                      </div>
                      {reply.author_headline && (
                        <span className="author-headline">{reply.author_headline}</span>
                      )}
                    </div>
                  </Link>
                  <span className="doubt-timestamp">{timeAgo(reply.created_at)}</span>
                </div>

                <div className="answer-body">
                  {reply.body.split('\n\n').map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>

                {isAuthorOrAdmin && (
                  <div className="answer-author-actions">
                    <button 
                      className={`solution-toggle-btn ${reply.is_solution ? 'active' : ''}`}
                      onClick={() => handleToggleSolution(reply.id)}
                    >
                      <CheckCircle2 size={15} />
                      {reply.is_solution ? 'Unmark as Solution' : 'Mark as Accepted Solution'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* New Reply Composer */}
          <div className="reply-composer-card">
            <h3>Contribute Your Answer / Insight</h3>
            {user ? (
              <form onSubmit={handlePostReply}>
                <textarea
                  rows={5}
                  placeholder="Provide technical insights, packaging guidelines, vendor experiences, or formulation tips..."
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  required
                  minLength={2}
                  maxLength={10000}
                />
                <div className="reply-composer-footer">
                  <small>Please keep answers constructive, actionable, and specific to food processing.</small>
                  <button 
                    type="submit" 
                    className="button primary"
                    disabled={submittingReply || !replyText.trim()}
                  >
                    <Send size={15} /> {submittingReply ? 'Posting...' : 'Post Answer'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="reply-login-gate">
                <p>Have knowledge on this subject? Sign in to contribute to the founder community.</p>
                <Link to="/login" className="button primary small">
                  Sign In to Answer
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
