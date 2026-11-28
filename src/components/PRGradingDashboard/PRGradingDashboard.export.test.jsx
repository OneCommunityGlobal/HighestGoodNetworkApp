import axios from 'axios';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { downloadPRGradingCsv } from '../PRGradingScreen/csvExport';
import PRGradingDashboard from './PRGradingDashboard';

vi.mock('axios');
vi.mock('react-redux', () => ({
  useDispatch: () => () => false,
  useSelector: selector => selector({ theme: { darkMode: false }, auth: { user: null } }),
}));
vi.mock('../PRGradingScreen/csvExport', () => ({
  downloadPRGradingCsv: vi.fn(),
}));

const gradings = [
  {
    reviewer: 'Alice',
    prsReviewed: 7,
    prsNeeded: 10,
    gradedPrs: [{ prNumbers: '1070 + 1256', grade: 'Exceptional' }],
  },
];

describe('Team Alpha dashboard CSV export', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockResolvedValue({ data: gradings });
  });

  it('exports the displayed grading data after selecting a review week', async () => {
    render(<PRGradingDashboard />);

    const exportButton = await screen.findByRole('button', {
      name: 'Export to CSV',
    });
    expect(
      within(screen.getByRole('group', { name: 'Review week actions' })).getByRole('button', {
        name: 'Export to CSV',
      }),
    ).toBe(exportButton);
    fireEvent.change(screen.getByLabelText('Review Week'), { target: { value: '2 Weeks Ago' } });
    fireEvent.click(await screen.findByRole('button', { name: 'Export to CSV' }));

    await waitFor(() => {
      expect(downloadPRGradingCsv).toHaveBeenCalledExactlyOnceWith(
        [
          {
            ...gradings[0],
            gradedPrs: [{ ...gradings[0].gradedPrs[0], isNew: false }],
          },
        ],
        'team-alpha-pr-grading-displayed-data.csv',
        { useStoredCount: true },
      );
    });
  });
});
