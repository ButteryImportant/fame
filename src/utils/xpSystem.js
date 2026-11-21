// ─── FAME XP & Gamification Engine ───────────────────────────────────────────
// Rule: 2 XP for every 1 minute (60 seconds) watched (1 XP per 30 seconds).
// Completion XP: 10 XP per completed lesson + milestone bonuses.
// ONLY real registered individuals from the database and authenticated users are tracked.

export const XP_PER_MINUTE = 2;
export const SECONDS_PER_XP = 30; // 30 seconds = 1 XP => 60 seconds = 2 XP
export const LESSON_COMPLETE_BONUS_XP = 10;

export const COURSE_TIERS = {
  blueprint: {
    id: 'blueprint',
    tier: 'silver',
    tierName: 'Silver Tier',
    title: 'Food Business Blueprint',
    level: 'L1',
    eyebrow: 'SILVER · START',
    accent: 'green',
    themeColor: '#125945',
    badgeColor: '#b4c1cd',
    targetAudience: 'Aspiring Food Entrepreneurs & Early Founders',
  },
  accelerator: {
    id: 'accelerator',
    tier: 'gold',
    tierName: 'Gold Tier',
    title: 'Food Business Accelerator',
    level: 'L2',
    eyebrow: 'GOLD · SET UP',
    accent: 'blue',
    themeColor: '#19538c',
    badgeColor: '#eab308',
    targetAudience: 'Early Manufacturers & Commercial Launchers',
  },
  mastery: {
    id: 'mastery',
    tier: 'diamond',
    tierName: 'Diamond Tier',
    title: 'Food Business Mastery',
    level: 'L3',
    eyebrow: 'DIAMOND · SCALE',
    accent: 'dark',
    themeColor: '#0b2622',
    badgeColor: '#38bdf8',
    targetAudience: 'Established Food MSMEs & Agro Scaleups',
  },
};

export function getTierInfo(courseId) {
  return COURSE_TIERS[courseId] || COURSE_TIERS.blueprint;
}

// ─── User Key Helper ─────────────────────────────────────────────────────────
function getUserStorageKey(userId) {
  return `fame_xp_v2_${userId || 'guest'}`;
}

// ─── Load Stored XP ──────────────────────────────────────────────────────────
export function getStoredUserXP(userId) {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(getUserStorageKey(userId));
      if (raw) {
        const data = JSON.parse(raw);
        return {
          totalXP: Number(data.totalXP) || 0,
          totalSecondsWatched: Number(data.totalSecondsWatched) || 0,
          courseSeconds: data.courseSeconds || {},
          courseXP: data.courseXP || {},
          lessonSeconds: data.lessonSeconds || {},
          completedBonusAwarded: data.completedBonusAwarded || {},
        };
      }
    }
  } catch (e) {
    console.error('Error reading XP from localStorage:', e);
  }

  return {
    totalXP: 0,
    totalSecondsWatched: 0,
    courseSeconds: {},
    courseXP: {},
    lessonSeconds: {},
    completedBonusAwarded: {},
  };
}

// ─── Record Watch Time ───────────────────────────────────────────────────────
export function recordWatchTime(userId, courseId, lessonId, deltaSeconds = 1) {
  if (!courseId || deltaSeconds <= 0) return { newXP: 0, totalXP: 0 };

  const data = getStoredUserXP(userId);
  const oldSeconds = data.totalSecondsWatched;
  const newSeconds = oldSeconds + deltaSeconds;

  // Track lesson seconds
  const lessonKey = `${courseId}_${lessonId || 'general'}`;
  data.lessonSeconds[lessonKey] = (data.lessonSeconds[lessonKey] || 0) + deltaSeconds;

  // Track course seconds
  data.courseSeconds[courseId] = (data.courseSeconds[courseId] || 0) + deltaSeconds;
  data.totalSecondsWatched = newSeconds;

  // XP calculation: 1 XP every SECONDS_PER_XP (30s), i.e., 2 XP every 60s
  const oldEarnedXP = Math.floor(oldSeconds / SECONDS_PER_XP);
  const newEarnedXP = Math.floor(newSeconds / SECONDS_PER_XP);
  const gainedXP = Math.max(0, newEarnedXP - oldEarnedXP);

  if (gainedXP > 0) {
    data.totalXP = (data.totalXP || 0) + gainedXP;
    data.courseXP[courseId] = (data.courseXP[courseId] || 0) + gainedXP;
  }

  try {
    localStorage.setItem(getUserStorageKey(userId), JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save XP:', e);
  }

  if (gainedXP > 0 && typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('fame_xp_updated', {
        detail: {
          gainedXP,
          totalXP: data.totalXP,
          courseId,
          courseXP: data.courseXP[courseId] || 0,
          totalSeconds: data.totalSecondsWatched,
          reason: 'watch_time',
        },
      })
    );
  }

  return {
    gainedXP,
    totalXP: data.totalXP,
    courseXP: data.courseXP[courseId] || 0,
    totalMinutes: Math.floor(data.totalSecondsWatched / 60),
    courseMinutes: Math.floor((data.courseSeconds[courseId] || 0) / 60),
  };
}

