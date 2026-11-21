import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import createMockStore from 'redux-mock-store';
import { Router, Route } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { toast } from 'react-toastify';
import ProjectBudgetForm from '../ProjectBudgetForm';
import {
  fetchProjectBudget,
  saveProjectBudget,
} from '../../../../../actions/bmdashboard/projectBudgetActions';
import { todayInputValue } from '../projectBudgetUtils';
import styles from '../ProjectBudgetForm.module.css';

vi.mock('../../../../../actions/bmdashboard/projectBudgetActions', () => ({
  fetchProjectBudget: vi.fn(),
  saveProjectBudget: vi.fn(),
}));

vi.mock('../../../../../actions/bmdashboard/projectActions', () => ({
  fetchBMProjects: vi.fn(() => ({ type: 'FETCH_BM_PROJECTS' })),
}));

vi.mock('react-toastify', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const PROJECT_ID = '6823e200a3475f85a80d5d9c';
const mockStore = createMockStore([]);

const savedBudget = {
  projectId: PROJECT_ID,
  categories: { labor: 4000, materials: 3000, equipment: 2000 },
  effectiveDate: '2026-11-01T00:00:00.000Z',
  setBy: { firstName: 'Ada', lastName: 'Owner' },
  updatedAt: '2026-11-02T10:00:00.000Z',
  history: [
    {
      categories: { labor: 1000, materials: 1000, equipment: 1000 },
      effectiveDate: '2026-10-01T00:00:00.000Z',
      setBy: { firstName: 'Bo', lastName: 'Admin' },
      setAt: '2026-11-02T10:00:00.000Z',
    },
  ],
};

const renderForm = ({ role = 'Administrator', darkMode = false, budget = null } = {}) => {
  fetchProjectBudget.mockResolvedValue({ status: 200, data: { budget } });
  const store = mockStore({
    theme: { darkMode },
    auth: { user: { role } },
    bmProjects: [{ _id: PROJECT_ID, name: 'Building 3' }],
  });
  const history = createMemoryHistory({
    initialEntries: [`/bmdashboard/projects/${PROJECT_ID}/budget`],
  });
  const view = render(
    <Provider store={store}>
      <Router history={history}>
        <Route path="/bmdashboard/projects/:projectId/budget">
          <ProjectBudgetForm />
        </Route>
      </Router>
    </Provider>,
  );
  return { ...view, history };
};

const fill = (label, value) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });

