export const sampleData = [
  // Recent applications (last 7 days) with realistic timing data
  { role: 'Software Developer', timeToApply: 8, timestamp: '2025-05-29T10:20:00Z' },
  { role: 'Software Developer', timeToApply: 12, timestamp: '2025-05-29T14:30:00Z' },
  { role: 'Software Developer', timeToApply: 9, timestamp: '2025-05-28T16:45:00Z' },
  { role: 'Architect', timeToApply: 15, timestamp: '2025-05-28T09:15:00Z' },
  { role: 'Architect', timeToApply: 18, timestamp: '2025-05-27T11:20:00Z' },
  { role: 'Master Electrician', timeToApply: 25, timestamp: '2025-05-27T08:00:00Z' },
  { role: 'Master Electrician', timeToApply: 22, timestamp: '2025-05-26T15:30:00Z' },
  { role: 'Product Manager', timeToApply: 6, timestamp: '2025-05-26T10:00:00Z' },
  { role: 'Product Manager', timeToApply: 9, timestamp: '2025-05-25T11:30:00Z' },
  { role: 'Data Scientist', timeToApply: 13, timestamp: '2025-05-25T14:45:00Z' },
  { role: 'Data Scientist', timeToApply: 11, timestamp: '2025-05-24T16:20:00Z' },
  { role: 'UX Designer', timeToApply: 14, timestamp: '2025-05-24T12:30:00Z' },
  { role: 'UX Designer', timeToApply: 16, timestamp: '2025-05-23T10:15:00Z' },

  // Monthly data (last 30 days)
  { role: 'Project Manager', timeToApply: 7, timestamp: '2025-05-15T09:30:00Z' },
  { role: 'Project Manager', timeToApply: 11, timestamp: '2025-05-12T14:20:00Z' },
  { role: 'Plumber', timeToApply: 20, timestamp: '2025-05-10T08:15:00Z' },
  { role: 'Plumber', timeToApply: 24, timestamp: '2025-05-08T13:45:00Z' },
  { role: 'Software Developer', timeToApply: 10, timestamp: '2025-05-05T16:30:00Z' },
  { role: 'Architect', timeToApply: 16, timestamp: '2025-05-03T11:20:00Z' },
  { role: 'Master Electrician', timeToApply: 28, timestamp: '2025-05-01T07:45:00Z' },
  { role: 'Data Scientist', timeToApply: 15, timestamp: '2025-04-28T12:00:00Z' },

  // Older data (yearly)
  { role: 'UX Designer', timeToApply: 12, timestamp: '2024-12-15T14:20:00Z' },
  { role: 'Product Manager', timeToApply: 8, timestamp: '2024-11-20T11:45:00Z' },
  { role: 'Plumber', timeToApply: 26, timestamp: '2024-10-10T09:15:00Z' },
  { role: 'Software Developer', timeToApply: 7, timestamp: '2024-09-05T16:30:00Z' },
  { role: 'Architect', timeToApply: 14, timestamp: '2024-08-12T08:45:00Z' },
  { role: 'Master Electrician', timeToApply: 24, timestamp: '2024-07-18T13:20:00Z' },

  // Outliers (these will be filtered out as they're > 30 minutes)
  { role: 'Software Developer', timeToApply: 45, timestamp: '2025-05-20T10:00:00Z' }, // Tab left open
  { role: 'Product Manager', timeToApply: 120, timestamp: '2025-05-18T14:30:00Z' }, // 2 hours - clearly an outlier
  { role: 'UX Designer', timeToApply: 90, timestamp: '2025-05-16T12:15:00Z' }, // 1.5 hours - outlier
];