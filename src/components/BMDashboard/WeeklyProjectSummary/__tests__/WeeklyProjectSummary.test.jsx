import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { fetchBMProjects } from '../../../../actions/bmdashboard/projectActions';
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
  setErrors: error => ({ type: 'GET_ERRORS', payload: error }),
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

vi.mock('../Financials/FinancialOverview', () => ({
  default: () => <div>Financial Overview</div>,
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

  it('renders WeeklyProjectSummary without crashing', async () => {
    expect(() => {
      render(
        <Provider store={store}>
          <WeeklyProjectSummary />
        </Provider>,
      );
    }).not.toThrow();

    expect(await screen.findByTestId('weekly-project-summary-header')).toBeInTheDocument();
  });

  it('dispatches initial data-loading actions when data is empty', async () => {
    render(
      <Provider store={store}>
        <WeeklyProjectSummary />
      </Provider>,
    );

    await screen.findByTestId('weekly-project-summary-header');
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

  it('reports a failed project-list dispatch and still opens the dashboard', async () => {
    const error = new Error('Project list unavailable');
    fetchBMProjects.mockReturnValueOnce(() => Promise.reject(error));

    render(
      <Provider store={store}>
        <WeeklyProjectSummary />
      </Provider>,
    );

    expect(await screen.findByTestId('weekly-project-summary-header')).toBeInTheDocument();
    expect(store.getActions()).toContainEqual({ type: 'GET_ERRORS', payload: error });
  });

  it('keeps expenditure filters independent across collapse and reopen in dark mode', async () => {
    const state = store.getState();
    state.theme.darkMode = true;
    state.bmProjects = [
      { _id: 'new', name: 'New project', createdAt: '2026-10-01' },
      { _id: 'edited', name: 'Edited project', dateCreated: '2026-01-01', updatedAt: '2026-10-02' },
    ];
    const get = vi.spyOn(axios, 'get').mockResolvedValue({ data: { actual: [], planned: [] } });
    try {
      render(
        <Provider store={store}>
          <WeeklyProjectSummary />
        </Provider>,
      );

      const tracking = await screen.findByRole('button', { name: /^Financials Tracking/ });
      fireEvent.click(tracking);
      const [actual, planned] = await screen.findAllByRole('combobox', { name: 'Project' });
      expect(screen.getByTestId('weekly-project-summary-container')).toHaveClass('dark-mode');
      expect(actual).toHaveValue('edited');
      expect(planned).toHaveValue('edited');
      await waitFor(() =>
        expect(get).toHaveBeenCalledWith(expect.stringMatching(/\/expenditure\/edited\/pie$/)),
      );
      expect(await screen.findAllByText('No expenditure data for this project')).toHaveLength(2);

      fireEvent.change(actual, { target: { value: 'all' } });
      expect(actual).toHaveValue('all');
      expect(planned).toHaveValue('edited');
      await waitFor(() =>
        expect(get).toHaveBeenCalledWith(expect.stringMatching(/\/expenditure\/all\/pie$/)),
      );

      fireEvent.click(tracking);
      expect(screen.queryByRole('combobox', { name: 'Project' })).not.toBeInTheDocument();
      fireEvent.click(tracking);
      const [reopenedActual, reopenedPlanned] = await screen.findAllByRole('combobox', {
        name: 'Project',
      });
      expect(reopenedActual).toHaveValue('all');
      expect(reopenedPlanned).toHaveValue('edited');
      expect(await screen.findAllByText('No expenditure data for this project')).toHaveLength(2);
    } finally {
      get.mockRestore();
    }
  });
});
