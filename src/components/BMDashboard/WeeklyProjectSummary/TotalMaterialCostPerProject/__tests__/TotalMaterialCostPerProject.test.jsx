/* eslint-disable testing-library/no-node-access */
import { render, screen, waitFor, within, fireEvent } from '@testing-library/react';
import axios from 'axios';
import { toast } from 'react-toastify';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import TotalMaterialCostPerProject from '../TotalMaterialCostPerProject';

// Mocks
vi.mock('axios');
vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
  },
}));

// The real <Bar /> component renders into a <canvas> (not DOM-readable),
// so this mock gives you an easy way to verify data without relying on canvas rendering,
vi.mock('react-chartjs-2', () => ({
  Bar: ({ data }) => (
    <div data-testid="bar-chart">
      {data.labels.join(',')} | {data.datasets[0].data.join(',')}
    </div>
  ),
}));

const mockStore = configureStore([]);
const store = mockStore({
  theme: { darkMode: false }, // Mock dark mode value
  // Include other necessary mock slices if needed
});

const mockProjects = [
  { _id: 1, name: 'Project A' },
  { _id: 2, name: 'Project B' },
];

const mockCosts = [
  { projectId: 1, totalCostK: 100 },
  { projectId: 2, totalCostK: 200 },
];

describe('TotalMaterialCostPerProject', () => {
  beforeEach(() => {
    axios.get.mockImplementation(url => {
      if (url.includes('/bm/projects')) {
        return Promise.resolve({ data: mockProjects });
      }
      if (url.includes('/material-costs')) {
        return Promise.resolve({ data: mockCosts });
      }
      return Promise.reject(new Error('not found'));
    });
  });

  it('shows loading spinner on initial render and hide the spinner when data loads', async () => {
    render(
      <Provider store={store}>
        <TotalMaterialCostPerProject />
      </Provider>,
    );
    const loadingSpinner = screen.getByTestId('loading');
    expect(loadingSpinner).toBeInTheDocument();

    await waitFor(() => expect(loadingSpinner).not.toBeInTheDocument());
  });

  it('renders bar chart when data loads successfully', async () => {
    render(
      <Provider store={store}>
        <TotalMaterialCostPerProject />
      </Provider>,
    );
    await waitFor(() => {
      // The slash help test partial content
      expect(screen.getByText(/Project A,Project B/)).toBeInTheDocument();
    });
  });

  it('render selector when data loads successfully', async () => {
    render(
      <Provider store={store}>
        <TotalMaterialCostPerProject />
      </Provider>,
    );
    await waitFor(() => {
      expect(screen.getByText('Project A')).toBeInTheDocument();
    });
    // eslint-disable-next-line testing-library/no-debugging-utils
    screen.debug();

    const control = document.querySelector('.select__control');

    expect(control).toBeInTheDocument();
    expect(within(control).getByText('Project A')).toBeInTheDocument();
  });

  it('when select or deselect items in selector, the bar chart updates too', async () => {
    render(
      <Provider store={store}>
        <TotalMaterialCostPerProject />
      </Provider>,
    );
    await waitFor(() => {
      expect(screen.getByText('Project A')).toBeInTheDocument();
    });

    // Remove option Project A
    await userEvent.click(screen.getByRole('button', { name: 'Remove Project A' }));
    const barChart = screen.getByTestId('bar-chart');
    expect(within(barChart).queryByText(/Project A/)).not.toBeInTheDocument();

    // Select Project A using the dropdown
    const mySelectComponent = screen.queryByTestId('select-projects-dropdown');
    expect(mySelectComponent).toBeInTheDocument();

    fireEvent.keyDown(mySelectComponent.firstChild, { key: 'ArrowDown' });
    await screen.findByText('Project A');
    fireEvent.click(screen.getByText('Project A'));
    expect(within(barChart).getByText(/Project A/)).toBeInTheDocument();

    // De-Select Project A in the dropdown
    fireEvent.keyDown(mySelectComponent.firstChild, { key: 'ArrowDown' });
    await waitFor(() => document.querySelector('#react-select-5-option-0'));
    fireEvent.click(document.querySelector('#react-select-5-option-0'));
    expect(within(barChart).queryByText(/Project A/)).not.toBeInTheDocument();
  });

  it('shows error toast when failed to load projects from api', async () => {
    axios.get.mockImplementation(url => {
      if (url.includes('/bm/projects')) {
        return Promise.reject(new Error('API error'));
      }
      if (url.includes('/material-costs')) {
        return Promise.resolve({ data: mockCosts });
      }
      return Promise.reject(new Error('not found'));
    });
    render(
      <Provider store={store}>
        <TotalMaterialCostPerProject />
      </Provider>,
    );
    await waitFor(() => expect(toast.error).toHaveBeenCalled());
  });

  it('shows error toast when failed to load projects cost from api', async () => {
    axios.get.mockImplementation(url => {
      if (url.includes('/bm/projects')) {
        return Promise.resolve({ data: mockProjects });
      }
      if (url.includes('/material-costs')) {
        return Promise.reject(new Error('API error'));
      }
      return Promise.reject(new Error('not found'));
    });
    render(
      <Provider store={store}>
        <TotalMaterialCostPerProject />
      </Provider>,
    );
    await waitFor(() => expect(toast.error).toHaveBeenCalled());
  });
});
