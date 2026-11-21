import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import createMockStore from 'redux-mock-store';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import ActualVsPlannedCost from '../ActualVsPlannedCost';

vi.mock('axios');

vi.mock('../../../../../actions/bmdashboard/projectActions', () => ({
  fetchBMProjects: vi.fn(() => ({ type: 'FETCH_BM_PROJECTS' })),
}));

const PROJECT_ID = '6823e200a3475f85a80d5d9c';

const expenses = (planned, hasBudget) => ({
  data: {
    totalActualCost: 833423,
    totalPlannedCost: planned,
    hasBudget,
    breakdown: [
      { category: 'Labor', actualCost: 500000, plannedCost: planned * 0.5 },
      { category: 'Equipment', actualCost: 200000, plannedCost: planned * 0.2 },
      { category: 'Materials', actualCost: 133423, plannedCost: planned * 0.3 },
    ],
  },
});

const renderChart = () => {
  const store = createMockStore([])({
    theme: { darkMode: false },
    bmProjects: [{ _id: PROJECT_ID, name: 'Building 3' }],
  });
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <ActualVsPlannedCost />
      </MemoryRouter>
    </Provider>,
  );
};

describe('ActualVsPlannedCost budget states', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('shows the no-budget note and hides the variance indicators without a budget', async () => {
    axios.get.mockResolvedValue(expenses(0, false));
    renderChart();

    const link = await screen.findByRole('link', { name: 'Set a budget' });
    expect(link).toHaveAttribute('href', `/bmdashboard/projects/${PROJECT_ID}/budget`);
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining(`/bm/project/${PROJECT_ID}/expenses`),
    );

    // Give the 400 ms filter transition time to finish, then confirm no variance is shown
    await new Promise(resolve => {
      setTimeout(resolve, 450);
    });
    expect(screen.queryByText('Variance and Budget Indicators')).not.toBeInTheDocument();
    expect(screen.queryByText('OVER BUDGET')).not.toBeInTheDocument();
  });

  it('shows the variance indicators and no note when a budget is set', async () => {
    axios.get.mockResolvedValue(expenses(1000000, true));
    renderChart();

    expect(
      await screen.findByText('Variance and Budget Indicators', {}, { timeout: 2000 }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Set a budget' })).not.toBeInTheDocument();
  });
});
