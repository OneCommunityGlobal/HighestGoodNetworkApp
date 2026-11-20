import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { describe, expect, it } from 'vitest';
import CostBreakDownForTest, { buildCostBreakdownChartData } from '../CostBreakDown';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  PieChart: ({ children }) => <svg>{children}</svg>,
  Pie: ({ data, children }) => (
    <g data-testid="pie-chart">
      {data.map(item => (
        <g key={item.name} data-testid="pie-slice">
          {item.name}: {item.value}
        </g>
      ))}
      {children}
    </g>
  ),
  Cell: () => null,
  Tooltip: () => null,
}));

const mockStore = configureMockStore([thunk]);

const REQUEST_PARAMS = { startDate: '2026-10-26', endDate: '2026-11-01' };
const cost = value => ({ value, unit: 'USD', comparisonType: 'PERIOD_COMPARABLE' });

const renderCostBreakdown = ({ requestState, financialMetrics = {} }) => {
  const store = mockStore({
    theme: { darkMode: false },
    costBreakdown: {
      detailLoading: false,
      detailData: null,
      detailError: null,
    },
  });

  return render(
    <Provider store={store}>
      <CostBreakDownForTest
        requestParams={REQUEST_PARAMS}
        financialMetrics={financialMetrics}
        requestState={requestState}
      />
    </Provider>,
  );
};

describe('buildCostBreakdownChartData', () => {
  it('uses the shared financial metrics, including equipment, for every category slice', () => {
    const chartData = buildCostBreakdownChartData({
      totalLaborCost: cost(9556),
      totalMaterialCost: cost(53678),
      totalEquipmentCost: cost(277153),
    });

    expect(chartData.map(item => [item.name, item.value])).toEqual([
      ['Total Cost of Labor', 9556],
      ['Total Cost of Materials', 53678],
      ['Total Cost of Equipment', 277153],
    ]);
  });

  it('omits unavailable or non-positive categories instead of turning them into zeroes', () => {
    const chartData = buildCostBreakdownChartData({
      totalLaborCost: cost(0),
      totalMaterialCost: { value: null, comparisonType: 'UNAVAILABLE' },
      totalEquipmentCost: cost(100),
    });

    expect(chartData.map(item => item.name)).toEqual(['Total Cost of Equipment']);
  });
});

describe('CostBreakDown request states', () => {
  it('shows loading while the shared Financial Overview request is pending', () => {
    renderCostBreakdown({ requestState: { status: 'loading', error: null } });

    expect(screen.getByRole('status')).toHaveTextContent('Loading cost data...');
    expect(screen.queryByText('No cost data available')).not.toBeInTheDocument();
  });

  it('shows the chart when the shared request succeeds with cost data', () => {
    renderCostBreakdown({
      requestState: { status: 'success', error: null },
      financialMetrics: {
        totalLaborCost: cost(9556),
        totalMaterialCost: cost(53678),
      },
    });

    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getAllByTestId('pie-slice')).toHaveLength(2);
    expect(screen.queryByText('Loading cost data...')).not.toBeInTheDocument();
  });

  it('shows an empty state when the successful request has no available cost data', () => {
    renderCostBreakdown({
      requestState: { status: 'success', error: null },
      financialMetrics: {},
    });

    expect(screen.getByText('No cost data available')).toBeInTheDocument();
    expect(screen.queryByText('Loading cost data...')).not.toBeInTheDocument();
    expect(screen.queryByTestId('pie-chart')).not.toBeInTheDocument();
  });

  it('shows a clear request error instead of remaining in the loading state', () => {
    renderCostBreakdown({
      requestState: { status: 'error', error: null },
    });

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Unable to load cost data for the selected filters.',
    );
    expect(screen.queryByText('Loading cost data...')).not.toBeInTheDocument();
    expect(screen.queryByText('No cost data available')).not.toBeInTheDocument();
  });
});
