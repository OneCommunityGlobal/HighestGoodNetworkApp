import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import LongestOpenIssuesChart from '../LongestOpenIssuesChart';
import {
  fetchLongestOpenIssues,
  fetchMostExpensiveIssues,
} from '../../../../actions/bmdashboard/issueChartActions';

vi.mock('../../../../actions/bmdashboard/issueChartActions', () => ({
  fetchLongestOpenIssues: vi.fn(() => ({ type: 'FETCH_LONGEST_OPEN_ISSUES' })),
  fetchMostExpensiveIssues: vi.fn(() => ({ type: 'FETCH_MOST_EXPENSIVE_ISSUES' })),
}));

let renderedChartProps = null;

vi.mock('react-chartjs-2', () => ({
  Bar: props => {
    renderedChartProps = props;
    return (
      <div data-testid="issues-bar-chart">
        <span data-testid="chart-title">{props.options?.plugins?.title?.text}</span>
        <span data-testid="chart-labels">{(props.data?.labels || []).join(', ')}</span>
        <span data-testid="chart-values">{(props.data?.datasets?.[0]?.data || []).join(', ')}</span>
      </div>
    );
  },
}));

const mockStore = configureMockStore([thunk]);

describe('LongestOpenIssuesChart (Issue Tracking mode switch and rendering)', () => {
  const mockProjects = [
    { _id: 'proj1', name: 'Project Alpha' },
    { _id: 'proj2', name: 'Project Beta' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    renderedChartProps = null;
  });

  it('renders default "Longest Open" view and dispatches fetchLongestOpenIssues', () => {
    const store = mockStore({
      theme: { darkMode: false },
      issue: {
        longestOpenIssues: [{ issueId: '1', title: 'Leaky Pipe', daysOpen: 45 }],
        mostExpensiveIssues: [],
        loading: false,
        error: null,
      },
    });

    render(
      <Provider store={store}>
        <LongestOpenIssuesChart bmProjects={mockProjects} />
      </Provider>,
    );

    expect(screen.getByRole('combobox', { name: 'Chart type' })).toHaveValue('Longest Open');
    expect(screen.getByTestId('chart-title')).toHaveTextContent('Top 5 Longest Open Issues');
    expect(screen.getByTestId('chart-labels')).toHaveTextContent('Leaky Pipe');
    expect(screen.getByTestId('chart-values')).toHaveTextContent('45');
    expect(fetchLongestOpenIssues).toHaveBeenCalled();
  });

  it('switches to "Most Expensive" mode, updates title to "Most Expensive Open Issues", and dispatches fetchMostExpensiveIssues', () => {
    const store = mockStore({
      theme: { darkMode: false },
      issue: {
        longestOpenIssues: [],
        mostExpensiveIssues: [
          { _id: 'issue1', issueName: 'HVAC Failure', cost: 12000 },
          { _id: 'issue2', issueName: 'Foundation Crack', cost: 25000 },
        ],
        loading: false,
        error: null,
      },
    });

    render(
      <Provider store={store}>
        <LongestOpenIssuesChart bmProjects={mockProjects} />
      </Provider>,
    );

    const typeSelect = screen.getByRole('combobox', { name: 'Chart type' });
    fireEvent.change(typeSelect, { target: { value: 'Most Expensive' } });

    expect(typeSelect).toHaveValue('Most Expensive');
    expect(fetchMostExpensiveIssues).toHaveBeenCalled();

    // Chart title should be "Most Expensive Open Issues"
    expect(screen.getByTestId('chart-title')).toHaveTextContent('Most Expensive Open Issues');

    // Most expensive issues should be sorted descending by cost: Foundation Crack (25000) then HVAC Failure (12000)
    expect(screen.getByTestId('chart-labels')).toHaveTextContent('Foundation Crack, HVAC Failure');
    expect(screen.getByTestId('chart-values')).toHaveTextContent('25000, 12000');

    // Datalabel formatter test
    const formatter = renderedChartProps?.options?.plugins?.datalabels?.formatter;
    expect(formatter(25000)).toBe('$25,000');
  });

  it('renders loading state when loading is true', () => {
    const store = mockStore({
      theme: { darkMode: false },
      issue: {
        longestOpenIssues: [],
        mostExpensiveIssues: [],
        loading: true,
        error: null,
      },
    });

    render(
      <Provider store={store}>
        <LongestOpenIssuesChart bmProjects={mockProjects} />
      </Provider>,
    );

    expect(screen.getByText('Loading issues...')).toBeInTheDocument();
  });

  it('renders error message when error occurs', () => {
    const store = mockStore({
      theme: { darkMode: false },
      issue: {
        longestOpenIssues: [],
        mostExpensiveIssues: [],
        loading: false,
        error: 'Failed to fetch issues',
      },
    });

    render(
      <Provider store={store}>
        <LongestOpenIssuesChart bmProjects={mockProjects} />
      </Provider>,
    );

    expect(screen.getByText('Failed to fetch issues')).toBeInTheDocument();
  });

  it('renders "No issues found." when issues list is empty', () => {
    const store = mockStore({
      theme: { darkMode: false },
      issue: {
        longestOpenIssues: [],
        mostExpensiveIssues: [],
        loading: false,
        error: null,
      },
    });

    render(
      <Provider store={store}>
        <LongestOpenIssuesChart bmProjects={mockProjects} />
      </Provider>,
    );

    expect(screen.getByText('No issues found.')).toBeInTheDocument();
  });
});
