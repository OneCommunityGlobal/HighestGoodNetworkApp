const mockUserData = [
  {
    reviewerName: 'test 1',
    pledgedHours: 20,
    requiredPRs: 10,
    totalReviews: 15,
    remainingWeeks: 0,
    isNewMember: true,
    weeklyRequirementsMet: true,
  },
  {
    reviewerName: 'test 2',
    pledgedHours: 10,
    requiredPRs: 5,
    totalReviews: 5,
    remainingWeeks: 2,
    isNewMember: true,
    weeklyRequirementsMet: false,
  },
  {
    reviewerName: 'test 3',
    pledgedHours: 30,
    requiredPRs: 15,
    totalReviews: 30,
    remainingWeeks: 0,
    isNewMember: false,
    weeklyRequirementsMet: true,
  },
  {
    reviewerName: 'test 4',
    pledgedHours: 25,
    requiredPRs: 12,
    totalReviews: 18,
    remainingWeeks: 1,
    isNewMember: false,
    weeklyRequirementsMet: false,
  },
];

export default mockUserData;
