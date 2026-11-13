import { render, screen } from '@testing-library/react';
import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PRGradingScreenContainer from './index';

const route = vi.hoisted(() => ({ search: '', state: null }));

vi.mock('axios');
vi.mock('react-router-dom', () => ({ useLocation: () => route }));
vi.mock('./PRGradingScreen', () => ({
  default: ({ teamData, reviewers }) => (
    <div>
      {teamData.teamName} - {teamData.dateRange.start} - {reviewers.length} reviewers
    </div>
  ),
}));

describe('PR grading screen team selection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    route.search = '';
    route.state = null;
  });

  it('loads the built-in team when opened directly', () => {
    render(<PRGradingScreenContainer />);

    expect(screen.getByText(/91NePRT - 5\/18\/2025/)).toBeInTheDocument();
    expect(axios.get).not.toHaveBeenCalled();
  });

  it('reloads a custom team from its URL after a refresh', async () => {
    route.search = '?teamId=custom1&weekStart=2026-10-04';
    axios.get.mockResolvedValue({
      data: [
        {
          _id: 'custom1',
          teamName: 'Custom Team',
          reviewerCount: 2,
          reviewerNames: ['Alice', 'Bob'],
        },
      ],
    });

    render(<PRGradingScreenContainer />);

    expect(await screen.findByText(/Custom Team - 10\/4\/2026 - 2 reviewers/)).toBeInTheDocument();
  });
});
