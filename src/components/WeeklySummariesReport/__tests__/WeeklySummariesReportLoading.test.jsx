import React from 'react';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import axios from 'axios';
import '@testing-library/jest-dom/extend-expect';
import WeeklySummariesReport from '../WeeklySummariesReport';

// Covers the first load of the page: the default tab has to show a loading state
// while its summaries are fetched, not "No data available", and then show the data
// without the user having to switch tabs.

vi.mock('axios', () => ({
  __esModule: true,
  default: {
    defaults: { headers: { post: {} } },
    get: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
  },
}));

vi.mock('../../../utils/permissions', () => ({
  __esModule: true,
  default: () => () => true,
}));

vi.mock('../../../actions/badgeManagement', () => ({
  fetchAllBadges: () => () => Promise.resolve(200),
}));

vi.mock('../../../actions/timeOffRequestAction', () => ({
  getAllTimeOffRequests: () => () => Promise.resolve(),
}));

vi.mock('../../../actions/information', () => ({
  getInfoCollections: () => () => Promise.resolve([]),
}));

vi.mock('../../../actions/savedFilterActions', () => ({
  createSavedFilter: () => () => Promise.resolve(),
  deleteSavedFilter: () => () => Promise.resolve(),
  updateSavedFilter: () => () => Promise.resolve(),
  getSavedFilters: () => () => Promise.resolve(),
  updateSavedFiltersForTeamCodeChange: () => () => Promise.resolve(),
  updateSavedFiltersForIndividualTeamCodeChange: () => () => Promise.resolve(),
}));

vi.mock('../../../actions/weeklySummariesFilterAction', () => ({
  useGetWeeklySummariesFiltersQuery: () => ({ data: [], isLoading: false, refetch: vi.fn() }),
  useDeleteWeeklySummariesFilterMutation: () => [vi.fn()],
  useUpdateFiltersWithIndividualCodesChangeMutation: () => [vi.fn()],
  useUpdateFiltersWithReplacedTeamCodesMutation: () => [vi.fn()],
}));

vi.mock('../../../utils/questionnaireCompletion', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...actual,
    subscribeToCompletedQuestionnaireUserIds: vi.fn(() => () => {}),
  };
});

vi.mock('../../common/SkeletonLoading', () => ({
  __esModule: true,
  default: () => <div data-testid="page-skeleton" />,
}));

vi.mock('../FormattedReport', () => ({
  __esModule: true,
  default: ({ summaries }) => (
    <ul data-testid="formatted-report">
      {summaries.map(s => (
        <li key={s._id}>{`${s.firstName} ${s.lastName}`}</li>
      ))}
    </ul>
  ),
}));

vi.mock('../components/CreateFilterModal', () => ({ __esModule: true, default: () => null }));
vi.mock('../components/UpdateFilterModal', () => ({ __esModule: true, default: () => null }));
vi.mock('../components/SelectFilterModal', () => ({ __esModule: true, default: () => null }));
vi.mock('../GeneratePdfReport', () => ({ __esModule: true, default: () => null }));
vi.mock('../TeamChart', () => ({ __esModule: true, default: () => null }));
vi.mock('../SelectTeamPieChart', () => ({ __esModule: true, default: () => null }));

const summary = {
  _id: 'user-1',
  firstName: 'Ada',
  lastName: 'Lovelace',
  isActive: true,
  teamCode: 'ABC123',
  role: 'Volunteer',
  totalSeconds: [0, 3600, 0, 0],
  weeklycommittedHours: 10,
  weeklycommittedHoursHistory: [],
  weeklySummaries: [],
  filterColor: [],
};

const makeStore = () =>
  createStore(
    () => ({
      auth: { user: { _id: 'owner-1', role: 'Owner', permissions: [] } },
      weeklySummariesReport: { summaries: [], loading: false, error: null },
      badge: { allBadgeData: [] },
      infoCollections: { infos: [] },
      savedFilters: { savedFilters: [], loading: false, error: null },
      theme: { darkMode: false },
      timeOffRequests: { requests: {} },
    }),
    applyMiddleware(thunk),
  );

const renderPage = () =>
  render(
    <Provider store={makeStore()}>
      <WeeklySummariesReport />
    </Provider>,
  );

describe('WeeklySummariesReport first load', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('shows a loading state, not "No data", while the default tab is fetched', async () => {
    let resolveReport;
    axios.get.mockImplementation(
      () =>
        new Promise(resolve => {
          resolveReport = resolve;
        }),
    );

    renderPage();

    // Wait for the mount effects to send the request; it stays pending here.
    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('reports/weeklysummaries'),
      expect.objectContaining({ params: expect.objectContaining({ week: 1 }) }),
    );
    expect(screen.getByTestId('page-skeleton')).toBeInTheDocument();
    expect(screen.queryByText('No data available for this tab.')).not.toBeInTheDocument();

    await act(async () => {
      resolveReport({ status: 200, data: [summary] });
    });

    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.queryByTestId('page-skeleton')).not.toBeInTheDocument();
    expect(screen.getByTestId('Last Week')).toHaveClass('active');
  });

  it('shows the tab spinner, not the page skeleton, when switching to an unloaded tab', async () => {
    axios.get.mockResolvedValueOnce({ status: 200, data: [summary] });
    renderPage();
    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument();

    axios.get.mockImplementationOnce(() => new Promise(() => {}));
    fireEvent.click(screen.getByTestId('This Week'));

    expect(await screen.findByText('Loading data...')).toBeInTheDocument();
    expect(screen.queryByTestId('page-skeleton')).not.toBeInTheDocument();
    expect(screen.getByTestId('This Week')).toHaveClass('active');
  });

  it('shows "No data available" only after the fetch returns nothing', async () => {
    axios.get.mockResolvedValue({ status: 200, data: [] });

    renderPage();

    expect(await screen.findByText('No data available for this tab.')).toBeInTheDocument();
    expect(screen.queryByTestId('page-skeleton')).not.toBeInTheDocument();
  });
});
