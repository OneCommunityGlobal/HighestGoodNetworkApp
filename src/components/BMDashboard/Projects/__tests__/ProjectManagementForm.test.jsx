import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import userEvent from '@testing-library/user-event';
import ProjectManagementForm, { validateProjectForm } from '../ProjectManagementForm';
import { updateBMProject } from '../../../../actions/bmdashboard/projectActions';

vi.mock('../../../../actions/bmdashboard/projectActions', () => ({
  createBMProject: vi.fn(payload => () => Promise.resolve(payload)),
  fetchBMProjects: vi.fn(() => () => Promise.resolve([])),
  updateBMProject: vi.fn((projectId, payload) => () => Promise.resolve({ projectId, payload })),
}));

const mockStore = configureStore([thunk]);

const validForm = {
  name: 'Earthbag Village',
  address: '',
  city: 'San Diego',
  country: 'United States',
  latitude: '32.7157',
  longitude: '-117.1611',
  status: 'active',
  startDate: '2026-01-01',
  endDate: '2026-12-31',
};

const editableProject = {
  _id: 'project-1',
  name: 'Saved Project',
  city: 'San Diego',
  country: 'United States',
  latitude: 32.7157,
  longitude: -117.1611,
  status: 'active',
  startDate: '2026-01-01',
  endDate: '2026-12-31',
};

const prefilledProject = {
  ...editableProject,
  status: 'delayed',
  startDate: '2026-01-01T00:00:00.000Z',
  endDate: '2026-12-31T00:00:00.000Z',
};

const renderProjectForm = ({ role = 'Administrator', projectToEdit } = {}) => {
  const store = mockStore({
    auth: { user: { role } },
    theme: { darkMode: false },
  });

  return render(
    <Provider store={store}>
      <ProjectManagementForm projectToEdit={projectToEdit} />
    </Provider>,
  );
};

describe('ProjectManagementForm', () => {
  it('accepts a valid project payload', () => {
    expect(validateProjectForm(validForm)).toEqual({});
  });

  it('rejects invalid coordinates and date order', () => {
    const errors = validateProjectForm({
      ...validForm,
      latitude: '91',
      longitude: '-181',
      endDate: '2025-01-01',
    });

    expect(errors.latitude).toBeTruthy();
    expect(errors.longitude).toBeTruthy();
    expect(errors.endDate).toBeTruthy();
  });

  it('hides project management controls for non-admin users', () => {
    renderProjectForm({ role: 'Volunteer' });

    expect(
      screen.queryByRole('button', { name: /create construction project/i }),
    ).not.toBeInTheDocument();
  });

  it('prefills saved values when editing a project', async () => {
    renderProjectForm({ projectToEdit: prefilledProject });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Saved Project')).toBeInTheDocument();
      expect(screen.getByDisplayValue('San Diego')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toHaveValue('delayed');
      expect(screen.getByDisplayValue('2026-01-01')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2026-12-31')).toBeInTheDocument();
    });
  });

  it('updates the same project when the edited form is saved', async () => {
    renderProjectForm({ projectToEdit: editableProject });

    await userEvent.click(await screen.findByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(updateBMProject).toHaveBeenCalledWith(
        'project-1',
        expect.objectContaining({ name: 'Saved Project', status: 'active' }),
      );
    });
  });
});
