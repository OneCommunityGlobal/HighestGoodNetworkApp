// Version 1.0.0
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import LossTrackingLineChart from './LossTrackingLineChart';
import { buildLossSeries } from './lossTrackingData';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  LineChart: ({ data, children }) => (
    <div data-testid="chart" data-points={JSON.stringify(data)}>
      {children}
    </div>
  ),
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
}));

const record = (quantity, date = '2026-09-15T00:00:00Z', status = 'Approved') => ({
  quantity,
  date,
  status,
});
const materials = [
  {
    itemType: { _id: 'cement', name: 'SBN-test Cement' },
    purchaseRecord: [
      record(100),
      record(900, undefined, 'Pending'),
      record(900, undefined, 'Rejected'),
      record(50, '2026-12-01'),
    ],
    updateRecord: [
      { date: '2026-09-30T23:00:00Z', quantityWasted: 10 },
      { date: '2026-11-12', quantityWasted: 5 },
    ],
  },
  {
    itemType: { _id: 'cement', name: 'SBN-test Cement' },
    purchaseRecord: [record(300)],
    updateRecord: [{ date: '2026-09-01', quantityWasted: 10 }],
  },
  { itemType: { _id: 'steel', name: 'Steel' }, purchaseRecord: [record(20)], updateRecord: [] },
];

it('sums actual monthly quantities across projects before computing percentages, including all twelve months', () => {
  const [cement, steel] = buildLossSeries(materials);
  expect(cement.data).toHaveLength(12);
  expect(cement.data[8]).toEqual({ date: '2026-09', month: 'Sep', value: 5 });
  expect(cement.data[10].value).toBeNull();
  expect(cement.data[11].value).toBe(0);
  expect(steel.data[8].value).toBe(0);
});

it('handles missing materials, invalid records, zero purchases and different years without inventing loss', () => {
  expect(buildLossSeries([{ itemType: null }])).toEqual([]);
  const result = buildLossSeries([
    {
      itemType: { _id: 'a', name: 'Bricks' },
      purchaseRecord: [record(0), record(-1), record(10, 'invalid'), record(10, '2025-10-01')],
      updateRecord: [
        { date: '2025-10-01', quantityWasted: 2 },
        { date: null, quantityWasted: 2 },
      ],
    },
  ]);
  expect(result.find(line => line.year === 2026).data[8].value).toBeNull();
  expect(result.find(line => line.year === 2025).data[9].value).toBe(20);
});

it('renders real materials, current year, monthly loss and filters without sample series in both themes', () => {
  for (const darkMode of [false, true]) {
    const store = configureMockStore()({
      theme: { darkMode },
      materials: { materialslist: materials },
    });
    const { unmount } = render(
      <Provider store={store}>
        <LossTrackingLineChart />
      </Provider>,
    );
    expect(
      screen.getByRole('option', { name: String(new Date().getFullYear()) }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Metal' })).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Material'), { target: { value: 'cement' } });
    fireEvent.change(screen.getByLabelText('Year'), { target: { value: '2026' } });
    const points = JSON.parse(screen.getByTestId('chart').getAttribute('data-points'));
    expect(points[8]['2026-cement']).toBe(5);
    expect(points[11].displayLabel).toBe('Dec');
    fireEvent.click(screen.getByRole('button', { name: 'Start date' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sep' }));
    fireEvent.click(screen.getByRole('button', { name: 'End date' }));
    fireEvent.click(screen.getByRole('button', { name: 'Nov' }));
    expect(JSON.parse(screen.getByTestId('chart').getAttribute('data-points'))).toHaveLength(3);
    fireEvent.click(screen.getByRole('button', { name: 'Reset Filters' }));
    expect(screen.getByLabelText('Material')).toHaveValue('All');
    unmount();
  }
});

it('shows an empty state with the current year available when there are no records', () => {
  const store = configureMockStore()({
    theme: { darkMode: false },
    materials: { materialslist: [] },
  });
  render(
    <Provider store={store}>
      <LossTrackingLineChart />
    </Provider>,
  );
  expect(screen.getByText('No data available for the selected filters.')).toBeInTheDocument();
  expect(
    screen.getByRole('option', { name: String(new Date().getFullYear()) }),
  ).toBeInTheDocument();
});
