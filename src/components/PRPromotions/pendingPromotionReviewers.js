const STORAGE_KEY = 'hgn.prPromotions.promotedReviewerIds';

const INITIAL_PENDING_PROMOTION_REVIEWERS = [
  {
    id: 'pending-akshay',
    prReviewer: 'Akshay - Jayaram',
    teamCode: '123',
    teamLeaderName: 'Chris Martinez',
    weeklyPRs: [
      { week: 'week-1', prCount: 2 },
      { week: 'week-2', prCount: 10 },
      { week: 'week-3', prCount: 11 },
    ],
  },
  {
    id: 'pending-ghazi',
    prReviewer: 'Ghazi1212',
    teamCode: '456',
    teamLeaderName: 'Sam Patel',
    weeklyPRs: [
      { week: 'week-1', prCount: 2 },
      { week: 'week-2', prCount: 1 },
      { week: 'week-3', prCount: 10 },
      { week: 'week-4', prCount: 11 },
    ],
  },
  {
    id: 'pending-diya',
    prReviewer: 'Diya Test 1',
    teamCode: '789',
    teamLeaderName: 'Jordan Lee',
    weeklyPRs: [
      { week: 'week-1', prCount: 4 },
      { week: 'week-2', prCount: 8 },
      { week: 'week-3', prCount: 12 },
      { week: 'week-4', prCount: 7 },
      { week: 'week-5', prCount: 9 },
    ],
  },
  {
    id: 'pending-ramya',
    prReviewer: 'Ramya Test Volunteer',
    teamCode: '321',
    teamLeaderName: 'Alex Rivera',
    weeklyPRs: [
      { week: 'week-1', prCount: 1 },
      { week: 'week-2', prCount: 3 },
      { week: 'week-3', prCount: 5 },
      { week: 'week-4', prCount: 8 },
      { week: 'week-5', prCount: 10 },
      { week: 'week-6', prCount: 12 },
      { week: 'week-7', prCount: 6 },
    ],
  },
  {
    id: 'pending-yuhang',
    prReviewer: 'Yuhang Xu',
    teamCode: '654',
    teamLeaderName: 'Taylor Brooks',
    weeklyPRs: [
      { week: 'week-1', prCount: 9 },
      { week: 'week-2', prCount: 11 },
    ],
  },
];

function cloneReviewers(reviewers) {
  return reviewers.map(reviewer => ({
    ...reviewer,
    weeklyPRs: reviewer.weeklyPRs.map(week => ({ ...week })),
  }));
}

function readPromotedIds() {
  if (typeof localStorage === 'undefined') {
    return [];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(id => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function writePromotedIds(ids) {
  if (typeof localStorage === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...new Set(ids)]));
  } catch {
    // Ignore storage quota / private-mode failures; the in-session list still updates.
  }
}

export function getPendingPromotionReviewers() {
  const promotedIds = new Set(readPromotedIds());
  return cloneReviewers(INITIAL_PENDING_PROMOTION_REVIEWERS).filter(
    reviewer => !promotedIds.has(reviewer.id),
  );
}

export function setPendingPromotionReviewers(reviewers) {
  const remainingIds = new Set((reviewers || []).map(reviewer => reviewer.id));
  const promotedIds = INITIAL_PENDING_PROMOTION_REVIEWERS.filter(
    reviewer => !remainingIds.has(reviewer.id),
  ).map(reviewer => reviewer.id);
  writePromotedIds(promotedIds);
}

export function resetPendingPromotionReviewers() {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage access errors in tests or private mode.
    }
  }
}
