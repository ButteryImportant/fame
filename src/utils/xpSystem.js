// ─── FAME XP & Gamification Engine ───────────────────────────────────────────
// Rule: 2 XP for every 1 minute (60 seconds) watched (1 XP per 30 seconds).
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
    gainedXP: LESSON_COMPLETE_BONUS_XP,
    totalXP: data.totalXP,
    courseXP: data.courseXP[courseId] || 0,
  };
}

// ─── Build Course Leaderboard (STRICTLY REAL REGISTERED MEMBERS ONLY) ────────
export function getCourseLeaderboard(courseId = 'blueprint', currentUser = null, liveMembers = []) {
  const tierInfo = getTierInfo(courseId);
  const list = [];

  // Read current authenticated user XP
  const userXPData = currentUser
    ? getStoredUserXP(currentUser.id || currentUser.email)
    : { totalXP: 0, courseXP: {}, courseSeconds: {} };
  const userCourseXP = (userXPData.courseXP && userXPData.courseXP[courseId]) || 0;
  const userMinutesWatched = Math.floor(
    ((userXPData.courseSeconds && userXPData.courseSeconds[courseId]) || 0) / 60
  );

  // 1. Process REAL registered members from the actual database
  if (Array.isArray(liveMembers) && liveMembers.length > 0) {
    liveMembers.forEach((m) => {
      // Don't duplicate current user
      if (
        currentUser &&
        (m.id === currentUser.id ||
          (currentUser.email && m.email && m.email.toLowerCase() === currentUser.email.toLowerCase()))
      ) {
        return;
      }

      // Check if this real member is enrolled in the selected course
      const isEnrolled =
        m.enrolled_courses?.some((c) => c.id === courseId) ||
        (m.role === 'admin' && false); // admins aren't learners unless enrolled

      if (isEnrolled) {
        // Real user's completed lessons count
        const completedCount = m.completed_count || (m.completed ? m.completed.length : 0);
        // Base XP from real completed lessons (+10 XP per completed lesson)
        const memberXP = completedCount * LESSON_COMPLETE_BONUS_XP;

        list.push({
          id: m.id,
          name: m.name,
          handle: m.handle || (m.email ? m.email.split('@')[0] : `user_${m.id}`),
          headline: m.headline || 'Registered FAME Member',
          location: m.location || '',
          avatar_url: m.avatar_url || m.avatar,
          avatarBg: '#1b3b2d',
          badge: `${tierInfo.tierName} Member`,
          xp: memberXP,
          minutesWatched: Math.round(memberXP / 2),
          lessonsCompleted: completedCount,
          totalLessons: 15,
          isCurrentUser: false,
        });
      }
    });
  }

  // 2. Include the current user if logged in
  if (currentUser) {
    const userHandle =
      currentUser.handle || (currentUser.email ? currentUser.email.split('@')[0] : 'you');
    const userCompletedCount = Array.isArray(currentUser.completed) ? currentUser.completed.length : 0;

    const userEntry = {
      id: currentUser.id || 'current_user',
      name: `${currentUser.name || 'You'} (You)`,
      handle: userHandle,
      headline: currentUser.headline || 'Active Learner & FAME Founder',
      location: currentUser.location || '',
      avatar_url: currentUser.avatar_url || currentUser.avatar,
      avatarBg: '#125945',
      badge: `${tierInfo.tierName} Pioneer`,
      xp: userCourseXP,
      minutesWatched: userMinutesWatched,
      lessonsCompleted: userCompletedCount,
      totalLessons: 15,
      isCurrentUser: true,
    };
    list.push(userEntry);
  }

  // Sort strictly descending by XP
  list.sort((a, b) => b.xp - a.xp || b.lessonsCompleted - a.lessonsCompleted);

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
