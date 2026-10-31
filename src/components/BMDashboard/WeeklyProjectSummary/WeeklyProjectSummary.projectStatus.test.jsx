import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import WeeklyProjectSummary from './WeeklyProjectSummary';
import {
  fetchWeeklyProjectSummaryProjectStatus,
  getWeeklyProjectSummaryProjectStatusRequestKey,
} from '../../../actions/bmdashboard/weeklyProjectSummaryActions';

const passthroughRequestKey = params => {
  const queryParams = new URLSearchParams();
  Object.entries(params || {})
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .forEach(([key, value]) => queryParams.append(key, value));

  return queryParams.toString();
};

vi.mock('../../../actions/bmdashboard/weeklyProjectSummaryActions', () => ({
  fetchWeeklyProjectSummaryProjectStatus: vi.fn(params => ({
    type: 'FETCH_WEEKLY_PROJECT_SUMMARY_PROJECT_STATUS',
    params,
  })),
  getWeeklyProjectSummaryProjectStatusRequestKey: vi.fn(params => passthroughRequestKey(params)),
}));

vi.mock('../../../actions/bmdashboard/materialsActions', () => ({
  fetchAllMaterials: vi.fn(() => ({ type: 'FETCH_ALL_MATERIALS' })),
}));

vi.mock('../../../actions/bmdashboard/projectActions', () => ({
  fetchBMProjects: vi.fn(() => ({ type: 'FETCH_BM_PROJECTS' })),
}));

