import { cloneElement } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import createMockStore from 'redux-mock-store';
import axios from 'axios';
import CostBreakDown from '../CostBreakDown';

vi.mock('axios');

vi.mock('../../../../../../actions/bmdashboard/costBreakdownActions', () => ({
  fetchCostBreakdown: vi.fn(() => ({ type: 'FETCH_COST_BREAKDOWN' })),
  fetchCostDetail: vi.fn(() => ({ type: 'FETCH_COST_DETAIL' })),
  clearCostDetail: vi.fn(() => ({ type: 'CLEAR_COST_DETAIL' })),
}));

// jsdom has no layout, so give the chart a fixed size instead of a responsive one
vi.mock('recharts', async () => {
  const actual = await vi.importActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }) => cloneElement(children, { width: 600, height: 320 }),
  };
});

const breakdown = (labor, materials, equipment) => ({
  project: 'All Projects',
  totalCost: labor + materials + equipment,
  breakdown: [
    { category: 'Total Cost of Labor', amount: labor },
    { category: 'Total Cost of Materials', amount: materials },
    { category: 'Total Cost of Equipment', amount: equipment },
  ],
});

const laborDetail = {
  breakdown: [
    {
      category: 'Total Cost of Labor',
      amount: 1000,
      projectBreakdown: [
        { projectId: 'p3', projectName: 'Building 3', amount: 600, percentage: 60 },
        { projectId: null, projectName: 'Unassigned project', amount: 400, percentage: 40 },
      ],
    },
  ],
};

const renderChart = ({ data, detailData = null, darkMode = false } = {}) => {
  const store = createMockStore([])({
    theme: { darkMode },
    costBreakdown: {
      loading: false,
      data,
      error: null,
      detailLoading: false,
      detailData,
      detailError: null,
    },
  });
  return render(
    <Provider store={store}>
      <CostBreakDown />
    </Provider>,
  );
};

describe('CostBreakDown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockResolvedValue({ data: [] });
  });

  it('labels each slice with its amount and share without hovering', () => {
    renderChart({ data: breakdown(1109662, 400000, 231030) });

    expect(screen.getByText('$1.1M · 63.7%')).toBeInTheDocument();
    expect(screen.getByText('$400K · 23.0%')).toBeInTheDocument();
    expect(screen.getByText('$231K · 13.3%')).toBeInTheDocument();
    expect(screen.getByText('$1,740,692')).toBeInTheDocument();
  });

  it('skips the label on slices under 3% so labels do not overlap', () => {
    renderChart({ data: breakdown(900, 90, 10) });

    expect(screen.getByText('$900 · 90.0%')).toBeInTheDocument();
    expect(screen.queryByText(/1\.0%/)).not.toBeInTheDocument();
  });

  it('fills the project filter from the projects that have cost data', async () => {
    axios.get.mockResolvedValue({
      data: [
        { projectId: 'p1', projectName: 'Building 1' },
        { projectId: 'p9', projectName: 'Completed Project' },
      ],
    });
    renderChart({ data: breakdown(100, 50, 25) });

    expect(await screen.findByRole('option', { name: 'Completed Project' })).toHaveValue('p9');
    expect(screen.getByRole('option', { name: 'Building 1' })).toBeInTheDocument();
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/costs/projects'));
  });

  it('lists projects by name in the category detail, including unassigned costs', () => {
    renderChart({ data: breakdown(1000, 500, 250), detailData: laborDetail });

    fireEvent.click(screen.getByRole('button', { name: 'Labor: $1,000' }));

    expect(screen.getByRole('heading', { name: 'Labor by Project' })).toBeInTheDocument();
    expect(screen.getByText('Building 3')).toBeInTheDocument();
    expect(screen.getByText('Unassigned project')).toBeInTheDocument();
    expect(screen.queryByText('Unknown')).not.toBeInTheDocument();
  });
});
