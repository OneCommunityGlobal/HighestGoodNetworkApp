import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import axios from 'axios';
import ExpenditureCard from '../ExpenditureChart/ExpenditureCard';
import ActualVsPlannedCost from '../ActualVsPlannedCost/ActualVsPlannedCost';
import CostPredictionChart from '../CostPredictionChart';
import projectCostService from '../../../../services/projectCostService';
import { ENDPOINTS } from '../../../../utils/URL';

vi.mock('axios', () => ({ default: { get: vi.fn() } }));
vi.mock('../../../../actions/bmdashboard/projectActions', () => ({
  fetchBMProjects: () => ({ type: 'fetch-projects' }),
}));
vi.mock('../../../../services/projectCostService', () => ({
  default: { getProjectCosts: vi.fn(), getProjectPredictions: vi.fn() },
}));
vi.mock('../ExpenditureChart/ExpenditureChart', () => ({
  default: ({ projectId }) => <output aria-label="Chart project">{projectId}</output>,
}));
// Layout and financial calculations are unchanged; avoid SVG sizing in jsdom.
vi.mock('recharts', async () => {
  const { createElement } = await import('react');
  const Container = ({ children }) => createElement('div', null, children);
  return Object.fromEntries(
    [
      'ResponsiveContainer',
      'BarChart',
      'Bar',
      'XAxis',
      'YAxis',
      'Tooltip',
      'Legend',
      'CartesianGrid',
      'LabelList',
      'Cell',
      'LineChart',
      'Line',
      'ReferenceLine',
    ].map(name => [name, Container]),
  );
});

const projects = [
  { _id: 'p1', name: 'First' },
  { _id: 'p2', name: 'Second' },
];
const expenses = {
  totalActualCost: 150,
  totalPlannedCost: 100,
  breakdown: [{ category: 'Labor', actualCost: 150, plannedCost: 100 }],
};
const makeStore = (options = projects) =>
  createStore((state = { bmProjects: options, theme: { darkMode: false } }, action) =>
    action.type === 'projects' ? { ...state, bmProjects: action.projects } : state,
  );
const withStore = (component, store = makeStore()) => (
  <Provider store={store}>{component}</Provider>
);

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  axios.get.mockResolvedValue({ data: expenses });
  projectCostService.getProjectCosts.mockResolvedValue({
    data: { costs: [{ month: 'January 2024', plannedCost: 100, actualCost: 150 }] },
  });
  projectCostService.getProjectPredictions.mockResolvedValue({ data: { predictions: [] } });
});

it('preserves an expenditure selection across navigation and delayed option loading', async () => {
  axios.get.mockResolvedValue({ data: ['p1', 'p2'] });
  const view = render(<ExpenditureCard pieType="actual" />);
  await screen.findByLabelText('Project');
  fireEvent.change(screen.getByLabelText('Project'), { target: { value: 'p2' } });
  expect(localStorage.getItem('bm_expenditure_actual_project')).toBe('p2');
  view.unmount();
  let resolveOptions;
  axios.get.mockImplementationOnce(
    () =>
      new Promise(resolve => {
        resolveOptions = resolve;
      }),
  );
  render(<ExpenditureCard pieType="actual" />);
  expect(localStorage.getItem('bm_expenditure_actual_project')).toBe('p2');
  await act(async () => {
    resolveOptions({ data: ['p1', 'p2'] });
  });
  expect(screen.getByLabelText('Project')).toHaveValue('p2');
  expect(screen.getByLabelText('Chart project')).toHaveTextContent('p2');
});

it.each([null, 'removed'])(
  'defaults an expenditure project only when saved ID is %s',
  async saved => {
    if (saved) localStorage.setItem('bm_expenditure_actual_project', saved);
    axios.get.mockResolvedValue({ data: ['p1', 'p2'] });
    render(<ExpenditureCard pieType="actual" />);
    await waitFor(() => expect(screen.getByLabelText('Project')).toHaveValue('p1'));
    expect(localStorage.getItem('bm_expenditure_actual_project')).toBe('p1');
  },
);

