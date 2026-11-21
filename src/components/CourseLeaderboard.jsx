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
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { COURSE_TIERS, getCourseLeaderboard, getStoredUserXP } from '../utils/xpSystem';
import { useAuth } from '../context/AuthContext';

export function CourseLeaderboard({
  initialCourseId = 'blueprint',
  liveMembers = [],
  compact = false,
  onSelectCourse,
}) {
  const { user } = useAuth();
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId);
  const [xpRevision, setXpRevision] = useState(0);

  // Keep synced if parent changes initialCourseId
  useEffect(() => {
    if (initialCourseId) {
      setSelectedCourseId(initialCourseId);
    }
  }, [initialCourseId]);

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
    liveMembers
  );

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

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

      {/* ─── Current User Live Rank Ribbon ────────────────────────────── */}
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
              <span className="rule-note">2 XP / min watched</span>
            </p>
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
          <h4>2 XP for Every 1 Minute Watched</h4>
          <p>
            Learn consistently with Manmath Biradar. Earn <strong>+2 XP every minute</strong> of masterclass video watched, plus <strong>+10 bonus XP</strong> on completing lessons!
          </p>
        </div>
      </div>

      {/* ─── Top 3 Podium (Desktop & Tablet) ─────────────────────────── */}
      {!compact && top3.length === 3 && (
        <div className="leaderboard-podium-row">
          {/* 2nd Place */}
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
            <small className="podium-meta">{top3[1].minutesWatched} mins</small>
          </div>

          {/* 1st Place */}
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
            <small className="podium-meta">{top3[0].minutesWatched} mins</small>
          </div>

          {/* 3rd Place */}
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
            <small className="podium-meta">{top3[2].minutesWatched} mins</small>
          </div>
        </div>
      )}

      {/* ─── Full Leaderboard List ────────────────────────────────────── */}
      <div className="leaderboard-list">
        <div className="leaderboard-list-head">
          <span>Rank &amp; Founder</span>
          <span>Watch Time &amp; XP</span>
        </div>

        {leaderboard.map((item) => {
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
                    <span className="founder-name">
                      {item.name}
                      {isUser && <span className="you-tag">You</span>}
                    </span>
                    <span className="founder-handle">@{item.handle}</span>
                  </div>
                  <span className="founder-headline">{item.headline}</span>
                </div>
              </div>

              <div className="leaderboard-row-right">
                <div className="leaderboard-xp-chip">
                  <Zap size={13} className="xp-icon" />
                  <strong>{item.xp} XP</strong>
                </div>
                <div className="leaderboard-time-meta">
                  <span>{item.minutesWatched}m</span>
                  <span className="pipe-sep">·</span>
                  <span>{item.lessonsCompleted} done</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
