import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Award,
  Crown,
  Gem,
  Zap,
  Clock,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { COURSE_TIERS, getCourseLeaderboard, getStoredUserXP } from '../utils/xpSystem';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export function CourseLeaderboard({
  initialCourseId = 'blueprint',
  liveMembers = [],
  currentUserCourses = [],
  compact = false,
  onSelectCourse,
}) {
  const { user } = useAuth();
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId);
  const [xpRevision, setXpRevision] = useState(0);
  const [actualMembers, setActualMembers] = useState(liveMembers);

  // Keep synced if parent changes initialCourseId
  useEffect(() => {
    if (initialCourseId) {
      setSelectedCourseId(initialCourseId);
    }
  }, [initialCourseId]);

  // Load real registered members with completion data (from /admin/users or /community/members)
  useEffect(() => {
    let isMounted = true;

    async function loadMembersWithProgress() {
      // 1. Try fetching from /admin/users which has the exact same completion stats as Owner Dashboard
      try {
        const adminRes = await api('/admin/users');
        if (isMounted && adminRes?.users && adminRes.users.length > 0) {
          setActualMembers(adminRes.users);
          return;
        }
      } catch {
        // Fall back gracefully
      }

      // 2. If parent passed liveMembers with data, use them
      if (liveMembers && liveMembers.length > 0) {
        if (isMounted) setActualMembers(liveMembers);
        return;
      }

      // 3. Fallback: fetch from /community/members
      try {
        const commRes = await api('/community/members');
        if (isMounted && commRes?.members) {
          setActualMembers(commRes.members);
        }
      } catch (err) {
        console.warn('Could not load live members for leaderboard:', err);
      }
    }

    loadMembersWithProgress();

    return () => {
      isMounted = false;
    };
  }, [liveMembers]);

  // Listen to live XP updates from video watch timer
  useEffect(() => {
    function handleXPUpdate() {
      setXpRevision((r) => r + 1);
    }
    window.addEventListener('fame_xp_updated', handleXPUpdate);
    return () => window.removeEventListener('fame_xp_updated', handleXPUpdate);
  }, []);

  const { tierInfo, leaderboard, userRank, userEntry, totalParticipants } = getCourseLeaderboard(
    selectedCourseId,
    user,
    actualMembers,
    currentUserCourses
  );

  const top3 = leaderboard.slice(0, 3);

  function handleTabChange(courseId) {
    setSelectedCourseId(courseId);
    if (onSelectCourse) onSelectCourse(courseId);
  }

  const tierIcons = {
    silver: Award,
    gold: Crown,
    diamond: Gem,
  };

  return (
    <div className={`course-leaderboard-container tier-${tierInfo.tier} ${compact ? 'compact' : ''}`}>
      {/* ─── Tier Switcher Tabs ────────────────────────────────────────── */}
      <div className="leaderboard-tier-tabs" role="tablist" aria-label="Course leaderboards">
        {Object.values(COURSE_TIERS).map((t) => {
          const Icon = tierIcons[t.tier] || Award;
          const isActive = selectedCourseId === t.id;
          return (
            <button
              key={t.id}
              className={`tier-tab-btn ${t.tier} ${isActive ? 'active' : ''}`}
              onClick={() => handleTabChange(t.id)}
              role="tab"
              aria-selected={isActive}
            >
              <Icon size={16} className="tier-tab-icon" />
              <div className="tier-tab-text">
                <span className="tier-name">{t.tierName}</span>
                <span className="tier-level">{t.level}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ─── Current User Live Rank Ribbon with Progress Meter ────────── */}
      {user && userEntry && (
        <div className="user-live-rank-card">
          <div className="rank-badge-col">
            <span className="rank-pill">#{userRank}</span>
            <small>Your Rank</small>
          </div>
          <div className="user-rank-info">
            <div className="user-rank-title-row">
              <strong>{user.name}</strong>
              <span className="user-tier-pill">{tierInfo.tierName}</span>
            </div>
            <p className="user-rank-stats-row">
              <span>
                <Zap size={14} className="xp-bolt-icon" />
                <strong>{userEntry.xp} XP</strong> in this course
              </span>
              <span className="dot-sep">·</span>
              <span>
                <Clock size={13} /> {userEntry.minutesWatched}m watched
              </span>
              <span className="dot-sep">·</span>
              <span className="rule-note">2 XP / min + 10 XP / lesson</span>
            </p>

            {/* Completion Progress Meter (Synced with Owner Dashboard) */}
            <div className="user-rank-completion-box">
              <div className="user-rank-completion-head">
                <span className="user-rank-progress-label">Course Completion</span>
                <span className="user-rank-percent-badge">{userEntry.percent}%</span>
              </div>
              <div className="user-rank-progress-track">
                <div
                  className="user-rank-progress-fill"
                  style={{ width: `${Math.min(100, Math.max(0, userEntry.percent))}%` }}
                />
              </div>
              <div className="user-rank-completion-foot">
                <span>
                  {userEntry.completedCount}/{userEntry.lessonCount} lessons completed
                </span>
                {userEntry.percent === 100 ? (
                  <span className="completion-complete-tag">🎓 100% Mastered</span>
                ) : (
                  <span>{Math.max(0, userEntry.lessonCount - userEntry.completedCount)} lessons remaining</span>
                )}
              </div>
            </div>
          </div>

          {userRank > 1 && leaderboard[userRank - 2] && (
            <div className="rank-milestone-pill">
              <TrendingUp size={14} />
              <span>
                <strong>{leaderboard[userRank - 2].xp - userEntry.xp + 1} XP</strong> to reach #{userRank - 1}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ─── Gamification Explain Banner ──────────────────────────────── */}
      <div className="leaderboard-xp-explainer">
        <div className="explainer-icon-bubble">
          <Zap size={18} />
        </div>
        <div className="explainer-copy">
          <h4>2 XP Every Minute Watched · 10 Bonus XP Per Lesson</h4>
          <p>
            Learn consistently with Manmath Biradar. Earn <strong>+2 XP every minute</strong> of masterclass video watched, plus <strong>+10 bonus XP</strong> and milestone rewards on completing lessons!
          </p>
        </div>
      </div>

      {/* ─── Top 3 Podium (Only shown if at least 2 real members exist) ─── */}
      {!compact && top3.length >= 2 && (
        <div className="leaderboard-podium-row">
          {/* 2nd Place */}
          {top3[1] && (
            <div className="podium-card rank-2">
              <div className="podium-avatar-wrap">
                <span className="podium-crown silver">🥈</span>
                <div className="podium-avatar" style={{ background: top3[1].avatarBg }}>
                  {top3[1].avatar_url ? (
                    <img src={top3[1].avatar_url} alt={top3[1].name} />
                  ) : (
                    top3[1].name.charAt(0)
                  )}
                </div>
              </div>
              <span className="podium-rank-tag">#2</span>
              <strong className="podium-name">{top3[1].name}</strong>
              <span className="podium-handle">@{top3[1].handle}</span>
              <div className="podium-xp-pill">
                <Zap size={13} />
                <span>{top3[1].xp} XP</span>
              </div>
              <div className="podium-completion-box">
                <div className="podium-progress-track">
                  <div
                    className="podium-progress-fill"
                    style={{ width: `${Math.min(100, Math.max(0, top3[1].percent))}%` }}
                  />
                </div>
                <small className="podium-completion-meta">
                  {top3[1].percent}% · {top3[1].completedCount}/{top3[1].lessonCount} lessons
                </small>
              </div>
              <small className="podium-meta">{top3[1].minutesWatched}m watched</small>
            </div>
          )}

          {/* 1st Place */}
          {top3[0] && (
            <div className="podium-card rank-1 champion">
              <div className="podium-avatar-wrap">
                <span className="podium-crown gold">🥇</span>
                <div className="podium-avatar champ" style={{ background: top3[0].avatarBg }}>
                  {top3[0].avatar_url ? (
                    <img src={top3[0].avatar_url} alt={top3[0].name} />
                  ) : (
                    top3[0].name.charAt(0)
                  )}
                </div>
              </div>
              <span className="podium-rank-tag gold">#1 Leader</span>
              <strong className="podium-name">{top3[0].name}</strong>
              <span className="podium-handle">@{top3[0].handle}</span>
              <div className="podium-xp-pill gold">
                <Zap size={14} />
                <span>{top3[0].xp} XP</span>
              </div>
              <div className="podium-completion-box">
                <div className="podium-progress-track">
                  <div
                    className="podium-progress-fill"
                    style={{ width: `${Math.min(100, Math.max(0, top3[0].percent))}%` }}
                  />
                </div>
                <small className="podium-completion-meta">
                  {top3[0].percent}% · {top3[0].completedCount}/{top3[0].lessonCount} lessons
                </small>
              </div>
              <small className="podium-meta">{top3[0].minutesWatched}m watched</small>
            </div>
          )}

          {/* 3rd Place */}
          {top3[2] && (
            <div className="podium-card rank-3">
              <div className="podium-avatar-wrap">
                <span className="podium-crown bronze">🥉</span>
                <div className="podium-avatar" style={{ background: top3[2].avatarBg }}>
                  {top3[2].avatar_url ? (
                    <img src={top3[2].avatar_url} alt={top3[2].name} />
                  ) : (
                    top3[2].name.charAt(0)
                  )}
                </div>
              </div>
              <span className="podium-rank-tag">#3</span>
              <strong className="podium-name">{top3[2].name}</strong>
              <span className="podium-handle">@{top3[2].handle}</span>
              <div className="podium-xp-pill">
                <Zap size={13} />
                <span>{top3[2].xp} XP</span>
              </div>
              <div className="podium-completion-box">
                <div className="podium-progress-track">
                  <div
                    className="podium-progress-fill"
                    style={{ width: `${Math.min(100, Math.max(0, top3[2].percent))}%` }}
                  />
                </div>
                <small className="podium-completion-meta">
                  {top3[2].percent}% · {top3[2].completedCount}/{top3[2].lessonCount} lessons
                </small>
              </div>
              <small className="podium-meta">{top3[2].minutesWatched}m watched</small>
            </div>
          )}
        </div>
      )}

      {/* ─── Full Real Member Leaderboard List ────────────────────────── */}
      <div className="leaderboard-list">
        <div className="leaderboard-list-head">
          <span>Rank &amp; Founder</span>
          <span className="desktop-progress-head">Course Completion</span>
          <span>Watch Time &amp; XP</span>
        </div>

        {leaderboard.length === 0 ? (
          <div className="leaderboard-empty-state" style={{ padding: '30px 16px', textAlign: 'center' }}>
            <Trophy size={32} style={{ color: '#94a3b8', margin: '0 auto 10px' }} />
            <p style={{ margin: 0, fontWeight: 600 }}>No enrolled members in {tierInfo.tierName} yet.</p>
            <small style={{ color: 'var(--muted)' }}>
              Enrol and complete masterclasses to earn XP and take the #1 rank!
            </small>
          </div>
        ) : (
          leaderboard.map((item) => {
            const isUser = item.isCurrentUser;
            const isTop3 = item.rank <= 3;
            return (
              <div
                key={item.id}
                className={`leaderboard-row ${isUser ? 'current-user-row' : ''} ${isTop3 ? `top-${item.rank}` : ''}`}
              >
                <div className="leaderboard-row-left">
                  <span className={`leaderboard-rank-number ${isTop3 ? `rank-${item.rank}` : ''}`}>
                    {item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : `#${item.rank}`}
                  </span>

                  <div className="leaderboard-avatar" style={{ background: item.avatarBg }}>
                    {item.avatar_url ? (
                      <img src={item.avatar_url} alt={item.name} />
                    ) : (
                      item.name.charAt(0)
                    )}
                  </div>

                  <div className="leaderboard-founder-copy">
                    <div className="founder-name-row">
                      {isUser ? (
                        <span className="founder-name">
                          {item.name} <span className="you-tag">You</span>
                        </span>
                      ) : (
                        <Link to={`/u/${item.handle}`} className="founder-name" title={`View @${item.handle}`}>
                          {item.name}
                        </Link>
                      )}
                      <span className="founder-handle">@{item.handle}</span>
                    </div>
                    {item.headline && <span className="founder-headline">{item.headline}</span>}

                    {/* Mobile inline progress badge */}
                    <div className="mobile-only-progress">
                      <span className="mini-percent">{item.percent}% done</span>
                      <span className="dot-sep">·</span>
                      <span className="mini-lessons">{item.completedCount}/{item.lessonCount}</span>
                    </div>
                  </div>
                </div>

                {/* Center: Course Completion Widget (Synced from Owner Dashboard) */}
                <div className="leaderboard-progress-col desktop-only-flex">
                  <div className="leaderboard-progress-header">
                    <span className={`leaderboard-percent-badge ${item.percent === 100 ? 'complete' : ''}`}>
                      {item.percent}%
                    </span>
                    <span className="leaderboard-lessons-text">
                      {item.completedCount}/{item.lessonCount} lessons
                    </span>
                  </div>
                  <div className="leaderboard-progress-track">
                    <div
                      className={`leaderboard-progress-fill ${item.percent === 100 ? 'complete' : ''}`}
                      style={{ width: `${Math.min(100, Math.max(0, item.percent))}%` }}
                    />
                  </div>
                </div>

                <div className="leaderboard-row-right">
                  <div className="leaderboard-xp-chip">
                    <Zap size={13} className="xp-icon" />
                    <strong>{item.xp} XP</strong>
                  </div>
                  <div className="leaderboard-time-meta">
                    <span>{item.minutesWatched}m watched</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