it('keeps actual, planned and comparison expenditure selections separate', async () => {
  localStorage.setItem('bm_expenditure_actual_project', 'p2');
  localStorage.setItem('bm_expenditure_planned_project', 'p1');
  localStorage.setItem('bm_expenditure_comparison_project', 'p2');
  axios.get.mockResolvedValue({ data: ['p1', 'p2'] });
  render(
    <>
      <ExpenditureCard pieType="actual" />
      <ExpenditureCard pieType="planned" />
      <ExpenditureCard mode="comparison" />
    </>,
  );
  await waitFor(() => expect(screen.getAllByLabelText('Project')).toHaveLength(3));
  expect(screen.getAllByLabelText('Project').map(select => select.value)).toEqual([
    'p2',
    'p1',
    'p2',
  ]);
});

it('restores project/category after Redux options load and fetches the saved project', async () => {
  localStorage.setItem('bm_avsp_project', 'p2');
  localStorage.setItem('bm_avsp_category', 'Labor');
  const store = makeStore([]);
  const view = render(withStore(<ActualVsPlannedCost />, store));
  expect(axios.get).not.toHaveBeenCalled();
  act(() => store.dispatch({ type: 'projects', projects }));
  await waitFor(() => expect(screen.getByLabelText('Category:')).toHaveValue('Labor'));
  expect(screen.getByLabelText('Project:')).toHaveValue('p2');
  expect(axios.get).toHaveBeenCalledWith(ENDPOINTS.BM_PROJECT_EXPENSE_BY_ID('p2'));
  view.unmount();
  render(withStore(<ActualVsPlannedCost />));
  await waitFor(() => expect(screen.getByLabelText('Category:')).toHaveValue('Labor'));
  expect(screen.getByLabelText('Project:')).toHaveValue('p2');
});

it('validates saved project and category against fetched options', async () => {
  localStorage.setItem('bm_avsp_project', 'removed');
  localStorage.setItem('bm_avsp_category', 'removed');
  render(withStore(<ActualVsPlannedCost />));
  await waitFor(() =>
    expect(axios.get).toHaveBeenCalledWith(ENDPOINTS.BM_PROJECT_EXPENSE_BY_ID('p1')),
  );
  expect(axios.get).not.toHaveBeenCalledWith(ENDPOINTS.BM_PROJECT_EXPENSE_BY_ID('removed'));
  expect(screen.getByLabelText('Project:')).toHaveValue('p1');
  expect(screen.getByLabelText('Category:')).toHaveValue('Overall');
});

it('resets a missing saved category only after the valid project breakdown arrives', async () => {
  localStorage.setItem('bm_avsp_project', 'p2');
  localStorage.setItem('bm_avsp_category', 'Materials');
  render(withStore(<ActualVsPlannedCost />));
  await waitFor(() => expect(localStorage.getItem('bm_avsp_category')).toBe('Overall'));
  expect(screen.getByLabelText('Project:')).toHaveValue('p2');
});

it('isolates duplicate actual/planned cards and restores each after remount', async () => {
  const cards = withStore(
    <>
      <section aria-label="Primary">
        <ActualVsPlannedCost />
      </section>
      <section aria-label="Secondary">
        <ActualVsPlannedCost storageKey="bm_avsp_secondary" />
      </section>
    </>,
  );
  const view = render(cards);
  await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));
  const primary = within(screen.getByRole('region', { name: 'Primary' }));
  const secondary = within(screen.getByRole('region', { name: 'Secondary' }));
  fireEvent.change(primary.getByLabelText('Project:'), { target: { value: 'p2' } });
  await primary.findByRole('option', { name: 'Labor' });
  fireEvent.change(primary.getByLabelText('Category:'), { target: { value: 'Labor' } });
  expect(secondary.getByLabelText('Project:')).toHaveValue('p1');
  expect(localStorage.getItem('bm_avsp_project')).toBe('p2');
  expect(localStorage.getItem('bm_avsp_secondary_project')).toBe('p1');
  view.unmount();
  render(cards);
  await waitFor(() =>
    expect(
      within(screen.getByRole('region', { name: 'Primary' })).getByLabelText('Category:'),
    ).toHaveValue('Labor'),
  );
  expect(
    within(screen.getByRole('region', { name: 'Secondary' })).getByLabelText('Project:'),
  ).toHaveValue('p1');
});