describe('ProjectBudgetForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows an empty state and a blank form when no budget is set', async () => {
    renderForm();
    expect(
      await screen.findByText(/No budget has been set for this project yet/),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Set Budget' })).toBeInTheDocument();
    expect(screen.getByText('Building 3')).toBeInTheDocument();
    expect(screen.getByLabelText('Labor')).toHaveValue(null);
    expect(screen.getByLabelText('Effective date')).toHaveValue(todayInputValue());
    expect(fetchProjectBudget).toHaveBeenCalledWith(PROJECT_ID);
  });

  it('shows field errors and does not save an empty form', async () => {
    renderForm();
    fireEvent.click(await screen.findByRole('button', { name: 'Save budget' }));

    expect(screen.getByText('Labor must be a number of 0 or more')).toBeInTheDocument();
    expect(screen.getByText('Materials must be a number of 0 or more')).toBeInTheDocument();
    expect(saveProjectBudget).not.toHaveBeenCalled();
  });

  it('saves the category budget and returns to the project dashboard', async () => {
    saveProjectBudget.mockResolvedValue({ status: 200, data: { budget: savedBudget } });
    const { history } = renderForm();
    await screen.findByRole('button', { name: 'Save budget' });

    fill('Labor', '4000');
    fill('Materials', '3000');
    fill('Equipment', '2000');
    expect(screen.getByText('9,000')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Save budget' }));

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Budget saved'));
    expect(saveProjectBudget).toHaveBeenCalledWith(PROJECT_ID, {
      categories: { labor: 4000, materials: 3000, equipment: 2000 },
      effectiveDate: todayInputValue(),
    });
    expect(history.location.pathname).toBe(`/bmdashboard/projects/${PROJECT_ID}`);
  });

  it('requires the expenditure-type split to add up to the category total', async () => {
    renderForm();
    await screen.findByRole('button', { name: 'Save budget' });
    fill('Labor', '100');
    fill('Materials', '0');
    fill('Equipment', '0');
    fireEvent.click(screen.getByLabelText('Also split by expenditure type (optional)'));
    fill('Plumbing', '40');
    fill('Electrical', '40');
    fill('Structural', '0');
    fill('Mechanical', '0');
    expect(screen.getByText('20')).toBeInTheDocument(); // left to allocate

    fireEvent.click(screen.getByRole('button', { name: 'Save budget' }));
    expect(
      screen.getByText('Expenditure types must add up to the category total'),
    ).toBeInTheDocument();
    expect(saveProjectBudget).not.toHaveBeenCalled();

    fill('Mechanical', '20');
    saveProjectBudget.mockResolvedValue({ status: 200, data: { budget: savedBudget } });
    fireEvent.click(screen.getByRole('button', { name: 'Save budget' }));
    await waitFor(() => expect(saveProjectBudget).toHaveBeenCalled());
    expect(saveProjectBudget.mock.calls[0][1].expenditureTypes).toEqual({
      plumbing: 40,
      electrical: 40,
      structural: 0,
      mechanical: 20,
    });
  });

  it('shows the server error and stays on the page when saving fails', async () => {
    saveProjectBudget.mockResolvedValue({ status: 403, data: { message: 'Not allowed' } });
    const { history } = renderForm();
    await screen.findByRole('button', { name: 'Save budget' });
    fill('Labor', '10');
    fill('Materials', '0');
    fill('Equipment', '0');
    fireEvent.click(screen.getByRole('button', { name: 'Save budget' }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Not allowed'));
    expect(history.location.pathname).toBe(`/bmdashboard/projects/${PROJECT_ID}/budget`);
  });

  it('prefills the form from the saved budget for editing', async () => {
    renderForm({ budget: savedBudget });
    expect(await screen.findByRole('heading', { name: 'Edit budget' })).toBeInTheDocument();
    expect(screen.getByLabelText('Labor')).toHaveValue(4000);
    expect(screen.getByLabelText('Effective date')).toHaveValue('2026-11-01');
  });

  it('is read-only for roles other than Owner and Administrator', async () => {
    renderForm({ role: 'Manager', budget: savedBudget });
    expect(await screen.findByText('Total planned budget')).toBeInTheDocument();
    expect(screen.getByText(/set by Ada Owner/)).toBeInTheDocument();
    expect(
      screen.getByText('Only Owners and Administrators can set the budget.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save budget' })).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Labor')).not.toBeInTheDocument();
  });

  it('lists earlier budgets in the history table', async () => {
    renderForm({ budget: savedBudget });
    expect(await screen.findByRole('heading', { name: 'Earlier budgets' })).toBeInTheDocument();
    expect(screen.getByText('Bo Admin')).toBeInTheDocument();
    expect(screen.getByText('Oct 1, 2026')).toBeInTheDocument();
  });

  it('uses the dark card styling in dark mode', async () => {
    renderForm({ darkMode: true });
    await screen.findByRole('button', { name: 'Save budget' });
    expect(screen.getByRole('main')).toHaveClass(styles.pageDark);
  });

  it('shows an error when the budget cannot be loaded', async () => {
    fetchProjectBudget.mockResolvedValue({ status: 500, data: { message: 'Server down' } });
    const store = mockStore({
      theme: { darkMode: false },
      auth: { user: { role: 'Owner' } },
      bmProjects: [{ _id: PROJECT_ID, name: 'Building 3' }],
    });
    const history = createMemoryHistory({
      initialEntries: [`/bmdashboard/projects/${PROJECT_ID}/budget`],
    });
    render(
      <Provider store={store}>
        <Router history={history}>
          <Route path="/bmdashboard/projects/:projectId/budget">
            <ProjectBudgetForm />
          </Route>
        </Router>
      </Provider>,
    );
    expect(await screen.findByText('Server down')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save budget' })).not.toBeInTheDocument();
  });
});
