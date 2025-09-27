// ============================================================================
// MOCK EVALUATION DATA - Realistic Academic Performance Data
// ============================================================================

export const mockEvaluationData = {
  student: {
    id: 'STU-2024-001',
    name: 'Alex Johnson',
    email: 'alex.johnson@school.edu',
    class: 'Computer Science - Year 3',
    semester: 'Fall 2024',
    lastUpdated: '2024-09-25T10:30:00Z',
    profileImage: '/api/placeholder/60/60',
  },

  // Overall performance score (calculated from all categories)
  overallScore: 87.3,

  // Performance categories with detailed breakdown
  categories: [
    {
      id: 'assignments',
      name: 'Assignments',
      weightage: 40,
      totalItems: 12,
      completedItems: 11,
      totalMarks: 1200,
      earnedMarks: 1050,
      percentage: 87.5,
      performanceLevel: 'excellent', // excellent, good, fair, poor
      color: '#10b981',
      icon: 'faClipboardCheck',
      description: 'Programming assignments, essays, and individual homework tasks',
      dueDate: '2024-10-15',
      submissions: {
        onTime: 9,
        late: 2,
        missing: 1,
      },
    },
    {
      id: 'quizzes',
      name: 'Quizzes',
      weightage: 25,
      totalItems: 8,
      completedItems: 8,
      totalMarks: 800,
      earnedMarks: 720,
      percentage: 90.0,
      performanceLevel: 'excellent',
      color: '#3b82f6',
      icon: 'faQuestion',
      description: 'Short weekly quizzes and knowledge check assessments',
      dueDate: '2024-09-30',
      submissions: {
        onTime: 7,
        late: 1,
        missing: 0,
      },
    },
    {
      id: 'exams',
      name: 'Exams',
      weightage: 25,
      totalItems: 3,
      completedItems: 2,
      totalMarks: 300,
      earnedMarks: 245,
      percentage: 81.7,
      performanceLevel: 'good',
      color: '#f59e0b',
      icon: 'faGraduationCap',
      description: 'Comprehensive midterm and final examinations',
      dueDate: '2024-12-10',
      submissions: {
        onTime: 2,
        late: 0,
        missing: 1,
      },
    },
    {
      id: 'projects',
      name: 'Projects',
      weightage: 10,
      totalItems: 2,
      completedItems: 2,
      totalMarks: 200,
      earnedMarks: 185,
      percentage: 92.5,
      performanceLevel: 'excellent',
      color: '#8b5cf6',
      icon: 'faProjectDiagram',
      description: 'Collaborative group projects and individual capstone work',
      dueDate: '2024-11-20',
      submissions: {
        onTime: 1,
        late: 1,
        missing: 0,
      },
    },
  ],

  // Detailed task/assignment list
  tasks: [
    // Assignments
    {
      id: 'task-001',
      name: 'Data Structures Implementation',
      category: 'assignments',
      type: 'Programming Assignment',
      weightage: 8,
      totalMarks: 100,
      earnedMarks: 95,
      percentage: 95,
      status: 'On Time',
      statusColor: '#10b981',
      submittedDate: '2024-09-10T14:30:00Z',
      dueDate: '2024-09-12T23:59:00Z',
      teacherFeedback:
        'Excellent implementation! Clean code structure and efficient algorithms. Minor improvement needed in edge case handling.',
      rubricScores: {
        'Code Quality': { earned: 18, total: 20 },
        Functionality: { earned: 20, total: 20 },
        Documentation: { earned: 17, total: 20 },
        Testing: { earned: 16, total: 20 },
        Performance: { earned: 19, total: 20 },
      },
      attachments: ['solution.py', 'test_cases.py', 'documentation.pdf'],
    },
    {
      id: 'task-002',
      name: 'Algorithm Analysis Report',
      category: 'assignments',
      type: 'Research Assignment',
      weightage: 6,
      totalMarks: 100,
      earnedMarks: 88,
      percentage: 88,
      status: 'On Time',
      statusColor: '#10b981',
      submittedDate: '2024-09-20T16:45:00Z',
      dueDate: '2024-09-22T23:59:00Z',
      teacherFeedback:
        'Good analysis of time complexity. Your comparison of different sorting algorithms was thorough. Consider adding more real-world examples.',
      rubricScores: {
        'Research Quality': { earned: 17, total: 20 },
        'Analysis Depth': { earned: 18, total: 20 },
        'Writing Quality': { earned: 16, total: 20 },
        Citations: { earned: 19, total: 20 },
        Presentation: { earned: 18, total: 20 },
      },
    },
    {
      id: 'task-003',
      name: 'Database Design Assignment',
      category: 'assignments',
      type: 'Design Assignment',
      weightage: 7,
      totalMarks: 100,
      earnedMarks: 78,
      percentage: 78,
      status: 'Late',
      statusColor: '#f59e0b',
      submittedDate: '2024-09-28T10:15:00Z',
      dueDate: '2024-09-25T23:59:00Z',
      teacherFeedback:
        'Submitted 3 days late (-10 points). Good ER diagram design, but normalization could be improved. Review 3NF principles.',
      rubricScores: {
        'ER Diagram': { earned: 18, total: 20 },
        Normalization: { earned: 14, total: 20 },
        'SQL Queries': { earned: 17, total: 20 },
        Documentation: { earned: 15, total: 20 },
        Timeliness: { earned: 10, total: 20 },
      },
    },

    // Quizzes
    {
      id: 'quiz-001',
      name: 'Arrays and Linked Lists Quiz',
      category: 'quizzes',
      type: 'Online Quiz',
      weightage: 3,
      totalMarks: 100,
      earnedMarks: 92,
      percentage: 92,
      status: 'On Time',
      statusColor: '#10b981',
      submittedDate: '2024-09-15T11:30:00Z',
      dueDate: '2024-09-15T12:00:00Z',
      teacherFeedback:
        'Excellent understanding of data structures. Only minor mistake in time complexity analysis.',
      timeSpent: '25 minutes',
      attempts: 1,
      maxAttempts: 1,
    },
    {
      id: 'quiz-002',
      name: 'Sorting Algorithms Quiz',
      category: 'quizzes',
      type: 'Online Quiz',
      weightage: 3,
      totalMarks: 100,
      earnedMarks: 85,
      percentage: 85,
      status: 'On Time',
      statusColor: '#10b981',
      submittedDate: '2024-09-22T14:45:00Z',
      dueDate: '2024-09-22T15:00:00Z',
      teacherFeedback: 'Good performance. Review merge sort implementation details.',
      timeSpent: '28 minutes',
      attempts: 1,
      maxAttempts: 1,
    },

    // Exams
    {
      id: 'exam-001',
      name: 'Midterm Examination',
      category: 'exams',
      type: 'Written Exam',
      weightage: 15,
      totalMarks: 150,
      earnedMarks: 128,
      percentage: 85.3,
      status: 'On Time',
      statusColor: '#10b981',
      submittedDate: '2024-10-15T12:00:00Z',
      dueDate: '2024-10-15T12:00:00Z',
      teacherFeedback:
        'Strong performance across all topics. Excellent problem-solving in dynamic programming section. Minor errors in graph algorithms.',
      sections: {
        'Data Structures': { earned: 28, total: 30 },
        Algorithms: { earned: 25, total: 30 },
        'Dynamic Programming': { earned: 30, total: 30 },
        'Graph Theory': { earned: 22, total: 30 },
        'Problem Solving': { earned: 23, total: 30 },
      },
    },
    {
      id: 'exam-002',
      name: 'Final Examination',
      category: 'exams',
      type: 'Comprehensive Exam',
      weightage: 10,
      totalMarks: 150,
      earnedMarks: 0,
      percentage: 0,
      status: 'Missing',
      statusColor: '#ef4444',
      submittedDate: null,
      dueDate: '2024-12-10T12:00:00Z',
      teacherFeedback: 'Exam not yet taken. Scheduled for December 10th.',
    },

    // Projects
    {
      id: 'project-001',
      name: 'Social Media Analytics Platform',
      category: 'projects',
      type: 'Group Project',
      weightage: 6,
      totalMarks: 100,
      earnedMarks: 94,
      percentage: 94,
      status: 'On Time',
      statusColor: '#10b981',
      submittedDate: '2024-11-01T18:30:00Z',
      dueDate: '2024-11-02T23:59:00Z',
      teacherFeedback:
        'Outstanding project! Excellent use of modern technologies, clean architecture, and comprehensive testing. Great teamwork evident.',
      teamMembers: ['Alex Johnson', 'Sarah Chen', 'Michael Rodriguez'],
      technologies: ['React', 'Node.js', 'MongoDB', 'Python', 'Machine Learning'],
      deliverables: ['Source Code', 'Documentation', 'Presentation', 'Demo Video'],
    },
    {
      id: 'project-002',
      name: 'Algorithm Visualization Tool',
      category: 'projects',
      type: 'Individual Project',
      weightage: 4,
      totalMarks: 100,
      earnedMarks: 91,
      percentage: 91,
      status: 'Late',
      statusColor: '#f59e0b',
      submittedDate: '2024-11-22T14:20:00Z',
      dueDate: '2024-11-20T23:59:00Z',
      teacherFeedback:
        'Great interactive visualizations! Submitted 2 days late (-5 points). Consider adding more algorithms and improving UI responsiveness.',
      technologies: ['JavaScript', 'D3.js', 'HTML5 Canvas', 'CSS3'],
      features: [
        'Sorting Visualizations',
        'Graph Algorithms',
        'Interactive Controls',
        'Step-by-step Execution',
      ],
    },
  ],

  // Summary statistics
  summary: {
    totalAssignments: 12,
    completedAssignments: 11,
    onTimeSubmissions: 19,
    lateSubmissions: 4,
    missingSubmissions: 2,
    averageScore: 87.3,
    highestScore: 95,
    lowestScore: 78,
    improvementTrend: '+5.2%', // compared to previous semester
    timeManagement: {
      excellent: 19,
      good: 4,
      needsImprovement: 2,
    },
    strengths: [
      'Excellent programming skills',
      'Strong analytical thinking',
      'Good documentation practices',
      'Consistent performance',
    ],
    areasForImprovement: [
      'Time management for large assignments',
      'Edge case handling in code',
      'Exam preparation strategies',
    ],
  },

  // Teacher's general feedback
  teacherFeedback: {
    overall:
      'Alex demonstrates exceptional understanding of computer science concepts and consistently produces high-quality work. Strong programming abilities and analytical skills are evident throughout the semester.',
    strengths: [
      'Outstanding problem-solving capabilities',
      'Clean and well-documented code',
      'Excellent participation in class discussions',
      'Strong collaboration skills in group projects',
      'Consistent effort and improvement mindset',
    ],
    recommendations: [
      'Focus on time management to avoid late submissions',
      'Practice more complex algorithm implementations',
      'Prepare more thoroughly for comprehensive exams',
      'Consider tutoring other students to reinforce learning',
    ],
    nextSteps: [
      'Enroll in Advanced Algorithms course',
      'Consider internship opportunities',
      'Join competitive programming club',
      'Start working on senior capstone project ideas',
    ],
    overallRating: 'Excellent',
    teacherName: 'Dr. Emily Rodriguez',
    teacherTitle: 'Professor of Computer Science',
    lastUpdated: '2024-09-25T15:45:00Z',
  },

  // Performance trends over time
  trends: {
    monthly: [
      { month: 'August', score: 82.5, assignments: 3, rank: 15 },
      { month: 'September', score: 87.8, assignments: 5, rank: 12 },
      { month: 'October', score: 89.2, assignments: 4, rank: 8 },
    ],
    categoryTrends: {
      assignments: [85, 87, 89],
      quizzes: [88, 90, 92],
      exams: [82, 85, 0], // 0 for not yet taken
      projects: [90, 94, 91],
    },
  },

  // Notifications about new results
  notifications: [
    {
      id: 'notif-001',
      type: 'new_grade',
      title: 'New Grade Posted',
      message: 'Your grade for "Algorithm Visualization Tool" has been posted.',
      date: '2024-09-25T09:15:00Z',
      read: false,
      priority: 'medium',
    },
    {
      id: 'notif-002',
      type: 'feedback_available',
      title: 'Teacher Feedback Available',
      message: 'Dr. Rodriguez has provided feedback on your midterm exam.',
      date: '2024-09-24T14:30:00Z',
      read: false,
      priority: 'high',
    },
  ],

  // Performance analytics
  analytics: {
    classRank: 8,
    totalStudents: 45,
    percentile: 82,
    gpa: 3.8,
    creditHours: 15,
    attendanceRate: 95,
    participationScore: 92,
  },
};

