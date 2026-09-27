import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import WeeklyProjectSummary from '../WeeklyProjectSummary';

vi.mock('../../../../actions/bmdashboard/materialsActions', () => ({
  fetchAllMaterials: vi.fn(() => ({
    type: 'FETCH_ALL_MATERIALS',
  })),
}));

vi.mock('../../../../actions/bmdashboard/projectActions', () => ({
  fetchBMProjects: vi.fn(() => ({
    type: 'FETCH_BM_PROJECTS',
  })),
}));

// Keep this regression test focused on WeeklyProjectSummary itself.
// The child visualizations have their own rendering/data requirements.
vi.mock('../WeeklyProjectSummaryHeader', () => ({
  default: () => <div data-testid="weekly-project-summary-header">Weekly Project Summary</div>,
}));

vi.mock('../ProjectRiskProfileOverview', () => ({
  default: () => <div>Risk Profile</div>,
}));

vi.mock('../IssuesBreakdownChart', () => ({
  default: () => <div>Issues Breakdown</div>,
}));

vi.mock('../GroupedBarGraphInjurySeverity/InjuryCategoryBarChart', () => ({
  default: () => <div>Injury Category</div>,
}));

vi.mock('../Tools/ToolsHorizontalBarChart', () => ({
  default: () => <div>Tools Chart</div>,
}));

vi.mock('../Financials/ExpenseBarChart', () => ({
  default: () => <div>Expense Chart</div>,
}));

vi.mock('../Financials/CostVarianceTrendGraph', () => ({
  default: () => <div>Cost Variance</div>,
}));

vi.mock('../Financials/CostBreakDown/CostBreakDown', () => ({
  default: () => <div>Cost Breakdown</div>,
}));

vi.mock('../ExpenditureChart/FinancialsTrackingSection', () => ({
  default: () => <div>Financial Tracking</div>,
}));

vi.mock('../../InteractiveMap/InteractiveMap', () => ({
  default: () => <div>Interactive Map</div>,
}));

vi.mock('../Financials/LossTrackingLineCharts/LossTrackingLineChart', () => ({
  default: () => <div>Loss Tracking</div>,
}));

vi.mock('../SupplierPerformanceGraph.jsx', () => ({
  default: () => <div>Supplier Performance</div>,
}));

vi.mock('../MostFrequentKeywords/MostFrequentKeywords', () => ({
  default: () => <div>Most Frequent Keywords</div>,
}));

vi.mock('../../LessonsLearnt/LessonsLearntChart', () => ({
  default: () => <div>Lessons Learnt</div>,
}));

vi.mock('../DistributionLaborHours/DistributionLaborHours', () => ({
  default: () => <div>Distribution Labor Hours</div>,
}));

vi.mock('../ActualVsPlannedCost/ActualVsPlannedCost', () => ({
  default: () => <div>Actual vs Planned Cost</div>,
}));

vi.mock('../MaterialConsumption/MaterialConsumption', () => ({
  MaterialConsumptionCards: () => <div>Material Consumption</div>,
}));

vi.mock('../Tools/ToolsStoppageHorizontalBarChart/ToolsStoppageHorizontalBarChart', () => ({
  default: () => <div>Tools Stoppage</div>,
}));

vi.mock('../ToolStatusDonutChart/ToolStatusDonutChart', () => ({
  default: () => <div>Tool Status</div>,
}));

vi.mock('../../Injuries/InjurySeverityChart', () => ({
  default: () => <div>Injury Severity</div>,
}));

vi.mock('../CostPredictionChart', () => ({
  default: () => <div>Cost Prediction</div>,
}));

vi.mock('../PaidLaborCost/PaidLaborCost', () => ({
  default: () => <div>Paid Labor Cost</div>,
}));

vi.mock('../../Issues/LongestOpenIssuesChart', () => ({
  default: () => <div>Issues Chart</div>,
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('WeeklyProjectSummary regression tests', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      materials: {
        materialslist: [],
      },
      bmProjects: [],
      theme: {
        darkMode: false,
      },
      weeklyProjectSummary: {
        projectFilter: '',
        dateRangeFilter: '',
      },
    });
  });

  it('renders WeeklyProjectSummary without crashing', () => {
    expect(() => {
      render(
        <Provider store={store}>
          <WeeklyProjectSummary />
        </Provider>,
      );
    }).not.toThrow();

    expect(screen.getByTestId('weekly-project-summary-header')).toBeInTheDocument();
  });

  it('dispatches initial data-loading actions when data is empty', () => {
    render(
      <Provider store={store}>
        <WeeklyProjectSummary />
      </Provider>,
    );

    const actions = store.getActions();

    expect(actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'FETCH_ALL_MATERIALS',
        }),
        expect.objectContaining({
          type: 'FETCH_BM_PROJECTS',
        }),
      ]),
    );
  });
});
