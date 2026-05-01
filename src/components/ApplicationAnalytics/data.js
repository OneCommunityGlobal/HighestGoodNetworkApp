// Helper function to generate dates relative to now
const generateTimestamp = (daysAgo, hoursAgo = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(date.getHours() - hoursAgo);
  return date.toISOString();
};

const jobAnalyticsData = [
  // Recent applications (last 7 days) - Only 4 roles

  // Civil Engineer (least popular - 5 applications)
  { role: 'Civil Engineer', timestamp: generateTimestamp(1, 2) },
  { role: 'Civil Engineer', timestamp: generateTimestamp(3, 4) },
  { role: 'Civil Engineer', timestamp: generateTimestamp(5, 1) },
  { role: 'Civil Engineer', timestamp: generateTimestamp(6, 3) },
  { role: 'Civil Engineer', timestamp: generateTimestamp(6, 8) },

  // Legal Team (9 applications)
  { role: 'Legal Team', timestamp: generateTimestamp(0, 3) },
  { role: 'Legal Team', timestamp: generateTimestamp(1, 5) },
  { role: 'Legal Team', timestamp: generateTimestamp(2, 2) },
  { role: 'Legal Team', timestamp: generateTimestamp(3, 7) },
  { role: 'Legal Team', timestamp: generateTimestamp(4, 1) },
  { role: 'Legal Team', timestamp: generateTimestamp(5, 4) },
  { role: 'Legal Team', timestamp: generateTimestamp(6, 2) },
  { role: 'Legal Team', timestamp: generateTimestamp(6, 9) },
  { role: 'Legal Team', timestamp: generateTimestamp(6, 11) },

  // Admin Assistant (15 applications) - shortened from "Administrative Assistant"
  { role: 'Admin Assistant', timestamp: generateTimestamp(0, 1) },
  { role: 'Admin Assistant', timestamp: generateTimestamp(0, 4) },
  { role: 'Admin Assistant', timestamp: generateTimestamp(1, 1) },
  { role: 'Admin Assistant', timestamp: generateTimestamp(1, 6) },
  { role: 'Admin Assistant', timestamp: generateTimestamp(2, 3) },
  { role: 'Admin Assistant', timestamp: generateTimestamp(2, 8) },
  { role: 'Admin Assistant', timestamp: generateTimestamp(3, 2) },
  { role: 'Admin Assistant', timestamp: generateTimestamp(3, 9) },
  { role: 'Admin Assistant', timestamp: generateTimestamp(4, 4) },
  { role: 'Admin Assistant', timestamp: generateTimestamp(4, 7) },
  { role: 'Admin Assistant', timestamp: generateTimestamp(5, 2) },
  { role: 'Admin Assistant', timestamp: generateTimestamp(5, 8) },
  { role: 'Admin Assistant', timestamp: generateTimestamp(6, 1) },
  { role: 'Admin Assistant', timestamp: generateTimestamp(6, 5) },
  { role: 'Admin Assistant', timestamp: generateTimestamp(6, 10) },

  // Software Engineer (most popular - 20 applications)
  { role: 'Software Engineer', timestamp: generateTimestamp(0, 2) },
  { role: 'Software Engineer', timestamp: generateTimestamp(0, 5) },
  { role: 'Software Engineer', timestamp: generateTimestamp(0, 8) },
  { role: 'Software Engineer', timestamp: generateTimestamp(1, 3) },
  { role: 'Software Engineer', timestamp: generateTimestamp(1, 7) },
  { role: 'Software Engineer', timestamp: generateTimestamp(1, 10) },
  { role: 'Software Engineer', timestamp: generateTimestamp(2, 1) },
  { role: 'Software Engineer', timestamp: generateTimestamp(2, 5) },
  { role: 'Software Engineer', timestamp: generateTimestamp(2, 9) },
  { role: 'Software Engineer', timestamp: generateTimestamp(3, 3) },
  { role: 'Software Engineer', timestamp: generateTimestamp(3, 6) },
  { role: 'Software Engineer', timestamp: generateTimestamp(4, 2) },
  { role: 'Software Engineer', timestamp: generateTimestamp(4, 8) },
  { role: 'Software Engineer', timestamp: generateTimestamp(5, 3) },
  { role: 'Software Engineer', timestamp: generateTimestamp(5, 9) },
  { role: 'Software Engineer', timestamp: generateTimestamp(6, 4) },
  { role: 'Software Engineer', timestamp: generateTimestamp(6, 7) },
  { role: 'Software Engineer', timestamp: generateTimestamp(6, 12) },
  { role: 'Software Engineer', timestamp: generateTimestamp(6, 15) },
  { role: 'Software Engineer', timestamp: generateTimestamp(6, 18) },

  // Monthly data (8-30 days ago) - Only these 4 roles
  { role: 'Civil Engineer', timestamp: generateTimestamp(10) },
  { role: 'Civil Engineer', timestamp: generateTimestamp(15) },
  { role: 'Civil Engineer', timestamp: generateTimestamp(22) },

  { role: 'Legal Team', timestamp: generateTimestamp(8) },
  { role: 'Legal Team', timestamp: generateTimestamp(12) },
  { role: 'Legal Team', timestamp: generateTimestamp(18) },
  { role: 'Legal Team', timestamp: generateTimestamp(25) },
  { role: 'Legal Team', timestamp: generateTimestamp(28) },

  { role: 'Admin Assistant', timestamp: generateTimestamp(9) },
  { role: 'Admin Assistant', timestamp: generateTimestamp(14) },
  { role: 'Admin Assistant', timestamp: generateTimestamp(19) },
  { role: 'Admin Assistant', timestamp: generateTimestamp(23) },
  { role: 'Admin Assistant', timestamp: generateTimestamp(27) },
  { role: 'Admin Assistant', timestamp: generateTimestamp(30) },

  { role: 'Software Engineer', timestamp: generateTimestamp(8) },
  { role: 'Software Engineer', timestamp: generateTimestamp(11) },
  { role: 'Software Engineer', timestamp: generateTimestamp(16) },
  { role: 'Software Engineer', timestamp: generateTimestamp(20) },
  { role: 'Software Engineer', timestamp: generateTimestamp(24) },
  { role: 'Software Engineer', timestamp: generateTimestamp(29) },

  // Older data (31-365 days ago) - Only these 4 roles
  { role: 'Civil Engineer', timestamp: generateTimestamp(45) },
  { role: 'Civil Engineer', timestamp: generateTimestamp(90) },
  { role: 'Legal Team', timestamp: generateTimestamp(60) },
  { role: 'Legal Team', timestamp: generateTimestamp(120) },
  { role: 'Admin Assistant', timestamp: generateTimestamp(75) },
  { role: 'Admin Assistant', timestamp: generateTimestamp(150) },
  { role: 'Software Engineer', timestamp: generateTimestamp(100) },
  { role: 'Software Engineer', timestamp: generateTimestamp(200) },
];

export default jobAnalyticsData;
