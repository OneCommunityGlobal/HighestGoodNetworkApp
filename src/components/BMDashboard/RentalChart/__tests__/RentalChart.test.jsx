import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import axios from 'axios';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import RentalChart from '../RentalChart';

vi.mock('axios');
vi.mock('react-toastify', () => ({ toast: { error: vi.fn() } }));

// Charts draw on canvas, so expose the props they receive as text
vi.mock('react-chartjs-2', () => ({
  Line: ({ data, options }) => (
    <div data-testid="line-chart">
      {`${data.datasets[0].label} | ${data.datasets[0].data.join(',')} | ${
        options.scales.x.title.text
      }`}
    </div>
  ),
  Bar: ({ data }) => <div data-testid="bar-chart">{data.labels.join(',')}</div>,
}));

const BUILDING_1 = '64b000000000000000000001';

const rentals = [
  {
    projectId: BUILDING_1,
    date: '2026-09-30',
    toolName: 'Drill',
    rentalCost: 255,
    totalMaterialCost: 1000,
  },
  {
    projectId: BUILDING_1,
    date: '2026-10-01',
    toolName: 'Hammer',
    rentalCost: 868,
    totalMaterialCost: 2000,
  },
];

const costOverTime = [
  { date: '2026-09-30', value: 255, percentage: 25.5 },
  { date: '2026-10-01', value: 868, percentage: 43.4 },
];

const store = configureMockStore([])({
  theme: { darkMode: false },
  bmProjects: [{ _id: BUILDING_1, name: 'Building 1' }],
});

const renderChart = () =>
  render(
    <Provider store={store}>
      <RentalChart />
    </Provider>,
  );

describe('RentalChart', () => {
  beforeEach(() => {
    axios.get.mockReset();
    axios.get.mockImplementation(url => {
      if (url.includes('/bm/rentalChart')) {
        return Promise.resolve({ data: { success: true, data: rentals } });
      }
      if (url.includes('/rentals/cost-over-time')) return Promise.resolve({ data: costOverTime });
      if (url.includes('/tools/cost-breakdown')) {
        // The API name can differ from the dropdown's; the dropdown's name must win
        return Promise.resolve({
          data: [
            {
              projectId: BUILDING_1,
              projectName: 'Project 4',
              ownedToolsCost: 10,
              rentedToolsCost: 5,
            },
          ],
        });
      }
      return Promise.resolve({ data: { success: true, data: [] } });
    });
  });

  it('plots the percentage of materials cost with a matching legend when % is selected', async () => {
    renderChart();
    expect(await screen.findByTestId('line-chart')).toHaveTextContent(
      'Total Rental Cost | 255,868 | Date',
    );

    fireEvent.change(screen.getByLabelText(/Display/), { target: { value: 'percentage' } });

    expect(screen.getByTestId('line-chart')).toHaveTextContent(
      '% of Materials Cost | 25.5,43.4 | Date',
    );
  });

  it('sends the selected tool to the cost over time API', async () => {
    renderChart();
    await screen.findByTestId('line-chart');

    fireEvent.change(screen.getByLabelText(/Project/), { target: { value: BUILDING_1 } });
    fireEvent.change(screen.getByLabelText(/Tool/), { target: { value: 'Drill' } });

    await waitFor(() =>
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/rentals/cost-over-time'),
        expect.objectContaining({
          params: expect.objectContaining({ projectId: BUILDING_1, toolName: 'Drill' }),
        }),
      ),
    );
  });

  it('labels the tool cost breakdown with the project name shown in the dropdown', async () => {
    renderChart();
    expect(await screen.findByTestId('bar-chart')).toHaveTextContent('Building 1');
    expect(screen.getByTestId('bar-chart')).not.toHaveTextContent('Project 4');
  });
});
