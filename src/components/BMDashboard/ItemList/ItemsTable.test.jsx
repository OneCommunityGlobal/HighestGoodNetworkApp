import { render, screen, fireEvent } from '@testing-library/react';
import ItemsTable from './ItemsTable';

vi.mock('./RecordsModal', () => ({ default: () => null }));
vi.mock('../MaterialUsage/MaterialUsageChart', () => ({ default: () => null }));
vi.mock('../MaterialList/StockHealthIndicator', () => ({ default: () => null }));
vi.mock('../MaterialList/UsagePercentageBar', () => ({ default: () => null }));

const material = {
  _id: 'material1',
  project: null,
  itemType: null,
  unit: '',
  stockBought: 28,
  stockUsed: 1573,
  stockWasted: 227,
  stockAvailable: -1772.0000000000002,
};
const props = {
  itemType: 'Materials',
  filteredItems: [material],
  dynamicColumns: [
    { label: 'Unit', key: 'unit' },
    { label: 'Available', key: 'stockAvailable' },
  ],
  currentPage: 1,
  totalPages: 1,
  rowsPerPage: 25,
};

it('renders missing identities, precise negative Available, and explicit investigation reasons', () => {
  render(<ItemsTable {...props} />);
  expect(screen.getByText('-1772.00')).toBeInTheDocument();
  expect(screen.getByText('Needs investigation')).toBeInTheDocument();
  expect(screen.getByText('Used + Wasted exceeds Bought')).toBeInTheDocument();
  expect(screen.getAllByText('Missing name')).toHaveLength(2);
  expect(screen.getAllByText('Missing unit')).toHaveLength(2);
  expect(screen.getAllByText('Missing project')).toHaveLength(2);
});

it('passes the original unrounded record to the update modal', () => {
  const UpdateModal = ({ record }) =>
    record ? <div>Raw Available: {record.stockAvailable}</div> : null;
  render(<ItemsTable {...props} UpdateItemModal={UpdateModal} />);
  fireEvent.click(screen.getAllByRole('button', { name: 'Edit Record' })[1]);
  expect(screen.getByText('Raw Available: -1772.0000000000002')).toBeInTheDocument();
});

it('leaves other inventory views unchanged', () => {
  render(<ItemsTable {...props} itemType="Consumables" />);
  expect(screen.getByText('-1772.0000000000002')).toBeInTheDocument();
  expect(screen.queryByText('Needs investigation')).not.toBeInTheDocument();
});
