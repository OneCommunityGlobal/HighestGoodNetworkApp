/* eslint-disable testing-library/no-node-access */
import { act, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const getTotalOrgSummary = vi.fn();
const getTaskAndProjectStats = vi.fn();

vi.mock('~/actions/totalOrgSummary', () => ({
  getTotalOrgSummary: (...args) => getTotalOrgSummary(...args),
  getTaskAndProjectStats: (...args) => getTaskAndProjectStats(...args),
}));
vi.mock('~/utils/permissions', () => ({ default: () => () => true }));
vi.mock('html2canvas', () => ({ default: vi.fn() }));
vi.mock('jspdf', () => ({ jsPDF: vi.fn() }));

// The page's charts and cards are not under test here.
vi.mock('../AccordianWrapper/AccordianWrapper', () => ({ default: () => null }));
vi.mock('../AnniversaryCelebrated/AnniversaryCelebrated', () => ({ default: () => null }));
vi.mock('../BlueSquareStats/BlueSquareStats', () => ({ default: () => null }));
vi.mock('../GlobalVolunteerMap/GlobalVolunteerMap', () => ({ default: () => null }));
vi.mock('../HoursCompleted/HoursCompletedBarChart', () => ({ default: () => null }));
vi.mock('../NumbersVolunteerWorked/NumbersVolunteerWorked', () => ({ default: () => null }));
vi.mock('../TaskCompleted/TaskCompletedBarChart', () => ({ default: () => null }));
vi.mock('../TeamStats/TeamStats', () => ({ default: () => null }));
vi.mock('../VolunteerActivities/VolunteerActivities', () => ({ default: () => null }));
vi.mock('../VolunteerHoursDistribution/VolunteerHoursDistribution', () => ({
  default: () => null,
  mergeHoursBuckets: () => [],
}));
vi.mock('../VolunteerRolesTeamDynamics/RoleDistributionPieChart', () => ({ default: () => null }));
vi.mock('../VolunteerRolesTeamDynamics/WorkDistributionBarChart', () => ({
  default: () => null,
}));
vi.mock('../VolunteerStatus/VolunteerStatus', () => ({ default: () => null }));
vi.mock('../VolunteerStatus/VolunteerStatusChart', () => ({ default: () => null }));
vi.mock('../VolunteerTrendsLineChart/VolunteerTrendsLineChart', () => ({ default: () => null }));

// eslint-disable-next-line import/first
import TotalOrgSummary from '../TotalOrgSummary';

const store = {
  getState: () => ({
    error: null,
    loading: false,
    auth: { user: { role: 'Administrator' } },
    theme: { darkMode: false },
  }),
  subscribe: () => () => {},
  // The mocked action creators already return promises, so dispatch just passes them through.
  dispatch: action => action,
};

const renderPage = () =>
  render(
    <Provider store={store}>
      <TotalOrgSummary />
    </Provider>,
  );

const readyMarker = () => document.querySelector('[data-pdf-root]').dataset.orgSummaryReady;

describe('TotalOrgSummary report URL params', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    getTotalOrgSummary.mockResolvedValue({ data: { totalHoursWorked: {} } });
    getTaskAndProjectStats.mockResolvedValue({});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    window.history.pushState({}, '', '/');
  });

  it('requests the exact period and comparison range from the URL', async () => {
    window.history.pushState(
      {},
      '',
      '/totalorgsummary?comparison=Month%20Over%20Month&from=2026-09-27&to=2026-10-24&compareFrom=2026-08-30&compareTo=2026-09-26',
    );
    renderPage();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });

    expect(getTotalOrgSummary).toHaveBeenCalledWith(
      '2026-09-27',
      '2026-10-24',
      '2026-08-30',
      '2026-09-26',
    );
    expect(getTaskAndProjectStats).toHaveBeenCalledWith('2026-09-27', '2026-10-24');
    expect(screen.getAllByText('2026-09-27 - 2026-10-24').length).toBeGreaterThan(0);
  });

  it('marks the page ready only after the data has loaded and the charts have settled', async () => {
    window.history.pushState({}, '', '/totalorgsummary?from=2026-10-18&to=2026-10-24');
    renderPage();
    expect(readyMarker()).toBe('false');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });
    expect(readyMarker()).toBe('false');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    expect(readyMarker()).toBe('true');
  });

  it('keeps the normal previous-week default when no params are given', async () => {
    renderPage();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });

    expect(screen.getAllByText('Previous Week').length).toBeGreaterThan(0);
    const [from, to, compareFrom, compareTo] = getTotalOrgSummary.mock.calls[0];
    expect(from <= to).toBe(true);
    expect(compareFrom).toBeNull();
    expect(compareTo).toBeNull();
  });
});
