import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ENDPOINTS } from '../../utils/URL';
import {
  loadSavedGradings,
  mergeSavedGradings,
  saveAddedPR,
  saveGradeChange,
} from './prGradingPersistence';

vi.mock('axios');

const teamData = {
  teamName: '91NePRT',
  dateRange: { start: '5/18/2025', end: '5/25/2025' },
};

describe('PR grading persistence', () => {
  beforeEach(() => vi.clearAllMocks());

  it('loads saved PRs for the displayed team and week', async () => {
    axios.get.mockResolvedValue({ data: [{ reviewer: 'Alice', gradedPrs: [] }] });

    await expect(loadSavedGradings(teamData)).resolves.toHaveLength(1);
    expect(axios.get).toHaveBeenCalledWith(ENDPOINTS.WEEKLY_GRADING, {
      params: {
        team: 'pr-grading-screen:91NePRT',
        date: '2025-05-18',
        weekStart: '2025-05-18',
      },
    });
  });

  it('saves only the newly added PR for one reviewer', async () => {
    const reviewer = {
      reviewer: 'Alice',
      prsNeeded: 3,
      gradedPrs: [{ prNumbers: '1234', grade: 'Okay' }],
    };

    await saveAddedPR(teamData, reviewer, '5678 + 9999');

    expect(axios.post).toHaveBeenCalledWith(ENDPOINTS.WEEKLY_GRADING_SAVE, {
      teamCode: 'pr-grading-screen:91NePRT',
      teamName: 'pr-grading-screen:91NePRT',
      date: '2025-05-18',
      gradings: [
        {
          reviewer: 'Alice',
          prsNeeded: 3,
          prsReviewed: 2,
          gradedPrs: [{ prNumbers: '5678 + 9999', grade: 'Okay' }],
        },
      ],
    });
  });

  it('saves only the changed grade without increasing the reviewed count', async () => {
    const reviewer = {
      reviewer: 'Alice',
      prsNeeded: 3,
      gradedPrs: [{ prNumbers: '1234', grade: 'Okay' }],
    };

    await saveGradeChange(teamData, reviewer, '1234', 'Exceptional');

    expect(axios.post).toHaveBeenCalledWith(ENDPOINTS.WEEKLY_GRADING_SAVE, {
      teamCode: 'pr-grading-screen:91NePRT',
      teamName: 'pr-grading-screen:91NePRT',
      date: '2025-05-18',
      gradings: [
        {
          reviewer: 'Alice',
          prsNeeded: 3,
          prsReviewed: 1,
          gradedPrs: [{ prNumbers: '1234', grade: 'Exceptional' }],
        },
      ],
    });
  });

  it('merges saved PRs with built-in entries without duplicating them', () => {
    const reviewers = [
      {
        id: '1',
        reviewer: 'Alice',
        prsNeeded: 3,
        gradedPrs: [{ id: 'pr1', prNumbers: '1234', grade: 'Okay' }],
      },
    ];
    const saved = [
      {
        reviewer: 'Alice',
        gradedPrs: [
          { _id: 'saved1', prNumbers: '1234', grade: 'Okay' },
          { _id: 'saved2', prNumbers: '5678 + 9999', grade: 'Okay' },
        ],
      },
    ];

    expect(mergeSavedGradings(reviewers, saved)[0]).toMatchObject({
      prsReviewed: 2,
      gradedPrs: [
        { id: 'pr1', prNumbers: '1234' },
        { id: 'saved2', prNumbers: '5678 + 9999' },
      ],
    });
  });

  it('uses the saved grade for a built-in PR after reloading', () => {
    const reviewers = [
      {
        id: '1',
        reviewer: 'Alice',
        gradedPrs: [{ id: 'pr1', prNumbers: '1234 + 5678', grade: 'Okay' }],
      },
    ];
    const saved = [
      {
        reviewer: 'Alice',
        gradedPrs: [{ prNumbers: '1234+5678', grade: 'Exceptional' }],
      },
    ];

    expect(mergeSavedGradings(reviewers, saved)[0]).toMatchObject({
      prsReviewed: 1,
      gradedPrs: [{ id: 'pr1', prNumbers: '1234 + 5678', grade: 'Exceptional' }],
    });
  });
});
