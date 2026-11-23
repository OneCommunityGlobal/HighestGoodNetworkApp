import { render, screen, fireEvent, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import moment from 'moment-timezone';
import QuantityOfMaterialsUsed, {
  getMaterialKey,
  filterMaterialsByProjects,
  buildMaterialLabels,
} from '../QuantityOfMaterialsUsed';

// The real chart needs a canvas; this stand-in shows the labels and values it gets,
// with one button per bar that clicks it like Chart.js does
vi.mock('react-chartjs-2', () => ({
  Bar: ({ data, options }) => (
    <div
      data-testid="quantity-chart"
      data-labels={JSON.stringify(data.labels)}
      data-values={JSON.stringify(data.datasets[0]?.data || [])}
    >
      {data.labels.map((label, index) => (
        <button key={label} type="button" onClick={() => options.onClick(null, [{ index }])}>
          {`bar ${label}`}
        </button>
      ))}
    </div>
  ),
}));

vi.mock('../../../../../actions/bmdashboard/projectActions', () => ({
  fetchBMProjects: () => ({ type: 'TEST_FETCH_BM_PROJECTS' }),
}));

const mockStore = configureMockStore([]);

const building1 = { _id: 'p1', name: 'Building 1' };
const building2 = { _id: 'p2', name: 'Building 2' };
const building3 = { _id: 'p3', name: 'Building 3' };

// A day inside last week, which is the chart's default time period
const lastWeek = moment()
  .subtract(1, 'week')
  .startOf('week')
  .add(2, 'days')
  .toISOString();

const material = (id, project, itemType, used) => ({
  _id: id,
  project,
  itemType,
  updateRecord: [{ date: lastWeek, quantityUsed: used, quantityWasted: 0 }],
});

const bricks = { _id: 't1', name: 'Bricks', unit: 'pieces' };
const cement = { _id: 't2', name: 'Cement', unit: 'kg' };
// A different material type that has the same name as cement
const otherCement = { _id: 't3', name: 'Cement', unit: 'bags' };

const materials = [
  material('m1', building1, bricks, 250),
  material('m2', building1, cement, 76),
  material('m3', building2, bricks, 50),
  material('m4', building2, otherCement, 10),
];

const renderChart = (data = materials) =>
  render(
    <Provider
      store={mockStore({
        theme: { darkMode: false },
        bmProjects: [building1, building2, building3],
      })}
    >
      <QuantityOfMaterialsUsed data={data} />
    </Provider>,
  );

const chartValues = () => {
  const chart = screen.getByTestId('quantity-chart');
  const labels = JSON.parse(chart.dataset.labels);
  const values = JSON.parse(chart.dataset.values);
  return Object.fromEntries(labels.map((label, index) => [label, values[index]]));
};

const pickProject = name => {
  fireEvent.keyDown(screen.getByLabelText('Projects'), { key: 'ArrowDown' });
  fireEvent.click(screen.getByText(name));
};

describe('Quantity of Materials Used helpers', () => {
  it('groups by material type ID and skips records without a type', () => {
    expect(getMaterialKey(materials[1])).toBe('t2');
    expect(getMaterialKey(materials[3])).toBe('t3');
    expect(getMaterialKey({ itemType: null })).toBeNull();
  });

  it('keeps every project when none is selected, and only the chosen ones otherwise', () => {
    expect(filterMaterialsByProjects(materials, [])).toHaveLength(4);
    expect(filterMaterialsByProjects(materials, ['p2']).map(m => m._id)).toEqual(['m3', 'm4']);
    expect(filterMaterialsByProjects(materials, ['p3'])).toEqual([]);
    expect(filterMaterialsByProjects(undefined, ['p1'])).toEqual([]);
  });

  it('adds the unit only when two material types share a name', () => {
    const labels = buildMaterialLabels(materials);
    expect(labels.get('t1')).toBe('Bricks');
    expect(labels.get('t2')).toBe('Cement (kg)');
    expect(labels.get('t3')).toBe('Cement (bags)');
  });
});

describe('Quantity of Materials Used chart', () => {
  it('adds up all projects when no project is selected', () => {
    renderChart();
    expect(chartValues()).toEqual({ Bricks: 300, 'Cement (kg)': 76, 'Cement (bags)': 10 });
  });

  it('shows only the selected project usage', () => {
    renderChart();
    pickProject('Building 1');
    expect(chartValues()).toEqual({ Bricks: 250, Cement: 76 });
  });

  it('shows no materials for a project that has none', () => {
    renderChart();
    pickProject('Building 3');
    expect(chartValues()).toEqual({});
  });

  it('adds up only the projects that are selected', () => {
    renderChart();
    pickProject('Building 1');
    pickProject('Building 2');
    expect(chartValues()).toEqual({ Bricks: 300, 'Cement (kg)': 76, 'Cement (bags)': 10 });
  });

  it('opens the usage details for the clicked bar with only the selected project', () => {
    renderChart();
    pickProject('Building 2');
    fireEvent.click(screen.getByRole('button', { name: 'bar Bricks' }));

    const details = screen.getByRole('dialog', { name: 'Bricks – Usage Details' });
    expect(within(details).getByText('Building 2')).toBeInTheDocument();
    expect(within(details).getAllByText('50').length).toBeGreaterThan(0);
    expect(within(details).queryByText('Building 1')).not.toBeInTheDocument();
  });

  it('keeps two material types with the same name apart in the details', () => {
    renderChart();
    fireEvent.click(screen.getByRole('button', { name: 'bar Cement (bags)' }));

    const details = screen.getByRole('dialog', { name: 'Cement (bags) – Usage Details' });
    expect(within(details).getByText('Building 2')).toBeInTheDocument();
    expect(within(details).queryByText('Building 1')).not.toBeInTheDocument();
  });

  it('lists only the selected project materials in the materials dropdown', () => {
    renderChart();
    pickProject('Building 2');
    fireEvent.keyDown(screen.getByLabelText('Materials'), { key: 'ArrowDown' });
    expect(screen.getByRole('option', { name: 'Bricks' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Cement' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Cement (kg)' })).not.toBeInTheDocument();
  });
});
