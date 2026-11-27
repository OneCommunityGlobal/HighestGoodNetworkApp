import axios from 'axios';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PRGradingScreen from '../PRGradingScreen';
import GRADE_OPTIONS from '../gradeOptions';

vi.mock('axios');

beforeEach(() => {
  vi.clearAllMocks();
  axios.get.mockResolvedValue({ data: [] });
  axios.post.mockResolvedValue({ data: { status: 'ok' } });
});

vi.mock('react-redux', async () => {
  const actual = await vi.importActual('react-redux');
  return { ...actual, useSelector: () => false };
});

const teamData = {
  teamName: 'Team One',
  dateRange: { start: '01/01/2026', end: '01/07/2026' },
};

const makeReviewers = () => [
  {
    id: 'r1',
    reviewer: 'Ada Lovelace',
    role: 'Reviewer',
    prsNeeded: 5,
    prsReviewed: 1,
    gradedPrs: [{ id: 'pr1', prNumbers: '1070', grade: 'Okay' }],
  },
];

const renderScreen = async () => {
  render(<PRGradingScreen teamData={teamData} reviewers={makeReviewers()} />);
  await waitFor(() => expect(screen.getByRole('button', { name: '+ Add new' })).toBeEnabled());
};

// Both tables label their checkboxes `${prNumbers} ${label}`. Before the modal
// opens only the inline summary is mounted, so there is exactly one match;
// afterwards there are two, in DOM order: [inline, modal].
const checkboxes = label => screen.queryAllByLabelText(`1070 ${label}`);

// The PR number renders twice (main row + inline summary tag); only the main
// row's is the role="button" that opens the modal.
const openModal = () => fireEvent.click(screen.getByRole('button', { name: '1070' }));

describe('PRGradingScreen grade sync between inline summary and modal', () => {
  it.each(GRADE_OPTIONS.map(o => o.label))(
    'reflects an inline "%s" grade in the modal',
    async label => {
      await renderScreen();

      // Only the inline summary is mounted before the modal opens.
      const [inline] = checkboxes(label);
      fireEvent.click(inline);
      await waitFor(() => expect(inline).toBeChecked());

      openModal();

      // Both tables are mounted now; the second match is the modal's.
      const all = checkboxes(label);
      expect(all).toHaveLength(2);
      expect(all[1]).toBeChecked();
    },
  );

  it('keeps a single grade selected when switching options inline', async () => {
    await renderScreen();

    fireEvent.click(checkboxes('Cannot find image')[0]);
    await waitFor(() => expect(checkboxes('Cannot find image')[0]).toBeChecked());
    expect(checkboxes('Okay')[0]).not.toBeChecked();

    fireEvent.click(checkboxes('Exceptional')[0]);
    await waitFor(() => expect(checkboxes('Exceptional')[0]).toBeChecked());
    expect(checkboxes('Cannot find image')[0]).not.toBeChecked();
  });

  it('propagates a modal grade back to the inline summary', async () => {
    await renderScreen();
    openModal();

    const [inline, modal] = checkboxes('Cannot find image');
    fireEvent.click(modal);

    await waitFor(() => expect(modal).toBeChecked());
    expect(inline).toBeChecked();
  });
});

describe('PRGradingScreen renders pre-existing grades', () => {
  // Literal strings on purpose: these are the grades mockData actually stores.
  // Deriving them from GRADE_OPTIONS would make the test move with the bug it is
  // meant to catch — if the option's value drifts, a stored grade renders
  // unchecked in both tables and silently does not display anywhere.
  it.each(['Exceptional', 'Okay', 'Unsatisfactory', 'Cannot find image'])(
    'shows a stored "%s" grade as checked',
    grade => {
      render(
        <PRGradingScreen
          teamData={teamData}
          reviewers={[
            { ...makeReviewers()[0], gradedPrs: [{ id: 'pr1', prNumbers: '1070', grade }] },
          ]}
        />,
      );

      // The column is labelled with the grade itself, so a stored grade must
      // light up the column of the same name.
      expect(checkboxes(grade)[0]).toBeChecked();
    },
  );
});

describe('gradeOptions', () => {
  it('uses the same string for label and value so the two tables cannot drift', () => {
    GRADE_OPTIONS.forEach(opt => {
      expect(opt.value).toBe(opt.label);
    });
  });
});
