import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import FinancialOverview, { financialOverviewButtons } from '../FinancialOverview';

vi.mock('axios');

const PARAMS = { startDate: '2026-10-26', endDate: '2026-11-01' };
const unavailable = {
  value: null,
  unit: 'USD',
  comparisonType: 'UNAVAILABLE',
  unavailableReason: 'No budget yet.',
};
const cost = (value, percentageChange) => ({
  value,
  unit: 'USD',
  comparisonType: 'PERIOD_COMPARABLE',
  percentageChange,
});

function mockMetrics() {
  axios.get.mockResolvedValue({
    data: {
      current: {
        metrics: {
          totalProjectedCost: unavailable,
          predictedCostOverrun: unavailable,
          totalProjectCost: cost(63234, -0.01),
          totalMaterialCost: cost(53678, 0.16),
          totalLaborCost: cost(9556, -0.45),
          totalEquipmentCost: {
            ...unavailable,
            unavailableReason: 'No data exists for the selected period.',
          },
        },
      },
    },
  });
}

describe('FinancialOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the six cards in the Figma order', async () => {
    mockMetrics();
    render(<FinancialOverview requestParams={PARAMS} comparisonPeriodFilter="No Comparison" />);

    expect(await screen.findByText('$63,234')).toBeInTheDocument();
    expect(financialOverviewButtons.map(button => button.title)).toEqual([
      'Total Projected Cost',
      'Predicted Cost Overrun',
      'Total Project Cost',
      'Total Material Cost',
      'Total Labor Cost',
      'Total Equipment Cost',
    ]);
    financialOverviewButtons.forEach(button => {
      expect(screen.getByText(button.title)).toBeInTheDocument();
    });
    expect(screen.getByText('$53,678')).toBeInTheDocument();
    expect(screen.getByText('$9,556')).toBeInTheDocument();
    expect(screen.getAllByText('N/A')).toHaveLength(3);
    expect(screen.queryByText(/week over week/)).not.toBeInTheDocument();
  });

  it('loads the page filters from the financial overview endpoint', async () => {
    mockMetrics();
    render(<FinancialOverview requestParams={PARAMS} comparisonPeriodFilter="No Comparison" />);

    await screen.findByText('$63,234');
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/bm/weekly-project-summary/financial-overview'),
      { params: PARAMS },
    );
  });

  it('adds a week over week line under each card', async () => {
    mockMetrics();
    render(
      <FinancialOverview
        requestParams={{
          ...PARAMS,
          comparisonStartDate: '2026-10-19',
          comparisonEndDate: '2026-10-25',
        }}
        comparisonPeriodFilter="Week Over Week"
      />,
    );

    expect(await screen.findByText('+16% week over week')).toBeInTheDocument();
    expect(screen.getByText('-1% week over week')).toBeInTheDocument();
    expect(screen.getByText('-45% week over week')).toBeInTheDocument();
    expect(screen.getAllByText('No week over week comparison available')).toHaveLength(3);
  });

  it('explains why a card has no value', async () => {
    mockMetrics();
    render(<FinancialOverview requestParams={PARAMS} comparisonPeriodFilter="No Comparison" />);

    expect(await screen.findAllByRole('button', { name: 'No budget yet.' })).toHaveLength(2);
    expect(
      screen.getByRole('button', { name: 'No data exists for the selected period.' }),
    ).toBeInTheDocument();
  });

  it('shows an error when the overview cannot load', async () => {
    axios.get.mockRejectedValue({ response: { data: { message: 'endDate is required' } } });
    render(<FinancialOverview requestParams={PARAMS} comparisonPeriodFilter="Week Over Week" />);

    expect(await screen.findByRole('alert')).toHaveTextContent('endDate is required');
    expect(screen.queryByText(/week over week/)).not.toBeInTheDocument();
  });

  it('waits for a date range before loading', async () => {
    render(<FinancialOverview requestParams={null} comparisonPeriodFilter="No Comparison" />);

    await waitFor(() => expect(screen.getAllByText('N/A')).toHaveLength(6));
    expect(axios.get).not.toHaveBeenCalled();
  });
});
