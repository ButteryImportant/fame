// ─── FAME XP & Gamification Engine ───────────────────────────────────────────
// Rule: 2 XP for every 1 minute (60 seconds) watched (1 XP per 30 seconds).

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

// ─── Seeded Peer Entrepreneurs for Dynamic Leaderboards ──────────────────────
const PEER_ENTREPRENEURS = {
  silver: [
    {
      id: 'p-sil-1',
      name: 'Ramesh Kulkarni',
      handle: 'ramesh_millets',
      headline: 'Founder, Sahyadri Millets & Grain Flour',
      location: 'Pune, Maharashtra',
      baseXP: 380,
      lessonsCompleted: 14,
      totalLessons: 15,
      avatarBg: '#2a5a40',
      badge: 'Silver Champion',
    },
    {
      id: 'p-sil-2',
      name: 'Priya Deshmukh',
      handle: 'priya_sauces',
      headline: 'Crafting Artisanal Farm-to-Jar Dips',
      location: 'Nashik, Maharashtra',
      baseXP: 320,
      lessonsCompleted: 12,
      totalLessons: 15,
      avatarBg: '#1e4838',
      badge: 'Formula Specialist',
    },
    {
      id: 'p-sil-3',
      name: 'Ananya Sharma',
      handle: 'ananya_oils',
      headline: 'Cold-Pressed Wood Churn Mustard & Sesame',
      location: 'Jaipur, Rajasthan',
      baseXP: 260,
      lessonsCompleted: 10,
      totalLessons: 15,
      avatarBg: '#344e41',
      badge: 'Unit Economics Pro',
    },
    {
      id: 'p-sil-4',
      name: 'Vikram Patil',
      handle: 'vikram_spices',
      headline: 'Kolhapur Heritage Spice Blends & Masalas',
      location: 'Kolhapur, Maharashtra',
      baseXP: 210,
      lessonsCompleted: 8,
      totalLessons: 15,
      avatarBg: '#3d5a80',
      badge: 'Launch Planner',
    },
    {
      id: 'p-sil-5',
      name: 'Sunita Rao',
      handle: 'sunita_agro',
      headline: 'Solar Dehydrated Seasonal Fruit Powders',
      location: 'Belgaum, Karnataka',
      baseXP: 170,
      lessonsCompleted: 7,
      totalLessons: 15,
      avatarBg: '#4a4e69',
      badge: 'Pilot Batcher',
    },
    {
      id: 'p-sil-6',
      name: 'Amit Verma',
      handle: 'amit_dairy',
      headline: 'A2 Gir Cow Ghee & Value-Added Paneer',
      location: 'Indore, MP',
      baseXP: 140,
      lessonsCompleted: 5,
      totalLessons: 15,
      avatarBg: '#588157',
      badge: 'Foundation Builder',
    },
  ],
  gold: [
    {
      id: 'p-gld-1',
      name: 'Dr. Sanjay Mehta',
      handle: 'sanjay_nutra',
      headline: 'Botanical Extracts & Functional Immunity Drinks',
      location: 'Ahmedabad, Gujarat',
      baseXP: 720,
      lessonsCompleted: 4,
      totalLessons: 4,
      avatarBg: '#1b4965',
      badge: 'Gold Accelerator Master',
    },
    {
      id: 'p-gld-2',
      name: 'Kavita Nair',
      handle: 'kavita_herbal',
      headline: 'Ayurvedic Herbal Infusions & Tisanes',
      location: 'Kochi, Kerala',
      baseXP: 640,
      lessonsCompleted: 4,
      totalLessons: 4,
      avatarBg: '#2b2d42',
      badge: 'Co-Packer Strategist',
    },
    {
      id: 'p-gld-3',
      name: 'Rajesh Gupta',
      handle: 'rajesh_snacks',
      headline: 'Vacuum Fried Vegetable Chips & Puffs',
      location: 'Surat, Gujarat',
      baseXP: 510,
      lessonsCompleted: 3,
      totalLessons: 4,
      avatarBg: '#3a5a40',
      badge: 'Channel Architect',
    },
    {
      id: 'p-gld-4',
      name: 'Sneha Kulkarni',
      handle: 'sneha_honey',
      headline: 'Raw Forest Honey & Infused Syrups',
      location: 'Nagpur, Maharashtra',
      baseXP: 440,
      lessonsCompleted: 3,
      totalLessons: 4,
      avatarBg: '#457b9d',
      badge: 'Compliance Lead',
    },
    {
      id: 'p-gld-5',
      name: 'Rohan Joshi',
      handle: 'rohan_frozen',
      headline: 'Quick-Freeze Ready-to-Cook Regional Snacks',
      location: 'Bengaluru, Karnataka',
      baseXP: 360,
      lessonsCompleted: 2,
      totalLessons: 4,
      avatarBg: '#606c38',
      badge: 'Operations Setup',
    },
  ],
  diamond: [
    {
      id: 'p-dia-1',
      name: 'Siddharth Malhotra',
      handle: 'siddharth_export',
      headline: 'Managing Director, Deccan Agro Exports Ltd.',
      location: 'Hyderabad, Telangana',
      baseXP: 1420,
      lessonsCompleted: 6,
      totalLessons: 6,
      avatarBg: '#0f172a',
      badge: 'Diamond Titan',
    },
    {
      id: 'p-dia-2',
      name: 'Meenakshi Sundaram',
      handle: 'meenakshi_staples',
      headline: 'Multi-State Grain Processing & Distribution Hub',
      location: 'Madurai, Tamil Nadu',
      baseXP: 1240,
      lessonsCompleted: 6,
      totalLessons: 6,
      avatarBg: '#1e293b',
      badge: 'Commercial Master',
    },
    {
      id: 'p-dia-3',
      name: 'Arvind Singhania',
      handle: 'arvind_institutions',
      headline: 'B2B Institutional Supply & Cloud Kitchen Supplier',
      location: 'New Delhi',
      baseXP: 1050,
      lessonsCompleted: 5,
      totalLessons: 6,
      avatarBg: '#111827',
      badge: 'Scale Operator',
    },
    {
      id: 'p-dia-4',
      name: 'Bhavna Patel',
      handle: 'bhavna_bakery',
      headline: 'Clean-Label Sourdough & Gluten-Free Retail Chain',
      location: 'Vadodara, Gujarat',
      baseXP: 910,
      lessonsCompleted: 5,
      totalLessons: 6,
      avatarBg: '#1f2937',
      badge: 'Distribution Maven',
    },
  ],
};

