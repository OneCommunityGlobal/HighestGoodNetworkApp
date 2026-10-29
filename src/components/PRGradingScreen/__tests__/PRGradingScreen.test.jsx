import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import PRGradingScreen from '../PRGradingScreen';
import GRADE_OPTIONS from '../gradeOptions';

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

const renderScreen = () =>
  render(<PRGradingScreen teamData={teamData} reviewers={makeReviewers()} />);

// Both tables label their checkboxes `${prNumbers} ${label}`. Before the modal
// opens only the inline summary is mounted, so there is exactly one match;
// afterwards there are two, in DOM order: [inline, modal].
const checkboxes = label => screen.queryAllByLabelText(`1070 ${label}`);

// The PR number renders twice (main row + inline summary tag); only the main
// row's is the role="button" that opens the modal.
const openModal = () => fireEvent.click(screen.getByRole('button', { name: '1070' }));

describe('PRGradingScreen grade sync between inline summary and modal', () => {
  it.each(GRADE_OPTIONS.map(o => o.label))('reflects an inline "%s" grade in the modal', label => {
    renderScreen();

    // Only the inline summary is mounted before the modal opens.
    const [inline] = checkboxes(label);
    fireEvent.click(inline);
    expect(inline).toBeChecked();

    openModal();

    // Both tables are mounted now; the second match is the modal's.
    const all = checkboxes(label);
    expect(all).toHaveLength(2);
    expect(all[1]).toBeChecked();
  });

  it('keeps a single grade selected when switching options inline', () => {
    renderScreen();

    fireEvent.click(checkboxes('Cannot find image')[0]);
    expect(checkboxes('Cannot find image')[0]).toBeChecked();
    expect(checkboxes('Okay')[0]).not.toBeChecked();

    fireEvent.click(checkboxes('Exceptional')[0]);
    expect(checkboxes('Exceptional')[0]).toBeChecked();
    expect(checkboxes('Cannot find image')[0]).not.toBeChecked();
  });

  it('propagates a modal grade back to the inline summary', () => {
    renderScreen();
    openModal();

    const [inline, modal] = checkboxes('Cannot find image');
    fireEvent.click(modal);

    expect(modal).toBeChecked();
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
