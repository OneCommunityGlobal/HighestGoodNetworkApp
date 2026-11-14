import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import SupplierPerformanceGraph, { CustomTooltip } from '../SupplierPerformanceGraph';
import {
  fetchSupplierPerformance,
  fetchSupplierProjects,
} from '../../../../actions/summaryDashboard';

vi.mock('../../../../actions/summaryDashboard', () => ({
  fetchSupplierProjects: vi.fn(),
  fetchSupplierPerformance: vi.fn(),
}));
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  BarChart: ({ children }) => <div>{children}</div>,
  Bar: ({ children }) => <div>{children}</div>,
  Cell: ({ fill }) => <span data-testid="bar-color">{fill}</span>,
  ReferenceLine: ({ y }) => <span>Target line: {y}</span>,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Label: () => null,
  LabelList: () => null,
}));
const data = [
  { supplierName: 'Alpha', onTimeDeliveryPercentage: 95 },
  { supplierName: 'Beta', onTimeDeliveryPercentage: 90 },
  { supplierName: 'Gamma', onTimeDeliveryPercentage: 80 },
  { supplierName: 'Delta', onTimeDeliveryPercentage: 72.1 },
];
const mount = (role = 'Administrator', darkMode = false) =>
  render(
    <Provider
      store={configureMockStore([thunk])({ auth: { user: { role } }, theme: { darkMode } })}
    >
      <SupplierPerformanceGraph />
    </Provider>,
  );
beforeEach(() => {
  vi.clearAllMocks();
  fetchSupplierProjects.mockReturnValue(async () => []);
  fetchSupplierPerformance.mockReturnValue(async () => data);
});
it('shows thresholds, boundary colors, and supplier insights from API data', async () => {
  mount();
  await screen.findByText('Alpha (95%)');
  expect(screen.getByText('Delta (72.1%)')).toBeInTheDocument();
  expect(screen.getByText('Target line: 90')).toBeInTheDocument();
  expect(screen.getAllByTestId('bar-color').map(node => node.textContent)).toEqual([
    '#2e9b50',
    '#2e9b50',
    '#e5b325',
    '#d64545',
  ]);
  expect(screen.getAllByRole('definition')[0]).toHaveTextContent('2');
  expect(screen.getAllByRole('definition')[1]).toHaveTextContent('2');
});
it('allows admins to apply valid settings without refetching and rejects invalid bands', async () => {
  mount('Owner', true);
  await screen.findByText('Alpha (95%)');
  fireEvent.change(screen.getByLabelText('Target (%)'), { target: { value: '96' } });
  fireEvent.change(screen.getByLabelText('Minimum acceptable SLA (%)'), {
    target: { value: '90' },
  });
  fireEvent.click(screen.getByText('Apply'));
  expect(screen.getByText('Target line: 96')).toBeInTheDocument();
  expect(screen.getAllByRole('definition')[0]).toHaveTextContent('0');
  expect(fetchSupplierPerformance).toHaveBeenCalledTimes(1);
  fireEvent.change(screen.getByLabelText('Target (%)'), { target: { value: '' } });
  expect(screen.getByText('Apply')).toBeDisabled();
  fireEvent.change(screen.getByLabelText('Target (%)'), { target: { value: '85' } });
  expect(screen.getByRole('alert')).toBeInTheDocument();
  expect(screen.getByText('Apply')).toBeDisabled();
});
it('keeps controls unavailable to non-admins', async () => {
  mount('Volunteer');
  await screen.findByText('Alpha (95%)');
  expect(screen.queryByLabelText('Target (%)')).not.toBeInTheDocument();
});
it('preserves the empty state without supplier insights', async () => {
  fetchSupplierPerformance.mockReturnValue(async () => []);
  mount();
  await screen.findByText('No supplier performance data available.');
  expect(screen.queryByLabelText('Supplier performance summary')).not.toBeInTheDocument();
});
it('shows exact percentage, target difference, and optional delivery count', () => {
  const { rerender } = render(
    <CustomTooltip
      active
      label="Alpha"
      target={90}
      payload={[{ value: 82.1, payload: { totalDeliveries: 0 } }]}
    />,
  );
  expect(screen.getByText('On-Time Delivery: 82.1%')).toBeInTheDocument();
  expect(screen.getByText('7.9 percentage points below target')).toBeInTheDocument();
  expect(screen.getByText('Total deliveries: 0')).toBeInTheDocument();
  rerender(<CustomTooltip active label="Alpha" target={90} payload={[{ value: 90 }]} />);
  expect(screen.getByText('At target')).toBeInTheDocument();
  expect(screen.queryByText(/Total deliveries/)).not.toBeInTheDocument();
});