// Helper functions for data processing
export const getPerformanceLevel = percentage => {
  if (percentage >= 90) return { level: 'excellent', color: '#10b981', label: 'Excellent' };
  if (percentage >= 80) return { level: 'good', color: '#3b82f6', label: 'Good' };
  if (percentage >= 70) return { level: 'fair', color: '#f59e0b', label: 'Fair' };
  return { level: 'poor', color: '#ef4444', label: 'Needs Improvement' };
};

export const getStatusInfo = status => {
  switch (status.toLowerCase()) {
    case 'on time':
      return { color: '#10b981', icon: 'faCheckCircle', label: 'On Time' };
    case 'late':
      return { color: '#f59e0b', icon: 'faClock', label: 'Late Submission' };
    case 'missing':
      return { color: '#ef4444', icon: 'faTimesCircle', label: 'Missing' };
    default:
      return { color: '#6b7280', icon: 'faQuestion', label: 'Unknown' };
  }
};

export const calculateCategoryProgress = category => {
  const completionRate = (category.completedItems / category.totalItems) * 100;
  const scoreRate = category.percentage;
  return {
    completionRate: Math.round(completionRate),
    scoreRate: Math.round(scoreRate * 10) / 10,
    isComplete: category.completedItems === category.totalItems,
  };
};
