// Helper function to generate dates relative to now
const generateTimestamp = (daysAgo, hoursAgo = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(date.getHours() - hoursAgo);
  return date.toISOString();
};

const sampleData = [
  // Recent applications (last 7 days) - Always fresh dates
  { role: 'Software Developer', timeToApply: 8, timestamp: generateTimestamp(0, 2) }, // 2 hours ago
  { role: 'Software Developer', timeToApply: 12, timestamp: generateTimestamp(1, 1) }, // 1 day, 1 hour ago
  { role: 'Software Developer', timeToApply: 9, timestamp: generateTimestamp(2, 3) }, // 2 days, 3 hours ago
  { role: 'Architect', timeToApply: 15, timestamp: generateTimestamp(1, 5) }, // 1 day, 5 hours ago
  { role: 'Architect', timeToApply: 18, timestamp: generateTimestamp(3, 2) }, // 3 days, 2 hours ago
  { role: 'Master Electrician', timeToApply: 25, timestamp: generateTimestamp(2, 8) }, // 2 days, 8 hours ago
  { role: 'Master Electrician', timeToApply: 22, timestamp: generateTimestamp(4, 1) }, // 4 days, 1 hour ago
  { role: 'Product Manager', timeToApply: 6, timestamp: generateTimestamp(3, 4) }, // 3 days, 4 hours ago
  { role: 'Product Manager', timeToApply: 9, timestamp: generateTimestamp(5, 2) }, // 5 days, 2 hours ago
  { role: 'Data Scientist', timeToApply: 13, timestamp: generateTimestamp(4, 6) }, // 4 days, 6 hours ago
  { role: 'Data Scientist', timeToApply: 11, timestamp: generateTimestamp(6, 3) }, // 6 days, 3 hours ago
  { role: 'UX Designer', timeToApply: 14, timestamp: generateTimestamp(5, 7) }, // 5 days, 7 hours ago
  { role: 'UX Designer', timeToApply: 16, timestamp: generateTimestamp(6, 4) }, // 6 days, 4 hours ago

  // Monthly data (8-30 days ago)
  { role: 'Project Manager', timeToApply: 7, timestamp: generateTimestamp(8) }, // 8 days ago
  { role: 'Project Manager', timeToApply: 11, timestamp: generateTimestamp(11) }, // 11 days ago
  { role: 'Plumber', timeToApply: 20, timestamp: generateTimestamp(12) }, // 12 days ago
  { role: 'Plumber', timeToApply: 24, timestamp: generateTimestamp(16) }, // 16 days ago
  { role: 'Software Developer', timeToApply: 10, timestamp: generateTimestamp(18) }, // 18 days ago
  { role: 'Architect', timeToApply: 16, timestamp: generateTimestamp(21) }, // 21 days ago
  { role: 'Master Electrician', timeToApply: 28, timestamp: generateTimestamp(24) }, // 24 days ago
  { role: 'Data Scientist', timeToApply: 15, timestamp: generateTimestamp(26) }, // 26 days ago
  { role: 'UX Designer', timeToApply: 12, timestamp: generateTimestamp(28) }, // 28 days ago
  { role: 'Product Manager', timeToApply: 8, timestamp: generateTimestamp(30) }, // 30 days ago

  // Older data (31-365 days ago)
  { role: 'UX Designer', timeToApply: 12, timestamp: generateTimestamp(50) }, // ~50 days ago
  { role: 'Product Manager', timeToApply: 8, timestamp: generateTimestamp(75) }, // ~75 days ago
  { role: 'Plumber', timeToApply: 26, timestamp: generateTimestamp(115) }, // ~115 days ago
  { role: 'Software Developer', timeToApply: 7, timestamp: generateTimestamp(180) }, // ~180 days ago
  { role: 'Architect', timeToApply: 14, timestamp: generateTimestamp(205) }, // ~205 days ago
  { role: 'Master Electrician', timeToApply: 24, timestamp: generateTimestamp(230) }, // ~230 days ago
  { role: 'Data Scientist', timeToApply: 16, timestamp: generateTimestamp(255) }, // ~255 days ago
  { role: 'Project Manager', timeToApply: 9, timestamp: generateTimestamp(295) }, // ~295 days ago

  // Outliers (these will be filtered out as they're > 30 minutes)
  { role: 'Software Developer', timeToApply: 45, timestamp: generateTimestamp(3) }, // Tab left open
  { role: 'Product Manager', timeToApply: 120, timestamp: generateTimestamp(8) }, // 2 hours - outlier
  { role: 'UX Designer', timeToApply: 90, timestamp: generateTimestamp(11) }, // 1.5 hours - outlier
];

export default sampleData;
