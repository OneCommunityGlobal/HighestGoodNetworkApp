import { vi } from 'vitest';

// Native <dialog> isn't implemented in jsdom, so showModal/close are stubbed
// here and shared by every test file that renders a PRGradingScreen/Modal
// dialog, instead of each one redefining the same prototype stubs.
export const mockNativeDialog = () => {
  const showModalMock = vi.fn(function openDialog() {
    this.setAttribute('open', '');
  });

  const closeMock = vi.fn(function closeDialog() {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  });

  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value: showModalMock,
  });

  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value: closeMock,
  });

  return { showModalMock, closeMock };
};

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
