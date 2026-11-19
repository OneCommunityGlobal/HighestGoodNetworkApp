export const teamData = {
  teamName: 'Team One',
  dateRange: {
    start: '2026-10-01',
    end: '2026-10-07',
  },
};

export const makeReviewers = () => [
  {
    id: 'r1',
    reviewerName: 'Ada Lovelace',
    role: 'Reviewer',
    prsNeeded: 5,
    history: [],
    gradedPrs: [
      {
        id: 'pr1',
        _id: 'pr1',
        prNumber: '1070',
        rating: 'Good',
      },
    ],
  },
];

export const makeBulkResponse = (reviewers = makeReviewers()) => ({
  reviewers: Object.fromEntries(
    reviewers.map(reviewer => [
      reviewer.id,
      {
        weeks: [
          {
            prs: (reviewer.gradedPrs || []).map(pr => ({
              ...pr,
              _id: pr._id || pr.id,
            })),
          },
        ],
      },
    ]),
  ),
});