// ─── Award Lesson Completion Bonus ───────────────────────────────────────────
export function awardLessonCompletionXP(userId, courseId, lessonId) {
  if (!courseId || !lessonId) return { gainedXP: 0, totalXP: 0 };

  const data = getStoredUserXP(userId);
  const bonusKey = `${courseId}_${lessonId}`;

  // Only award once per lesson
  if (data.completedBonusAwarded[bonusKey]) {
    return { gainedXP: 0, totalXP: data.totalXP };
  }

  data.completedBonusAwarded[bonusKey] = true;
  data.totalXP = (data.totalXP || 0) + LESSON_COMPLETE_BONUS_XP;
  data.courseXP[courseId] = (data.courseXP[courseId] || 0) + LESSON_COMPLETE_BONUS_XP;

  try {
    localStorage.setItem(getUserStorageKey(userId), JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save XP bonus:', e);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('fame_xp_updated', {
        detail: {
          gainedXP: LESSON_COMPLETE_BONUS_XP,
          totalXP: data.totalXP,
          courseId,
          courseXP: data.courseXP[courseId] || 0,
          reason: 'lesson_completed',
        },
      })
    );
  }

  return {
    gainedXP,
    totalXP: data.totalXP,
    courseXP: data.courseXP[courseId] || 0,
  };
}

// ─── Extract Course Progress from Any User Object (Owner DB / Dashboard) ────
export function extractUserCourseProgress(userObj, courseId) {
  if (!userObj) return null;

  // 1. Check userObj.courses (as formatted by /api/admin/users or /api/dashboard)
  if (Array.isArray(userObj.courses)) {
    const match = userObj.courses.find((c) => c && (c.id === courseId || c.slug === courseId));
    if (match) {
      const completedCount = Number(
        match.completedCount ??
        (Array.isArray(match.completed) ? match.completed.length : 0)
      ) || 0;
      const lessonCount = Number(match.lessonCount) || 15;
      const percent = typeof match.percent === 'number'
        ? match.percent
        : (lessonCount > 0 ? Math.round((completedCount / lessonCount) * 100) : 0);
      return {
        enrolled: true,
        completedCount,
        lessonCount,
        percent,
        title: match.title,
        eyebrow: match.eyebrow,
      };
    }
  }

  // 2. Check userObj.enrolled_courses (as formatted by /api/community/members)
  if (Array.isArray(userObj.enrolled_courses)) {
    const match = userObj.enrolled_courses.find((c) => c && (c.id === courseId || c.slug === courseId));
    if (match) {
      const completedCount = Number(
        match.completedCount ??
        (Array.isArray(match.completed) ? match.completed.length : 0)
      ) || 0;
      const lessonCount = Number(match.lessonCount) || 15;
      const percent = typeof match.percent === 'number'
        ? match.percent
        : (lessonCount > 0 ? Math.round((completedCount / lessonCount) * 100) : 0);
      return {
        enrolled: true,
        completedCount,
        lessonCount,
        percent,
        title: match.title,
        eyebrow: match.eyebrow,
      };
    }
  }

  return null;
}