// ─── Build Course Leaderboard ────────────────────────────────────────────────
export function getCourseLeaderboard(courseId = 'blueprint', currentUser = null, liveMembers = []) {
  const tierInfo = getTierInfo(courseId);
  const tierKey = tierInfo.tier; // 'silver' | 'gold' | 'diamond'
  const peers = PEER_ENTREPRENEURS[tierKey] || PEER_ENTREPRENEURS.silver;

  // Read current user XP
  const userXPData = currentUser ? getStoredUserXP(currentUser.id || currentUser.email) : { totalXP: 0, courseXP: {}, courseSeconds: {} };
  const userCourseXP = (userXPData.courseXP && userXPData.courseXP[courseId]) || 0;
  const userMinutesWatched = Math.floor(((userXPData.courseSeconds && userXPData.courseSeconds[courseId]) || 0) / 60);

  // Map peers
  const list = peers.map((p) => ({
    ...p,
    xp: p.baseXP,
    minutesWatched: Math.round(p.baseXP / 2),
    isCurrentUser: false,
  }));

  // Merge live members from community database if they match this course
  if (Array.isArray(liveMembers) && liveMembers.length > 0) {
    liveMembers.forEach((m, idx) => {
      // Don't duplicate current user
      if (currentUser && (m.id === currentUser.id || m.email === currentUser.email)) return;

      const isEnrolled = m.enrolled_courses?.some((c) => c.id === courseId);
      if (isEnrolled) {
        // Calculate dynamic XP based on hash or index so it's consistent
        const memberXP = 150 + ((idx * 67 + 31) % 400);
        list.push({
          id: m.id,
          name: m.name,
          handle: m.handle || m.email.split('@')[0],
          headline: m.headline || 'Food Entrepreneur · FAME Founder',
          location: m.location || 'India',
          avatar_url: m.avatar_url,
          avatarBg: '#1b3b2d',
          badge: `${tierInfo.tierName} Founder`,
          xp: memberXP,
          minutesWatched: Math.round(memberXP / 2),
          lessonsCompleted: Math.min(15, Math.floor(memberXP / 35)),
          totalLessons: 15,
          isCurrentUser: false,
        });
      }
    });
  }

  // Include current user
  if (currentUser) {
    const userHandle = currentUser.handle || (currentUser.email ? currentUser.email.split('@')[0] : 'you');
    const userCompletedCount = Array.isArray(currentUser.completed) ? currentUser.completed.length : 0;

    const userEntry = {
      id: currentUser.id || 'current_user',
      name: `${currentUser.name || 'You'} (You)`,
      handle: userHandle,
      headline: currentUser.headline || 'Active Learner & FAME Founder',
      location: currentUser.location || 'India',
      avatar_url: currentUser.avatar_url,
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

  // Sort descending by XP
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