it('restores a building selection and requests its costs on refresh', async () => {
  localStorage.setItem('bm_cost_prediction_project', 'building-2');
  const view = render(withStore(<CostPredictionChart projectId={1} />));
  await waitFor(() => expect(screen.getByLabelText('Project')).toHaveValue('building-2'));
  expect(projectCostService.getProjectCosts).toHaveBeenCalledWith('building-2');
  expect(projectCostService.getProjectPredictions).toHaveBeenCalledWith('building-2');
  fireEvent.change(screen.getByLabelText('Project'), { target: { value: 'building-3' } });
  await waitFor(() =>
    expect(projectCostService.getProjectCosts).toHaveBeenCalledWith('building-3'),
  );
  view.unmount();
  render(withStore(<CostPredictionChart projectId={1} />));
  await waitFor(() => expect(screen.getByLabelText('Project')).toHaveValue('building-3'));
});

it('falls back from an invalid building and persists an explicit Reset', async () => {
  localStorage.setItem('bm_cost_prediction_project', 'removed');
  render(withStore(<CostPredictionChart projectId={1} />));
  await waitFor(() => expect(screen.getByLabelText('Project')).toHaveValue(''));
  expect(projectCostService.getProjectCosts).toHaveBeenCalledWith(1);
  fireEvent.change(screen.getByLabelText('Project'), { target: { value: 'building-2' } });
  await screen.findByRole('button', { name: 'Reset Filters' });
  fireEvent.click(screen.getByRole('button', { name: 'Reset Filters' }));
  await waitFor(() => expect(localStorage.getItem('bm_cost_prediction_project')).toBe(''));
  expect(projectCostService.getProjectCosts).toHaveBeenLastCalledWith(1);
});

it('isolates duplicate building filter selections', async () => {
  localStorage.setItem('bm_cost_prediction_project', 'building-2');
  localStorage.setItem('bm_cost_prediction_secondary_project', 'building-3');
  render(
    withStore(
      <>
        <CostPredictionChart projectId={1} />
        <CostPredictionChart projectId={1} storageKey="bm_cost_prediction_secondary_project" />
      </>,
    ),
  );
  await waitFor(() => expect(screen.getAllByLabelText('Project')).toHaveLength(2));
  expect(screen.getAllByLabelText('Project').map(select => select.value)).toEqual([
    'building-2',
    'building-3',
  ]);
});

it('ignores a previous project response after a new project/category is selected', async () => {
  let resolveOld;
  axios.get.mockImplementationOnce(
    () =>
      new Promise(resolve => {
        resolveOld = resolve;
      }),
  );
  render(withStore(<ActualVsPlannedCost />));
  await waitFor(() =>
    expect(axios.get).toHaveBeenCalledWith(ENDPOINTS.BM_PROJECT_EXPENSE_BY_ID('p1')),
  );
  fireEvent.change(screen.getByLabelText('Project:'), { target: { value: 'p2' } });
  await screen.findByRole('option', { name: 'Labor' });
  fireEvent.change(screen.getByLabelText('Category:'), { target: { value: 'Labor' } });
  await act(async () => {
    resolveOld({
      data: {
        ...expenses,
        breakdown: [{ category: 'Materials', actualCost: 50, plannedCost: 40 }],
      },
    });
  });
  expect(screen.getByLabelText('Project:')).toHaveValue('p2');
  expect(screen.getByLabelText('Category:')).toHaveValue('Labor');
  expect(localStorage.getItem('bm_avsp_category')).toBe('Labor');
});

it('migrates existing saved filters to the secondary card without sharing future writes', async () => {
  localStorage.setItem('bm_avsp_project', 'p2');
  localStorage.setItem('bm_avsp_category', 'Labor');
  render(withStore(<ActualVsPlannedCost storageKey="bm_avsp_secondary" />));
  await waitFor(() => expect(screen.getByLabelText('Category:')).toHaveValue('Labor'));
  expect(screen.getByLabelText('Project:')).toHaveValue('p2');
  expect(localStorage.getItem('bm_avsp_secondary_project')).toBe('p2');
  fireEvent.change(screen.getByLabelText('Project:'), { target: { value: 'p1' } });
  expect(localStorage.getItem('bm_avsp_project')).toBe('p2');
  expect(localStorage.getItem('bm_avsp_secondary_project')).toBe('p1');
});
