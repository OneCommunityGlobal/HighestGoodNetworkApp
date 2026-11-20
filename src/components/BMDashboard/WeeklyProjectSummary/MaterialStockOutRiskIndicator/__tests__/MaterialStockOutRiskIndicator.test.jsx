// File version: 1.0.0
import { StrictMode } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import axios from 'axios';
import { ENDPOINTS } from '../../../../../utils/URL';
import MaterialStockOutRiskIndicator from '../MaterialStockOutRiskIndicator';

vi.mock('axios', async importOriginal => {
  const { default: actual } = await importOriginal();
  return { default: { ...actual, get: vi.fn() } };
});

vi.mock('../../../../../actions/bmdashboard/projectActions', () => ({
  fetchBMProjects: () => ({ type: 'FETCH_PROJECTS' }),
}));

vi.mock('recharts', async importOriginal => ({
  ...(await importOriginal()),
  ResponsiveContainer: ({ children }) => children,
  BarChart: ({ data }) => (
    <div data-testid="risk-chart">
      {data.map(item => (
        <p key={item.materialId}>{`${item.label}: ${item.daysUntilStockOut} days`}</p>
      ))}
    </div>
  ),
}));

const projects = [
  { _id: '507f1f77bcf86cd799439011', name: 'Building A' },
  { _id: '507f1f77bcf86cd799439012', name: 'Building B' },
];
const material = {
  materialId: 'cement',
  materialName: 'Cement',
  projectId: projects[0]._id,
  projectName: projects[0].name,
  daysUntilStockOut: 3,
};
const mockStore = configureMockStore([]);

function renderIndicator({ bmProjects = projects, darkMode = false, strict = false } = {}) {
  const store = mockStore({ bmProjects, theme: { darkMode } });
  const component = (
    <Provider store={store}>
      <MaterialStockOutRiskIndicator />
    </Provider>
  );
  return render(strict ? <StrictMode>{component}</StrictMode> : component);
}

function selectProject(name = 'Building A') {
  fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowDown' });
  fireEvent.click(screen.getByText(name));
}

function removeProject(name = 'Building A') {
  fireEvent.click(screen.getByRole('button', { name: `Remove ${name}` }));
}

describe('MaterialStockOutRiskIndicator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockResolvedValue({ data: [] });
  });

  it.each([false, true])('guides users before selection (dark mode: %s)', darkMode => {
    renderIndicator({ darkMode });

    expect(screen.getByRole('heading', { name: 'No project selected' })).toBeInTheDocument();
    expect(screen.getByRole('group')).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByLabelText('Projects')).toBeEnabled();
    expect(screen.getByText('Select at least one project.')).toBeInTheDocument();
    expect(screen.getByText(/materials are mapped/)).toBeInTheDocument();
    expect(screen.getByText(/Record material consumption/)).toBeInTheDocument();
    expect(screen.queryByTestId('risk-chart')).not.toBeInTheDocument();
    expect(axios.get).not.toHaveBeenCalled();
  });

  it('keeps the chart inactive when no valid projects are available', () => {
    renderIndicator({ bmProjects: [{ name: 'Missing ID' }, null] });

    expect(screen.getByLabelText('Projects')).toBeDisabled();
    expect(screen.getByText('No projects available')).toBeInTheDocument();
    expect(screen.getByRole('group')).toHaveAttribute('aria-disabled', 'true');
    expect(axios.get).not.toHaveBeenCalled();
  });

  it('distinguishes an empty response from no selection', async () => {
    renderIndicator();
    selectProject();

    expect(await screen.findByText('No stock-out risk data available')).toBeInTheDocument();
    expect(screen.queryByText('No project selected')).not.toBeInTheDocument();
    expect(screen.getByRole('group')).toHaveAttribute('aria-disabled', 'false');
    expect(axios.get).toHaveBeenCalledWith(
      ENDPOINTS.BM_MATERIAL_STOCK_OUT_RISK,
      expect.objectContaining({ params: { projectIds: projects[0]._id } }),
    );
  });

  it('shows valid estimates and returns to the inactive state when cleared', async () => {
    axios.get.mockResolvedValue({
      data: [material, null, { ...material, materialId: 'no-usage', daysUntilStockOut: 999 }],
    });
    renderIndicator();
    selectProject();

    expect(await screen.findByText('Cement - Building A: 3 days')).toBeInTheDocument();
    expect(screen.queryByText(/999 days/)).not.toBeInTheDocument();

    removeProject();

    expect(screen.getByText('No project selected')).toBeInTheDocument();
    expect(screen.queryByTestId('risk-chart')).not.toBeInTheDocument();
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  it('requests all selected projects explicitly', async () => {
    renderIndicator();
    selectProject();
    await screen.findByText('No stock-out risk data available');
    selectProject('Building B');

    await waitFor(() =>
      expect(axios.get).toHaveBeenLastCalledWith(
        ENDPOINTS.BM_MATERIAL_STOCK_OUT_RISK,
        expect.objectContaining({ params: { projectIds: projects.map(p => p._id).join(',') } }),
      ),
    );
    await screen.findByText('No stock-out risk data available');
  });

  it('cancels an older selection and ignores its late response', async () => {
    let resolveOldRequest;
    axios.get.mockImplementationOnce(
      () =>
        new Promise(resolve => {
          resolveOldRequest = resolve;
        }),
    );
    renderIndicator();
    selectProject();

    expect(screen.getByRole('combobox')).toBeEnabled();
    const oldSignal = axios.get.mock.calls[0][1].signal;
    selectProject('Building B');
    await screen.findByText('No stock-out risk data available');

    expect(oldSignal.aborted).toBe(true);
    await act(async () => resolveOldRequest({ data: [material] }));

    expect(screen.getByText('No stock-out risk data available')).toBeInTheDocument();
    expect(screen.queryByTestId('risk-chart')).not.toBeInTheDocument();
  });

  it('ignores a pending response after clearing the selection', async () => {
    let resolveRequest;
    axios.get.mockImplementationOnce(
      () =>
        new Promise(resolve => {
          resolveRequest = resolve;
        }),
    );
    renderIndicator();
    selectProject();
    removeProject();

    await act(async () => resolveRequest({ data: [material] }));

    expect(screen.getByText('No project selected')).toBeInTheDocument();
    expect(screen.getByRole('group')).toHaveAttribute('aria-disabled', 'true');
    expect(screen.queryByTestId('risk-chart')).not.toBeInTheDocument();
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  it('preserves error feedback and retries for the selected project', async () => {
    axios.get.mockRejectedValueOnce(new Error('Service unavailable'));
    renderIndicator();
    selectProject();

    expect(await screen.findByRole('alert')).toHaveTextContent('Service unavailable');
    expect(screen.queryByText('No stock-out risk data available')).not.toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeEnabled();
    axios.get.mockResolvedValueOnce({ data: [material] });
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByText('Cement - Building A: 3 days')).toBeInTheDocument();
    expect(axios.get).toHaveBeenCalledTimes(2);
  });

  it('loads a selected project in StrictMode and cancels on unmount', async () => {
    axios.get.mockResolvedValue({ data: [material] });
    const { unmount } = renderIndicator({ strict: true });
    selectProject();

    expect(await screen.findByText('Cement - Building A: 3 days')).toBeInTheDocument();
    const signal = axios.get.mock.calls[0][1].signal;
    unmount();

    expect(signal.aborted).toBe(true);
  });
});