// ─── Calculate Leaderboard XP Formula ─────────────────────────────────────────
export function calculateLeaderboardXP({ completedCount = 0, percent = 0, minutesWatched = 0 }) {
  // 1. Completion XP: 10 XP for each completed lesson
  const completionXP = completedCount * LESSON_COMPLETE_BONUS_XP;

  // 2. Milestone bonuses based on completion percentage synced from owner dashboard
  // 100% completion = +50 bonus XP (Masterclass Graduate)
  // >= 50% completion = +25 bonus XP (Halfway Mark)
  // >= 25% completion = +10 bonus XP (Momentum Builder)
  const milestoneBonus = percent === 100 ? 50 : percent >= 50 ? 25 : percent >= 25 ? 10 : 0;

  // 3. Watch Time XP: 2 XP for every 1 minute watched
  const watchXP = minutesWatched * XP_PER_MINUTE;

  const totalXP = completionXP + milestoneBonus + watchXP;
  return {
    totalXP,
    completionXP,
    milestoneBonus,
    watchXP,
  };
}

// ─── Build Course Leaderboard (STRICTLY REAL REGISTERED MEMBERS ONLY) ────────
export function getCourseLeaderboard(
  courseId = 'blueprint',
  currentUser = null,
  liveMembers = [],
  currentUserCourses = []
) {
  const tierInfo = getTierInfo(courseId);
  const list = [];
  const processedUserIds = new Set();

  // Read current authenticated user XP and watch time
  const userXPData = currentUser
    ? getStoredUserXP(currentUser.id || currentUser.email)
    : { totalXP: 0, courseXP: {}, courseSeconds: {} };

  const userCourseSeconds = (userXPData.courseSeconds && userXPData.courseSeconds[courseId]) || 0;
  const userMinutesWatched = Math.floor(userCourseSeconds / 60);

  // 1. Process REAL registered members from the actual database
  if (Array.isArray(liveMembers) && liveMembers.length > 0) {
    liveMembers.forEach((m) => {
      if (!m || !m.id) return;

      const isCurrent =
        currentUser &&
        (m.id === currentUser.id ||
          (currentUser.email && m.email && m.email.toLowerCase() === currentUser.email.toLowerCase()));

      // Extract exact course progress as calculated in owner dashboard
      const progress = extractUserCourseProgress(m, courseId);
      if (!progress && !isCurrent) {
        // Not enrolled in this course
        return;
      }

      processedUserIds.add(m.id);
      if (m.email) processedUserIds.add(m.email.toLowerCase());

      if (isCurrent) {
        // Current user: merge DB completion from owner DB with local watch time
        const completedCount = progress?.completedCount ?? (
          Array.isArray(currentUser.completed) ? currentUser.completed.length : 0
        );
        const lessonCount = progress?.lessonCount ?? 15;
        const percent = progress?.percent ?? (lessonCount > 0 ? Math.round((completedCount / lessonCount) * 100) : 0);

        const xpBreakdown = calculateLeaderboardXP({
          completedCount,
          percent,
          minutesWatched: userMinutesWatched,
        });

        list.push({
          id: m.id,
          name: `${m.name || currentUser.name || 'You'} (You)`,
          handle: m.handle || currentUser.handle || (m.email ? m.email.split('@')[0] : 'you'),
          headline: m.headline || currentUser.headline || 'Active Learner & FAME Founder',
          location: m.location || currentUser.location || '',
          avatar_url: m.avatar_url || m.avatar || currentUser.avatar_url || currentUser.avatar,
          avatarBg: '#125945',
          badge: `${tierInfo.tierName} Pioneer`,
          xp: xpBreakdown.totalXP,
          completionXP: xpBreakdown.completionXP,
          milestoneBonus: xpBreakdown.milestoneBonus,
          watchXP: xpBreakdown.watchXP,
          minutesWatched: userMinutesWatched,
          completedCount,
          lessonCount,
          percent,
          isCurrentUser: true,
        });
      } else {
        // Real registered peer member
        const completedCount = progress.completedCount || 0;
        const lessonCount = progress.lessonCount || 15;
        const percent = progress.percent || (lessonCount > 0 ? Math.round((completedCount / lessonCount) * 100) : 0);

        // Minutes watched estimated from completed masterclass lessons (~12 min per completed module)
        const minutesWatched = m.minutes_watched ?? (completedCount * 12);

        const xpBreakdown = calculateLeaderboardXP({
          completedCount,
          percent,
          minutesWatched,
        });

        list.push({
          id: m.id,
          name: m.name,
          handle: m.handle || (m.email ? m.email.split('@')[0] : `user_${String(m.id).slice(0, 6)}`),
          headline: m.headline || 'Registered FAME Member',
          location: m.location || '',
          avatar_url: m.avatar_url || m.avatar,
          avatarBg: '#1b3b2d',
          badge: `${tierInfo.tierName} Member`,
          xp: xpBreakdown.totalXP,
          completionXP: xpBreakdown.completionXP,
          milestoneBonus: xpBreakdown.milestoneBonus,
          watchXP: xpBreakdown.watchXP,
          minutesWatched,
          completedCount,
          lessonCount,
          percent,
          isCurrentUser: false,
        });
      }
    });
  }

  // 2. If current user is logged in and was not already processed from liveMembers
  if (
    currentUser &&
    !processedUserIds.has(currentUser.id) &&
    !(currentUser.email && processedUserIds.has(currentUser.email.toLowerCase()))
  ) {
    const coursesToSearch = Array.isArray(currentUserCourses) && currentUserCourses.length > 0
      ? currentUserCourses
      : (Array.isArray(currentUser.courses) ? currentUser.courses : []);

    const userCourse = coursesToSearch.find((c) => c && (c.id === courseId || c.slug === courseId));

    const completedCount = Number(
      userCourse?.completedCount ??
      (Array.isArray(userCourse?.completed)
        ? userCourse.completed.length
        : (Array.isArray(currentUser.completed) ? currentUser.completed.length : 0))
    ) || 0;

    const lessonCount = Number(userCourse?.lessonCount) || 15;
    const percent = typeof userCourse?.percent === 'number'
      ? userCourse.percent
      : (lessonCount > 0 ? Math.round((completedCount / lessonCount) * 100) : 0);

    const xpBreakdown = calculateLeaderboardXP({
      completedCount,
      percent,
      minutesWatched: userMinutesWatched,
    });

    const userEntry = {
      id: currentUser.id || 'current_user',
      name: `${currentUser.name || 'You'} (You)`,
      handle: currentUser.handle || (currentUser.email ? currentUser.email.split('@')[0] : 'you'),
      headline: currentUser.headline || 'Active Learner & FAME Founder',
      location: currentUser.location || '',
      avatar_url: currentUser.avatar_url || currentUser.avatar,
      avatarBg: '#125945',
      badge: `${tierInfo.tierName} Pioneer`,
      xp: xpBreakdown.totalXP,
      completionXP: xpBreakdown.completionXP,
      milestoneBonus: xpBreakdown.milestoneBonus,
      watchXP: xpBreakdown.watchXP,
      minutesWatched: userMinutesWatched,
      completedCount,
      lessonCount,
      percent,
      isCurrentUser: true,
    };
    list.push(userEntry);
  }

  // Sort strictly descending by XP, then completion percent, then completed lessons count
  list.sort((a, b) => {
    if (b.xp !== a.xp) return b.xp - a.xp;
    if (b.percent !== a.percent) return b.percent - a.percent;
    if (b.completedCount !== a.completedCount) return b.completedCount - a.completedCount;
    return a.name.localeCompare(b.name);
  });

  // Assign ranks
  const rankedList = list.map((item, index) => ({
    ...item,
    rank: index + 1,
  }));

  const userRankIndex = rankedList.findIndex((item) => item.isCurrentUser);
  const userRank = userRankIndex !== -1 ? userRankIndex + 1 : null;
  const userEntry = userRankIndex !== -1 ? rankedList[userRankIndex] : null;

  return {
    tierInfo,
    leaderboard: rankedList,
    userRank,
    userEntry,
    totalParticipants: rankedList.length,
  };
}
