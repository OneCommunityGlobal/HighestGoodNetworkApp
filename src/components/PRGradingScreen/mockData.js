// Mock data for PR Grading Screen
// This file contains sample data for testing the PR grading functionality

export const mockTeamData = {
  teamName: '91NePRT',
  dateRange: {
    start: '5/18/2025',
    end: '5/25/2025',
  },
};

export const mockReviewers = [
  {
    id: '1',
    reviewer: 'Abi',
    prsNeeded: 10,
    prsReviewed: 4,
    gradedPrs: [
      { id: 'pr1', prNumbers: '3100 + 1410', grade: 'Exceptional' },
      { id: 'pr2', prNumbers: '2045', grade: 'Okay' },
      { id: 'pr3', prNumbers: '1876 + 2234', grade: 'Exceptional' },
      { id: 'pr4', prNumbers: '3301', grade: 'Unsatisfactory' },
    ],
  },
  {
    id: '2',
    reviewer: 'Abdel',
    role: 'Mentor and longterm PR person, must do 1 PR review a week',
    prsNeeded: 7,
    prsReviewed: 3,
    gradedPrs: [
      { id: 'pr5', prNumbers: '1245', grade: 'Okay' },
      { id: 'pr6', prNumbers: '2876 + 3421', grade: 'Exceptional' },
      { id: 'pr7', prNumbers: '1987', grade: 'No Correct Image' },
    ],
  },
  {
    id: '3',
    reviewer: 'Anand',
    prsNeeded: 10,
    prsReviewed: 3,
    gradedPrs: [
      { id: 'pr8', prNumbers: '1070 + 1256', grade: 'Exceptional' },
      { id: 'pr9', prNumbers: '2134', grade: 'Okay' },
      { id: 'pr10', prNumbers: '3456 + 4567', grade: 'Exceptional' },
    ],
  },
  {
    id: '4',
    reviewer: 'Cari',
    prsNeeded: 1,
    prsReviewed: 0,
    gradedPrs: [],
  },
  {
    id: '5',
    reviewer: 'Christy',
    role: 'Expressers',
    prsNeeded: 5,
    prsReviewed: 3,
    gradedPrs: [
      { id: 'pr11', prNumbers: '5678', grade: 'Okay' },
      { id: 'pr12', prNumbers: '6789 + 7890', grade: 'Exceptional' },
      { id: 'pr13', prNumbers: '8901', grade: 'Unsatisfactory' },
    ],
  },
  {
    id: '6',
    reviewer: 'Kurtis',
    role: 'Mentor and longterm PR person, must do 1 PR review a week',
    prsNeeded: 12,
    prsReviewed: 4,
    gradedPrs: [
      { id: 'pr14', prNumbers: '9012', grade: 'Okay' },
      { id: 'pr15', prNumbers: '1234 + 5678', grade: 'Exceptional' },
      { id: 'pr16', prNumbers: '9876', grade: 'No Correct Image' },
      { id: 'pr17', prNumbers: '5432 + 1098', grade: 'Exceptional' },
    ],
  },
  {
    id: '7',
    reviewer: 'Lin Khant',
    prsNeeded: 1,
    prsReviewed: 1,
    gradedPrs: [{ id: 'pr18', prNumbers: '2468', grade: 'Okay' }],
  },
  {
    id: '8',
    reviewer: 'Luis',
    prsNeeded: 11,
    prsReviewed: 7,
    gradedPrs: [
      { id: 'pr19', prNumbers: '3579', grade: 'Okay' },
      { id: 'pr20', prNumbers: '4680 + 1357', grade: 'Exceptional' },
      { id: 'pr21', prNumbers: '9753', grade: 'Unsatisfactory' },
      { id: 'pr22', prNumbers: '8642 + 7531', grade: 'Exceptional' },
      { id: 'pr23', prNumbers: '6420', grade: 'No Correct Image' },
    ],
  },
];

// Additional mock data for testing edge cases
export const mockEdgeCases = [
  {
    id: 'edge1',
    reviewer: 'Test User 1',
    prsNeeded: 0,
    prsReviewed: 0,
    gradedPrs: [],
  },
  {
    id: 'edge2',
    reviewer: 'Test User 2',
    prsNeeded: 50,
    prsReviewed: 45,
    gradedPrs: [
      { id: 'pr24', prNumbers: '1111 + 2222', grade: 'Exceptional' },
      { id: 'pr25', prNumbers: '3333', grade: 'Okay' },
      { id: 'pr26', prNumbers: '4444 + 5555', grade: 'Exceptional' },
    ],
  },
];

// Function to get all mock data
export const getAllMockData = () => ({
  teamData: mockTeamData,
  reviewers: mockReviewers,
});

// Function to get a specific reviewer's data
export const getReviewerById = id => {
  return mockReviewers.find(reviewer => reviewer.id === id);
};

// Function to get reviewers with incomplete reviews
export const getIncompleteReviewers = () => {
  return mockReviewers.filter(reviewer => reviewer.prsReviewed < reviewer.prsNeeded);
};

// Function to get reviewers by role
export const getReviewersByRole = role => {
  return mockReviewers.filter(reviewer => reviewer.role === role);
};

// Grade options available
export const gradeOptions = [
  { value: 'Exceptional', label: 'Exceptional', color: 'success' },
  { value: 'Okay', label: 'Okay', color: 'primary' },
  { value: 'Unsatisfactory', label: 'Unsatisfactory', color: 'danger' },
  { value: 'No Correct Image', label: 'No Correct Image', color: 'secondary' },
];

// Default data for new PR entries
export const createNewPREntry = (prNumbers, grade) => ({
  id: `pr_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`,
  prNumbers,
  grade,
});

export default {
  mockTeamData,
  mockReviewers,
  getAllMockData,
  getReviewerById,
  getIncompleteReviewers,
  getReviewersByRole,
  gradeOptions,
  createNewPREntry,
};
