export const strengthsGapsData = [
  { subject: 'Arts/Trades', performance: 95, status: 'excellent', color: '#10b981' },
  { subject: 'English', performance: 90, status: 'excellent', color: '#10b981' },
  { subject: 'Health', performance: 48, status: 'needs-improvement', color: '#f59e0b' },
  { subject: 'Mathematics', performance: 67, status: 'good', color: '#fbbf24' },
  { subject: 'Science', performance: 83, status: 'good', color: '#f59e0b' },
  { subject: 'Social Studies', performance: 84, status: 'excellent', color: '#10b981' },
  { subject: 'Tech & Innovation', performance: 35, status: 'needs-improvement', color: '#ef4444' },
  { subject: 'Values', performance: 72, status: 'good', color: '#10b981' },
];

export const performanceTrendData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Arts/Trades',
      data: [95, 94, 95, 96, 95, 95],
      borderColor: '#10b981',
      backgroundColor: 'transparent',
    },
    {
      label: 'English',
      data: [88, 89, 90, 91, 90, 90],
      borderColor: '#3b82f6',
      backgroundColor: 'transparent',
    },
    {
      label: 'Health',
      data: [45, 46, 47, 48, 48, 48],
      borderColor: '#f59e0b',
      backgroundColor: 'transparent',
    },
    {
      label: 'Mathematics',
      data: [65, 66, 67, 68, 67, 67],
      borderColor: '#fbbf24',
      backgroundColor: 'transparent',
    },
    {
      label: 'Science',
      data: [80, 81, 82, 83, 83, 83],
      borderColor: '#06b6d4',
      backgroundColor: 'transparent',
    },
    {
      label: 'Social Studies',
      data: [82, 83, 84, 85, 84, 84],
      borderColor: '#8b5cf6',
      backgroundColor: 'transparent',
    },
    {
      label: 'Tech & Innovation',
      data: [32, 33, 34, 35, 35, 35],
      borderColor: '#ef4444',
      backgroundColor: 'transparent',
    },
    {
      label: 'Values',
      data: [70, 71, 72, 73, 72, 72],
      borderColor: '#10b981',
      backgroundColor: 'transparent',
    },
  ],
};

export const teachingStrategiesData = {
  labels: [
    'Game Genius',
    'Power Play',
    'Body Smart Exploration',
    'Crazy Creative Combo Competition',
    'Existential Smart Exploration',
    'Curious Dropout',
  ],
  datasets: [
    {
      label: 'Effectiveness',
      data: [92, 88, 85, 82, 78, 65],
      backgroundColor: ['#10b981', '#10b981', '#10b981', '#3b82f6', '#3b82f6', '#ef4444'],
    },
  ],
};

export const lifeStrategiesData = {
  labels: [
    'Everything you do should increase choices',
    'Ask "what would Jesus do?"',
    'Choose to trust with observation',
    'Practice improving your emotional intelligence',
  ],
  datasets: [
    {
      label: 'Impact',
      data: [92, 85, 82, 76],
      backgroundColor: ['#10b981', '#10b981', '#fbbf24', '#fbbf24'],
    },
  ],
};

export const subjects = [
  { name: 'All Subjects', color: '#6b7280' },
  { name: 'Arts/Trades', color: '#ff8c00' },
  { name: 'English', color: '#9c27b0' },
  { name: 'Health', color: '#4caf50' },
  { name: 'Mathematics', color: '#2196f3' },
  { name: 'Science', color: '#009688' },
  { name: 'Social Studies', color: '#ff9800' },
  { name: 'Tech & Innovation', color: '#607d8b' },
  { name: 'Values', color: '#f44336' },
];

export const filterSubjects = [
  { value: 'all', label: 'All Subjects' },
  { value: 'mathematics', label: 'Mathematics' },
  { value: 'science', label: 'Science' },
  { value: 'english', label: 'English' },
  { value: 'history', label: 'History' },
  { value: 'art', label: 'Art' },
  { value: 'health', label: 'Health' },
  { value: 'social-studies', label: 'Social Studies' },
  { value: 'tech-innovation', label: 'Tech & Innovation' },
  { value: 'values', label: 'Values' },
];

export const students = [
  { id: '1', name: 'Alex Johnson' },
  { id: '2', name: 'Sarah Williams' },
  { id: '3', name: 'Michael Brown' },
  { id: '4', name: 'Emily Davis' },
];

export const classes = [
  { id: '1', name: 'Grade 5A - Mathematics' },
  { id: '2', name: 'Grade 6B - Science' },
  { id: '3', name: 'Grade 4C - English' },
];

export const dateRanges = [
  { value: 'lastWeek', label: 'Last Week' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'lastQuarter', label: 'Last Quarter' },
  { value: 'lastSemester', label: 'Last Semester' },
  { value: 'lastYear', label: 'Last Year' },
  { value: 'custom', label: 'Custom Range' },
];

export const sidebarMenuItems = [
  {
    icon: '🏠',
    label: 'Homepage',
    path: '',
    isActive: false,
  },
  {
    icon: '📊',
    label: 'Knowledge Evaluation',
    path: '',
    isActive: false,
  },
  {
    icon: '📋',
    label: 'Past Lesson Plans',
    path: '/educator/reports',
    isActive: false,
  },
  {
    icon: '⭐',
    label: 'My Saved Interests',
    path: '/saved-interests',
    isActive: false,
  },
  {
    icon: '📈',
    label: 'Evaluation results',
    path: '/evaluation-results',
    isActive: false,
  },
  {
    icon: '🏗️',
    label: 'Build Lesson Plan',
    path: '/build-lesson-plan',
    isActive: false,
  },
];

export const sidebarBottomMenuItems = [
  {
    icon: '⚙️',
    label: 'Settings',
    path: '/settings',
  },
  {
    icon: '🚪',
    label: 'Log out',
    path: '/logout',
    isLogout: true,
  },
];
