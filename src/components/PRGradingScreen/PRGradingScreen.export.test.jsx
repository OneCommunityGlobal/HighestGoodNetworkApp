import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PRGradingScreen from './PRGradingScreen';
import { downloadWeeklyPRGradingCsv } from './csvExport';

vi.mock('react-redux', () => ({
  useSelector: selector => selector({ theme: { darkMode: false } }),
}));

vi.mock('./csvExport', () => ({
  downloadWeeklyPRGradingCsv: vi.fn(),
}));

const dateRange = { start: '5/18/2025', end: '5/25/2025' };
const teamData = { teamName: '91NePRT', dateRange };
const reviewers = [
  { id: '1', reviewer: 'Alice', role: 'Mentor', prsNeeded: 2, gradedPrs: [] },
  { id: '2', reviewer: 'Bob', role: 'Reviewer', prsNeeded: 1, gradedPrs: [] },
  { id: '3', reviewer: 'Alex', role: 'Reviewer', prsNeeded: 1, gradedPrs: [] },
];

describe('weekly PR grading Export to CSV button', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exports only reviewers matching the current search and role filters', () => {
    render(<PRGradingScreen teamData={teamData} reviewers={reviewers} />);

    fireEvent.change(screen.getByPlaceholderText('Search reviewers by name...'), {
      target: { value: 'al' },
    });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Mentor' } });
    fireEvent.click(screen.getByRole('button', { name: 'Export to CSV' }));

    expect(downloadWeeklyPRGradingCsv).toHaveBeenCalledExactlyOnceWith([reviewers[0]], dateRange);
  });

  it('exports a newly added PR without requiring Done', () => {
    render(<PRGradingScreen teamData={teamData} reviewers={reviewers} />);

    fireEvent.click(screen.getAllByRole('button', { name: '+ Add new' })[0]);
    fireEvent.change(screen.getByPlaceholderText('1070 or 1070 + 1256'), {
      target: { value: '1234' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    fireEvent.click(screen.getByRole('button', { name: 'Export to CSV' }));

    expect(downloadWeeklyPRGradingCsv).toHaveBeenCalledExactlyOnceWith(
      [
        expect.objectContaining({
          reviewer: 'Alice',
          prsReviewed: 1,
          gradedPrs: [expect.objectContaining({ prNumbers: '1234', grade: 'Okay' })],
        }),
        reviewers[1],
        reviewers[2],
      ],
      dateRange,
    );
  });
});
