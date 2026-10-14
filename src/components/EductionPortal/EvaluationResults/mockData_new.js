// ============================================================================
// MOCK EVALUATION DATA - Clean Academic Performance Data for New Design
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
  overallScore: 77.0,

  // Performance categories with detailed breakdown
  categories: [
    {
      id: 'assignments',
      name: 'Assignments',
      weightage: 40,
      totalItems: 5,
      completedItems: 5,
      totalMarks: 40,
      earnedMarks: 32,
      percentage: 80.0,
      performanceLevel: 'good',
      color: '#28a745',
      icon: 'faClipboardCheck',
      description: 'Programming assignments, essays, and individual homework tasks',
      dueDate: '2024-10-14T12:00:00',
      submissions: {
        onTime: 4,
        late: 1,
        missing: 0,
      },
    },
    {
      id: 'exams',
      name: 'Exams',
      weightage: 35,
      totalItems: 2,
      completedItems: 2,
      totalMarks: 40,
      earnedMarks: 32,
      percentage: 80.0,
      performanceLevel: 'good',
      color: '#28a745',
      icon: 'faGraduationCap',
      description: 'Comprehensive midterm and final examinations',
      dueDate: '2024-12-09T12:00:00',
      submissions: {
        onTime: 2,
        late: 0,
        missing: 0,
      },
    },
    {
      id: 'quizzes',
      name: 'Quizzes',
      weightage: 15,
      totalItems: 8,
      completedItems: 8,
      totalMarks: 40,
      earnedMarks: 24,
      percentage: 60.0,
      performanceLevel: 'fair',
      color: '#ffc107',
      icon: 'faQuestion',
      description: 'Short weekly quizzes and knowledge check assessments',
      dueDate: '2024-09-29T12:00:00',
      submissions: {
        onTime: 6,
        late: 2,
        missing: 0,
      },
    },
    {
      id: 'projects',
      name: 'Projects',
      weightage: 10,
      totalItems: 1,
      completedItems: 1,
      totalMarks: 40,
      earnedMarks: 32,
      percentage: 80.0,
      performanceLevel: 'good',
      color: '#28a745',
      icon: 'faUsers',
      description: 'Group projects and collaborative work assignments',
      dueDate: '2024-11-19T12:00:00',
      submissions: {
        onTime: 1,
        late: 0,
        missing: 0,
      },
    },
  ],

  // Detailed task/assignment list
  tasks: [
    {
      id: 'task-001',
      name: 'Assignment 1: Essay on Climate Change',
      category: 'assignments',
      type: 'Essay Assignment',
      weightage: 8,
      totalMarks: 10,
      earnedMarks: 8,
      percentage: 80,
      status: 'On time',
      statusColor: '#28a745',
      submissionDate: '2024-08-15T14:30:00Z',
      dueDate: '2024-08-15T23:59:00Z',
      teacherFeedback: 'Good analysis and structure. Consider adding more supporting evidence.',
    },
    {
      id: 'task-002',
      name: 'Mid-Term Exam',
      category: 'exams',
      type: 'Examination',
      weightage: 20,
      totalMarks: 100,
      earnedMarks: 75,
      percentage: 75,
      status: 'On time',
      statusColor: '#28a745',
      submissionDate: '2024-09-15T14:30:00Z',
      dueDate: '2024-09-15T16:00:00Z',
      teacherFeedback: 'Solid performance overall. Review concepts from chapter 5.',
    },
    {
      id: 'task-003',
      name: 'Quiz 1: Basic Concepts',
      category: 'quizzes',
      type: 'Quiz',
      weightage: 2,
      totalMarks: 20,
      earnedMarks: 15,
      percentage: 75,
      status: 'On time',
      statusColor: '#28a745',
      submissionDate: '2024-08-28T14:30:00Z',
      dueDate: '2024-08-28T23:59:00Z',
      teacherFeedback: 'Good understanding of basic concepts.',
    },
    {
      id: 'task-004',
      name: 'Assignment 2: Research Project',
      category: 'assignments',
      type: 'Research Assignment',
      weightage: 12,
      totalMarks: 10,
      earnedMarks: 6,
      percentage: 60,
      status: 'Late for 2 days',
      statusColor: '#dc3545',
      submissionDate: '2024-09-20T14:30:00Z',
      dueDate: '2024-09-18T23:59:00Z',
      teacherFeedback: 'Late submission. Content needs more depth and analysis.',
    },
    {
      id: 'task-005',
      name: 'Quiz 2: Advanced Topics',
      category: 'quizzes',
      type: 'Quiz',
      weightage: 2,
      totalMarks: 15,
      earnedMarks: 9,
      percentage: 60,
      status: 'On time',
      statusColor: '#28a745',
      submissionDate: '2024-09-25T14:30:00Z',
      dueDate: '2024-09-25T23:59:00Z',
      teacherFeedback: 'Review advanced concepts. Practice problems recommended.',
    },
    {
      id: 'task-006',
      name: 'Final Exam',
      category: 'exams',
      type: 'Final Examination',
      weightage: 15,
      totalMarks: 100,
      earnedMarks: 82,
      percentage: 82,
      status: 'On time',
      statusColor: '#28a745',
      submissionDate: '2024-10-15T14:30:00Z',
      dueDate: '2024-10-15T16:00:00Z',
      teacherFeedback: 'Excellent improvement from mid-term. Well prepared.',
    },
  ],

  // Summary statistics
  summary: {
    totalAssignments: 6,
    completedAssignments: 6,
    onTimeSubmissions: 5,
    lateSubmissions: 1,
    missingSubmissions: 0,
    averageScore: 72,
    improvementTrend: '+5%',
    lastAssignmentDate: '2024-10-15T16:00:00Z',
  },

  // Teacher feedback (kept for compatibility)
  teacherFeedback: {
    teacherName: 'Dr. Emily Rodriguez',
    teacherTitle: 'Professor of Computer Science',
    overallRating: 'Good',
    lastUpdated: '2024-10-25T10:30:00Z',
    overall:
      'You performed strongly in Assignments (80%), Exams (80%), and Projects (80%). You may improve your performance in Quizzes (60%) - consider reviewing quiz preparation strategies.',
    strengths: [
      'Strong analytical thinking and problem-solving skills',
      'Excellent written communication in assignments',
      'Consistent attendance and participation',
    ],
    improvements: [
      'Review quiz preparation strategies',
      'Practice time management during timed assessments',
      'Strengthen foundational concepts',
    ],
  },
};

// Helper functions for performance calculations
export const getPerformanceLevel = score => {
  if (score >= 90) return { level: 'excellent', label: 'Excellent', color: 'success' };
  if (score >= 80) return { level: 'good', label: 'Good', color: 'primary' };
  if (score >= 70) return { level: 'fair', label: 'Fair', color: 'warning' };
  return { level: 'poor', label: 'Needs Improvement', color: 'danger' };
};

export const calculateCategoryProgress = category => {
  const completionRate = Math.round((category.completedItems / category.totalItems) * 100);
  const isComplete = category.completedItems === category.totalItems;
  return { completionRate, isComplete };
};

export const getStatusInfo = status => {
  if (status === 'On time' || status === 'completed') {
    return { color: 'success', icon: 'check-circle' };
  }
  if (status?.toLowerCase().includes('late')) {
    return { color: 'danger', icon: 'exclamation-triangle' };
  }
  return { color: 'secondary', icon: 'clock' };
};
