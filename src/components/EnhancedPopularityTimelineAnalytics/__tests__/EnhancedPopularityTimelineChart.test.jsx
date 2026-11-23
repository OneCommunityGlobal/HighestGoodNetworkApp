import { render, screen, fireEvent, within } from '@testing-library/react';
import { useSelector, useDispatch } from 'react-redux';
import EnhancedPopularityTimelineChart from '../EnhancedPopularityTimelineChart';
import {
  fetchEnhancedPopularityData,
  fetchEnhancedRoles,
} from '../../../actions/EnhancedPopularityAnalytics/EnhancedPopularityActions';

vi.mock('react-redux', () => ({
  useSelector: vi.fn(),
  useDispatch: vi.fn(),
}));

vi.mock('../../../actions/EnhancedPopularityAnalytics/EnhancedPopularityActions', () => ({
  fetchEnhancedPopularityData: vi.fn(params => ({ type: 'MOCK_FETCH_DATA', params })),
  fetchEnhancedRoles: vi.fn(token => ({ type: 'MOCK_FETCH_ROLES', token })),
}));

const buildRoleGroup = (role, { hitsByMonth, applicationsByMonth, conversionRate = 0.2 }) => ({
  role,
  summary: {
    popularityScore: hitsByMonth.reduce((a, b) => a + b, 0),
    totalHits: hitsByMonth.reduce((a, b) => a + b, 0),
    totalApplications: applicationsByMonth.reduce((a, b) => a + b, 0),
    avgConversionRate: conversionRate,
  },
  data: hitsByMonth.map((hits, i) => ({
    month: `Month ${i + 1}`,
    timestamp: `2026-0${i + 1}-01`,
    hitsCount: hits,
    applicationsCount: applicationsByMonth[i],
    conversionRate,
  })),
});

const defaultPopularityData = {
  data: [
    buildRoleGroup('Developer', { hitsByMonth: [10, 20], applicationsByMonth: [2, 4] }),
    buildRoleGroup('Designer', { hitsByMonth: [3, 5], applicationsByMonth: [1, 1] }),
  ],
};

const defaultRolesData = {
  data: [
    { role: 'Developer', totalHits: 30, totalApplications: 6 },
    { role: 'Designer', totalHits: 8, totalApplications: 2 },
  ],
};

const buildState = ({
  darkMode = false,
  popularityData = defaultPopularityData,
  dataLoading = false,
  queryError = null,
  rolesData = defaultRolesData,
  rolesLoading = false,
  rolesError = null,
} = {}) => ({
  theme: { darkMode },
  enhancedPopularityAnalytics: { data: popularityData, loading: dataLoading, error: queryError },
  enhancedPopularityRoles: { data: rolesData, isLoading: rolesLoading, error: rolesError },
});

let dispatch;

const setupSelector = state => {
  useSelector.mockImplementation(selectorFn => selectorFn(state));
};

beforeEach(() => {
  vi.clearAllMocks();
  dispatch = vi.fn();
  useDispatch.mockReturnValue(dispatch);
  localStorage.setItem('token', 'test-token');
});

afterEach(() => {
  localStorage.clear();
});

describe('EnhancedPopularityTimelineChart', () => {
  it('shows a loading message while roles or popularity data are loading', () => {
    setupSelector(buildState({ dataLoading: true }));
    render(<EnhancedPopularityTimelineChart />);

    expect(screen.getByText('Loading enhanced analytics data...')).toBeInTheDocument();
  });

  it('shows an error message with a retry button when the popularity data request fails', () => {
    setupSelector(buildState({ queryError: { message: 'Failed to fetch data' } }));

    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, reload: reloadMock },
    });

    render(<EnhancedPopularityTimelineChart />);

    expect(
      screen.getByText('Error loading enhanced analytics data: Failed to fetch data'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText('Retry'));
    expect(reloadMock).toHaveBeenCalled();
  });

  it('shows a no-data message when there is no chart data to plot', () => {
    setupSelector(buildState({ popularityData: { data: [] } }));
    render(<EnhancedPopularityTimelineChart />);

    expect(
      screen.getByText('No chart data available. Please check your filters or data source.'),
    ).toBeInTheDocument();
  });

  it('dispatches fetchEnhancedRoles and fetchEnhancedPopularityData on mount using stored token and default filters', () => {
    setupSelector(buildState());
    render(<EnhancedPopularityTimelineChart />);

    expect(fetchEnhancedRoles).toHaveBeenCalledWith('test-token');
    expect(fetchEnhancedPopularityData).toHaveBeenCalledWith({
      range: '6months',
      roles: ['All Roles'],
      includeLowVolume: true,
      token: 'test-token',
    });
    expect(dispatch).toHaveBeenCalledWith({ type: 'MOCK_FETCH_ROLES', token: 'test-token' });
  });

  it('renders a summary card per role with its hits, applications, and conversion rate', () => {
    setupSelector(buildState());
    render(<EnhancedPopularityTimelineChart />);

    const developerCard = screen.getByRole('button', { name: /Developer/ });
    expect(within(developerCard).getByText('30')).toBeInTheDocument();
    expect(within(developerCard).getByText('6')).toBeInTheDocument();
    expect(within(developerCard).getByText('20.0%')).toBeInTheDocument();
  });

  it('changing the time range dispatches fetchEnhancedPopularityData with the new range', () => {
    setupSelector(buildState());
    render(<EnhancedPopularityTimelineChart />);

    fireEvent.change(screen.getByLabelText('Time Range'), { target: { value: '3months' } });

    expect(fetchEnhancedPopularityData).toHaveBeenLastCalledWith(
      expect.objectContaining({ range: '3months' }),
    );
  });

  it('highlights a role when its summary card is clicked and clears it via Reset Highlight', () => {
    setupSelector(buildState());
    render(<EnhancedPopularityTimelineChart />);

    const developerCard = screen.getByRole('button', { name: /Developer/ });
    const resetHighlightButton = screen.getByText('Reset Highlight');

    expect(resetHighlightButton).toBeDisabled();

    fireEvent.click(developerCard);
    expect(developerCard).toHaveAttribute('aria-pressed', 'true');
    expect(resetHighlightButton).not.toBeDisabled();

    fireEvent.click(resetHighlightButton);
    expect(developerCard).toHaveAttribute('aria-pressed', 'false');
    expect(resetHighlightButton).toBeDisabled();
  });

  it('toggles the Show Low Volume checkbox', () => {
    setupSelector(buildState());
    render(<EnhancedPopularityTimelineChart />);

    const checkbox = screen.getByLabelText('Show Low Volume');
    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('Reset All Filters restores the default time range, low-volume toggle, and clears any highlight', () => {
    setupSelector(buildState());
    render(<EnhancedPopularityTimelineChart />);

    fireEvent.change(screen.getByLabelText('Time Range'), { target: { value: '12months' } });
    fireEvent.click(screen.getByLabelText('Show Low Volume'));
    fireEvent.click(screen.getByRole('button', { name: /Developer/ }));

    fireEvent.click(screen.getByText('Reset All Filters'));

    expect(screen.getByLabelText('Time Range')).toHaveValue('6months');
    expect(screen.getByLabelText('Show Low Volume')).toBeChecked();
    expect(screen.getByRole('button', { name: /Developer/ })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('applies the dark theme classes when darkMode is true', () => {
    setupSelector(buildState({ darkMode: true }));
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const { container } = render(<EnhancedPopularityTimelineChart />);

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.querySelector('[class*="dark-screen"]')).toBeInTheDocument();
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.querySelector('[class*="dark-theme"]')).toBeInTheDocument();
  });
});
