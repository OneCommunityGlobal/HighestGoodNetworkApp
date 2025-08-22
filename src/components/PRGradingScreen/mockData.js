// Mock data for PR Grading Screen
// This file contains sample data for testing the PR grading functionality
// Delete this file once we have the backend endpoint to get data

export const mockTeamData = {
  teamName: '91NePRT',
  dateRange: {
    start: '5/18/2025',
    end: '5/25/2025',
  },
};

// Team 2: Small team
export const mockTeamData2 = {
  teamName: 'SmallTeam',
  dateRange: {
    start: '6/1/2025',
    end: '6/8/2025',
  },
};

// Team 3: Complex team
export const mockTeamData3 = {
  teamName: 'ComplexTeam',
  dateRange: {
    start: '6/15/2025',
    end: '6/22/2025',
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
      { id: 'pr7', prNumbers: '1987', grade: 'Cannot find image' },
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
      { id: 'pr16', prNumbers: '9876', grade: 'Cannot find image' },
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
      { id: 'pr23', prNumbers: '6420', grade: 'Cannot find image' },
    ],
  },
];

// Team 2: Small team reviewers
export const mockReviewers2 = [
  {
    id: '1',
    reviewer: 'Alice',
    prsNeeded: 2,
    prsReviewed: 1,
    gradedPrs: [{ id: 'pr1', prNumbers: '100', grade: 'Okay' }],
  },
  {
    id: '2',
    reviewer: 'Bob',
    prsNeeded: 1,
    prsReviewed: 0,
    gradedPrs: [],
  },
  {
    id: '3',
    reviewer: 'Charlie',
    prsNeeded: 3,
    prsReviewed: 3,
    gradedPrs: [
      { id: 'pr2', prNumbers: '200 + 300', grade: 'Exceptional' },
      { id: 'pr3', prNumbers: '400', grade: 'Okay' },
      { id: 'pr4', prNumbers: '500 + 600', grade: 'Unsatisfactory' },
    ],
  },
];

// Team 3: Complex team with edge cases
export const mockReviewers3 = [
  {
    id: '1',
    reviewer: 'David Williams-Johnson',
    role: 'Senior Mentor',
    prsNeeded: 20,
    prsReviewed: 15,
    gradedPrs: [
      { id: 'pr1', prNumbers: '1000 + 2000', grade: 'Exceptional' },
      { id: 'pr2', prNumbers: '3000', grade: 'Okay' },
      { id: 'pr3', prNumbers: '4000 + 5000', grade: 'Cannot find image' },
    ],
  },
  {
    id: '2',
    reviewer: 'Emma',
    prsNeeded: 0,
    prsReviewed: 0,
    gradedPrs: [],
  },
  {
    id: '3',
    reviewer: 'Frank',
    role: 'New Member',
    prsNeeded: 50,
    prsReviewed: 1,
    gradedPrs: [{ id: 'pr6', prNumbers: '9000', grade: 'Okay' }],
  },
  {
    id: '4',
    reviewer: 'Grace',
    prsNeeded: 5,
    prsReviewed: 8,
    gradedPrs: [
      { id: 'pr7', prNumbers: '10000 + 11000', grade: 'Exceptional' },
      { id: 'pr8', prNumbers: '12000', grade: 'Unsatisfactory' },
      { id: 'pr9', prNumbers: '13000 + 14000', grade: 'Exceptional' },
      { id: 'pr10', prNumbers: '15000', grade: 'Cannot find image' },
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

// Function to get team 2 data
export const getTeam2Data = () => ({
  teamData: mockTeamData2,
  reviewers: mockReviewers2,
});

// Function to get team 3 data
export const getTeam3Data = () => ({
  teamData: mockTeamData3,
  reviewers: mockReviewers3,
});

// Function to get data by team ID
export const getDataByTeamId = teamId => {
  switch (teamId) {
    case 'team1':
      return getAllMockData();
    case 'team2':
      return getTeam2Data();
    case 'team3':
      return getTeam3Data();
    default:
      return getAllMockData();
  }
};

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
  { value: 'Cannot find image', label: 'Cannot find image', color: 'secondary' },
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
