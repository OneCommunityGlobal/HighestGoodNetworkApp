import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import axios from 'axios';
import MostExpensiveIssuesChart from '../MostExpensiveIssuesChart';

vi.mock('axios');

vi.mock('react-chartjs-2', () => ({
  Bar: ({ data }) => (
    <div data-testid="most-expensive-bar-chart">
      <span data-testid="chart-labels">{(data.labels || []).join(', ')}</span>
      <span data-testid="chart-values">{(data.datasets?.[0]?.data || []).join(', ')}</span>
    </div>
  ),
}));

const mockStore = configureMockStore([]);

describe('MostExpensiveIssuesChart', () => {
  let store;

  beforeEach(() => {
    vi.clearAllMocks();
    store = mockStore({
      theme: { darkMode: false },
      bmProjects: [{ _id: 'proj1', name: 'Alpha Project' }],
    });
  });

  it('renders title and filter dropdown controls', async () => {
    axios.get.mockResolvedValue({ data: [] });

    render(
      <Provider store={store}>
        <MostExpensiveIssuesChart />
      </Provider>,
    );

    expect(screen.getByText('Most Expensive Open Issues')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Filter by Date Range')).toBeInTheDocument();
    expect(screen.getByText('Filter by Projects')).toBeInTheDocument();
  });

  it('fetches issues and passes sorted data to the horizontal bar chart', async () => {
    axios.get.mockImplementation(url => {
      if (url.includes('/bm/issues/projects')) {
        return Promise.resolve({
          data: [
            { _id: 'proj1', name: 'Alpha Project' },
            { _id: 'proj2', name: 'Beta Project' },
          ],
        });
      }
      return Promise.resolve({
        data: [
          { _id: '1', issueTitle: 'Small Leak', cost: 1200 },
          { _id: '2', issueTitle: 'Roof Damage', cost: 9500 },
          { _id: '3', issueTitle: 'HVAC Failure', cost: 4300 },
        ],
      });
    });

    render(
      <Provider store={store}>
        <MostExpensiveIssuesChart />
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('most-expensive-bar-chart')).toBeInTheDocument();
    });

    // Check sorted in descending order: Roof Damage (9500), HVAC Failure (4300), Small Leak (1200)
    expect(screen.getByTestId('chart-labels')).toHaveTextContent(
      'Roof Damage, HVAC Failure, Small Leak',
    );
    expect(screen.getByTestId('chart-values')).toHaveTextContent('9500, 4300, 1200');
  });

  it('handles API errors gracefully and displays error message', async () => {
    axios.get.mockImplementation(url => {
      if (url.includes('/bm/issues/projects')) {
        return Promise.resolve({ data: [] });
      }
      return Promise.reject(new Error('Network error'));
    });

    render(
      <Provider store={store}>
        <MostExpensiveIssuesChart />
      </Provider>,
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Error fetching open issues with filters: Network error/),
      ).toBeInTheDocument();
    });
  });
});
