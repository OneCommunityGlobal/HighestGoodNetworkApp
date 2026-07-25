// TODO: Replace mock data with real API call from the backend
// Mock data with dates for duration filtering simulation
// Recent PRs have fewer reviews, older PRs have accumulated more reviews over time
const PRData = [
  // Last week (Jan 23-29) - Recent PRs with lower review counts (5-18)
  {
    prNumber: 'PR 146',
    reviewCount: 12,
    title: 'Add new component',
    createdDate: new Date(2026, 0, 28),
  },
  {
    prNumber: 'PR 149',
    reviewCount: 9,
    title: 'Update documentation',
    createdDate: new Date(2026, 0, 29),
  },
  {
    prNumber: 'PR 128',
    reviewCount: 11,
    title: 'Add new component',
    createdDate: new Date(2026, 0, 27),
  },
  {
    prNumber: 'PR 110',
    reviewCount: 14,
    title: 'Add new component',
    createdDate: new Date(2026, 0, 27),
  },
  {
    prNumber: 'PR 106',
    reviewCount: 16,
    title: 'Fix styling issue',
    createdDate: new Date(2026, 0, 28),
  },
  {
    prNumber: 'PR 108',
    reviewCount: 18,
    title: 'Optimize performance',
    createdDate: new Date(2026, 0, 26),
  },
  {
    prNumber: 'PR 138',
    reviewCount: 15,
    title: 'Optimize performance',
    createdDate: new Date(2026, 0, 26),
  },
  {
    prNumber: 'PR 131',
    reviewCount: 13,
    title: 'Update documentation',
    createdDate: new Date(2026, 0, 25),
  },
  {
    prNumber: 'PR 104',
    reviewCount: 17,
    title: 'Improve error handling',
    createdDate: new Date(2026, 0, 25),
  },
  {
    prNumber: 'PR 113',
    reviewCount: 10,
    title: 'Update documentation',
    createdDate: new Date(2026, 0, 24),
  },
  {
    prNumber: 'PR 122',
    reviewCount: 8,
    title: 'Add new component',
    createdDate: new Date(2026, 0, 24),
  },
  {
    prNumber: 'PR 134',
    reviewCount: 7,
    title: 'Add new component',
    createdDate: new Date(2026, 0, 23),
  },
  {
    prNumber: 'PR 117',
    reviewCount: 6,
    title: 'Add new feature',
    createdDate: new Date(2026, 0, 23),
  },

  // Week 2-3 ago (Jan 15-22) - Medium review counts (18-32)
  {
    prNumber: 'PR 126',
    reviewCount: 28,
    title: 'Optimize performance',
    createdDate: new Date(2026, 0, 21),
  },
  {
    prNumber: 'PR 120',
    reviewCount: 32,
    title: 'Optimize performance',
    createdDate: new Date(2026, 0, 22),
  },
  {
    prNumber: 'PR 140',
    reviewCount: 30,
    title: 'Add new component',
    createdDate: new Date(2026, 0, 20),
  },
  {
    prNumber: 'PR 147',
    reviewCount: 25,
    title: 'Add new feature',
    createdDate: new Date(2026, 0, 19),
  },
  {
    prNumber: 'PR 144',
    reviewCount: 27,
    title: 'Optimize performance',
    createdDate: new Date(2026, 0, 18),
  },
  {
    prNumber: 'PR 136',
    reviewCount: 24,
    title: 'Fix styling issue',
    createdDate: new Date(2026, 0, 17),
  },
  {
    prNumber: 'PR 124',
    reviewCount: 29,
    title: 'Fix styling issue',
    createdDate: new Date(2026, 0, 16),
  },
  {
    prNumber: 'PR 115',
    reviewCount: 26,
    title: 'Refactor code',
    createdDate: new Date(2026, 0, 15),
  },

  // Week 3-4 ago (Jan 8-14) - Higher review counts (30-42)
  {
    prNumber: 'PR 130',
    reviewCount: 35,
    title: 'Fix styling issue',
    createdDate: new Date(2026, 0, 14),
  },
  {
    prNumber: 'PR 139',
    reviewCount: 38,
    title: 'Refactor code',
    createdDate: new Date(2026, 0, 13),
  },
  {
    prNumber: 'PR 118',
    reviewCount: 40,
    title: 'Fix styling issue',
    createdDate: new Date(2026, 0, 12),
  },
  {
    prNumber: 'PR 135',
    reviewCount: 36,
    title: 'Add new feature',
    createdDate: new Date(2026, 0, 11),
  },
  {
    prNumber: 'PR 143',
    reviewCount: 37,
    title: 'Update documentation',
    createdDate: new Date(2026, 0, 11),
  },
  {
    prNumber: 'PR 109',
    reviewCount: 34,
    title: 'Refactor code',
    createdDate: new Date(2026, 0, 10),
  },
  {
    prNumber: 'PR 132',
    reviewCount: 33,
    title: 'Optimize performance',
    createdDate: new Date(2026, 0, 9),
  },
  {
    prNumber: 'PR 148',
    reviewCount: 39,
    title: 'Fix styling issue',
    createdDate: new Date(2026, 0, 9),
  },
  {
    prNumber: 'PR 112',
    reviewCount: 42,
    title: 'Fix styling issue',
    createdDate: new Date(2026, 0, 8),
  },
  {
    prNumber: 'PR 123',
    reviewCount: 31,
    title: 'Add new feature',
    createdDate: new Date(2026, 0, 7),
  },

  // Older than 4 weeks (Dec-Early Jan) - Highest review counts (40-55)
  {
    prNumber: 'PR 129',
    reviewCount: 41,
    title: 'Add new feature',
    createdDate: new Date(2026, 0, 6),
  },
  {
    prNumber: 'PR 105',
    reviewCount: 43,
    title: 'Add new feature',
    createdDate: new Date(2026, 0, 5),
  },
  {
    prNumber: 'PR 141',
    reviewCount: 45,
    title: 'Add new feature',
    createdDate: new Date(2026, 0, 4),
  },
  {
    prNumber: 'PR 102',
    reviewCount: 44,
    title: 'Add dashboard',
    createdDate: new Date(2026, 0, 3),
  },
  {
    prNumber: 'PR 150',
    reviewCount: 46,
    title: 'Optimize performance',
    createdDate: new Date(2026, 0, 2),
  },
  {
    prNumber: 'PR 101',
    reviewCount: 48,
    title: 'Fix login bug',
    createdDate: new Date(2026, 0, 1),
  },
  {
    prNumber: 'PR 114',
    reviewCount: 47,
    title: 'Optimize performance',
    createdDate: new Date(2025, 11, 25),
  },
  {
    prNumber: 'PR 142',
    reviewCount: 49,
    title: 'Fix styling issue',
    createdDate: new Date(2025, 11, 22),
  },
  {
    prNumber: 'PR 103',
    reviewCount: 52,
    title: 'Refactor API',
    createdDate: new Date(2025, 11, 20),
  },
  {
    prNumber: 'PR 121',
    reviewCount: 50,
    title: 'Refactor code',
    createdDate: new Date(2025, 11, 18),
  },
  {
    prNumber: 'PR 107',
    reviewCount: 51,
    title: 'Update documentation',
    createdDate: new Date(2025, 11, 15),
  },
  {
    prNumber: 'PR 125',
    reviewCount: 53,
    title: 'Update documentation',
    createdDate: new Date(2025, 11, 12),
  },
  {
    prNumber: 'PR 111',
    reviewCount: 54,
    title: 'Add new feature',
    createdDate: new Date(2025, 11, 10),
  },
  {
    prNumber: 'PR 145',
    reviewCount: 55,
    title: 'Refactor code',
    createdDate: new Date(2025, 11, 8),
  },
  {
    prNumber: 'PR 116',
    reviewCount: 52,
    title: 'Add new component',
    createdDate: new Date(2025, 11, 5),
  },
  {
    prNumber: 'PR 137',
    reviewCount: 50,
    title: 'Update documentation',
    createdDate: new Date(2025, 11, 1),
  },
  {
    prNumber: 'PR 127',
    reviewCount: 48,
    title: 'Refactor code',
    createdDate: new Date(2025, 10, 28),
  },
  {
    prNumber: 'PR 119',
    reviewCount: 47,
    title: 'Update documentation',
    createdDate: new Date(2025, 10, 20),
  },
  {
    prNumber: 'PR 133',
    reviewCount: 46,
    title: 'Refactor code',
    createdDate: new Date(2025, 10, 15),
  },
];

export default PRData;