vi.mock('html2canvas', () => ({ default: vi.fn() }));
vi.mock('jspdf', () => ({ jsPDF: vi.fn() }));
vi.mock('react-toastify', () => ({
  toast: {
    info: vi.fn(),
    dismiss: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('./WeeklyProjectSummaryHeader', () => ({ default: () => <div>Header</div> }));
vi.mock('./PaidLaborCost/PaidLaborCost', () => ({ default: () => <div>Paid Labor Cost</div> }));
vi.mock('../Issues/LongestOpenIssuesChart', () => ({ default: () => <div>Issues Chart</div> }));
vi.mock('./ProjectRiskProfileOverview', () => ({ default: () => <div>Risk Profile</div> }));
vi.mock('./IssuesBreakdownChart', () => ({ default: () => <div>Issues Breakdown</div> }));
vi.mock('./GroupedBarGraphInjurySeverity/InjuryCategoryBarChart', () => ({
  default: () => <div>Injury Category</div>,
}));
vi.mock('./Tools/ToolsHorizontalBarChart', () => ({ default: () => <div>Tools Chart</div> }));
vi.mock('./Financials/ExpenseBarChart', () => ({ default: () => <div>Expense Chart</div> }));
vi.mock('./Financials/CostVarianceTrendGraph', () => ({
  default: () => <div>Cost Variance</div>,
}));
vi.mock('./Financials/CostBreakDown/CostBreakDown', () => ({
  default: () => <div>Cost Breakdown</div>,
}));
vi.mock('./ExpenditureChart/FinancialsTrackingSection', () => ({
  default: () => <div>Financials Tracking</div>,
}));
vi.mock('../InteractiveMap/InteractiveMap', () => ({ default: () => <div>Interactive Map</div> }));
vi.mock('./Financials/LossTrackingLineCharts/LossTrackingLineChart', () => ({
  default: () => <div>Loss Tracking</div>,
}));
vi.mock('./SupplierPerformanceGraph.jsx', () => ({
  default: () => <div>Supplier Performance</div>,
}));
vi.mock('./MostFrequentKeywords/MostFrequentKeywords', () => ({
  default: () => <div>Most Frequent Keywords</div>,
}));
vi.mock('../LessonsLearnt/LessonsLearntChart', () => ({
  default: () => <div>Lessons Learnt</div>,
}));
vi.mock('./DistributionLaborHours/DistributionLaborHours', () => ({
  default: () => <div>Distribution Labor Hours</div>,
}));
vi.mock('./ActualVsPlannedCost/ActualVsPlannedCost', () => ({
  default: () => <div>Actual Vs Planned</div>,
}));
vi.mock('./MaterialConsumption/MaterialConsumption', () => ({
  MaterialConsumptionCards: () => <div>Material Consumption</div>,
}));
vi.mock('./Tools/ToolsStoppageHorizontalBarChart/ToolsStoppageHorizontalBarChart', () => ({
  default: () => <div>Tools Stoppage</div>,
}));
vi.mock('./ToolStatusDonutChart/ToolStatusDonutChart', () => ({
  default: () => <div>Tool Status</div>,
}));
vi.mock('../Injuries/InjurySeverityChart', () => ({
  default: () => <div>Injury Severity</div>,
}));
vi.mock('./CostPredictionChart', () => ({ default: () => <div>Cost Prediction</div> }));

const mockStore = configureMockStore([]);

const currentParams = {
  startDate: '2026-09-13',
  endDate: '2026-09-19',
  projectId: 'project-1',
  comparisonStartDate: '2026-08-13',
  comparisonEndDate: '2026-08-19',
};

const currentRequestKey = passthroughRequestKey(currentParams);

const projectStatusData = {
  current: {
    metrics: {
      completedProjects: {
        value: 7,
        unit: 'count',
        comparisonType: 'PERIOD_COMPARABLE',
        percentageChange: 0.16,
      },
    },
  },
};

const createState = weeklyProjectSummaryOverrides => ({
  materials: { materialslist: [{ _id: 'material-1' }] },
  bmProjects: [{ _id: 'project-1', name: 'One Community' }],
  theme: { darkMode: false },
  weeklyProjectSummary: {
    projectFilter: 'One Community',
    dateRangeFilter: 'Sep 13, 26 - Sep 19, 26',
    comparisonPeriodFilter: 'Aug 13, 26 - Aug 19, 26',
    projectStatusData,
    projectStatusLoading: false,
    projectStatusError: null,
    projectStatusDataRequestKey: currentRequestKey,
    projectStatusErrorRequestKey: null,
    ...weeklyProjectSummaryOverrides,
  },
});

const renderWithState = state => {
  const store = mockStore(state);
  const view = render(
    <Provider store={store}>
      <WeeklyProjectSummary />
    </Provider>,
  );

  fireEvent.click(screen.getAllByRole('button', { name: /Project Status/ })[0]);
  // Comparison is now opt-in via this checkbox (separate from which period is selected in
  // the header dropdown) — all the scenarios below exercise comparison-enabled behavior.
  fireEvent.click(screen.getByRole('checkbox', { name: /Compare with Previous Week/ }));
  return { ...view, store };
};

describe('WeeklyProjectSummary Project Status request state', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders API-backed comparison text only when the data matches the current filters', () => {
    renderWithState(createState());

    expect(screen.getByText('+16% vs Aug 13, 26 - Aug 19, 26')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows loading and suppresses stale comparison text when filters change before useEffect dispatches', () => {
    renderWithState(
      createState({
        projectStatusDataRequestKey: 'endDate=2026-08-19&startDate=2026-08-13',
      }),
    );

    expect(screen.getByText('Loading Project Status data...')).toBeInTheDocument();
    expect(screen.queryByText('+16% vs Aug 13, 26 - Aug 19, 26')).not.toBeInTheDocument();
  });

  it('shows the latest request error and suppresses stale comparison text', () => {
    renderWithState(
      createState({
        projectStatusData: null,
        projectStatusDataRequestKey: null,
        projectStatusError: new Error('Latest request failed'),
        projectStatusErrorRequestKey: currentRequestKey,
      }),
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Latest request failed');
    expect(screen.queryByText('+16% vs Aug 13, 26 - Aug 19, 26')).not.toBeInTheDocument();
  });

  it('dispatches a new Project Status request when comparison filters change rapidly', async () => {
    const { rerender } = renderWithState(
      createState({ comparisonPeriodFilter: 'Sep 06, 26 - Sep 12, 26' }),
    );

    await waitFor(() =>
      expect(fetchWeeklyProjectSummaryProjectStatus).toHaveBeenCalledWith({
        startDate: '2026-09-13',
        endDate: '2026-09-19',
        projectId: 'project-1',
        comparisonStartDate: '2026-09-06',
        comparisonEndDate: '2026-09-12',
      }),
    );

    const nextComparisonState = createState({ comparisonPeriodFilter: 'Aug 13, 26 - Aug 19, 26' });
    rerender(
      <Provider store={mockStore(nextComparisonState)}>
        <WeeklyProjectSummary />
      </Provider>,
    );

    await waitFor(() =>
      expect(fetchWeeklyProjectSummaryProjectStatus).toHaveBeenCalledWith(currentParams),
    );
    expect(getWeeklyProjectSummaryProjectStatusRequestKey).toHaveBeenCalled();
  });
});
