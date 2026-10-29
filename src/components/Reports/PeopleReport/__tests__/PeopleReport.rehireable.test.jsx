import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { toast } from 'react-toastify';
import PeopleReport from '../PeopleReport';
import { updateRehireableStatus } from '../../../../actions/userManagement';

vi.mock('../../../../actions/userManagement', () => ({
  updateRehireableStatus: vi.fn(),
}));
vi.mock('../../../../actions/userProfile', () => ({
  updateUserProfileProperty: vi.fn(() => () => Promise.resolve()),
  getUserProfile: vi.fn(() => () => Promise.resolve()),
  getUserTasks: vi.fn(() => () => Promise.resolve()),
}));
vi.mock('../../../../actions/userProjects', () => ({
  getUserProjects: vi.fn(() => () => Promise.resolve()),
}));
vi.mock('../../../../actions/weeklySummaries', () => ({
  getWeeklySummaries: vi.fn(() => () => Promise.resolve()),
}));
vi.mock('../../../../actions/timeEntries', () => ({
  getTimeEntriesForPeriod: vi.fn(() => () => Promise.resolve()),
}));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('../components', () => ({ PeopleTasksPieChart: () => null }));
vi.mock('../CompletedTasksPieChart', () => ({ default: () => null }));
vi.mock('../../InfringementsViz', () => ({ default: () => null }));
vi.mock('../../TimeEntriesViz', () => ({ default: () => null }));
vi.mock('../../BadgeSummaryViz', () => ({ default: () => null }));
vi.mock('../../BadgeSummaryPreview', () => ({ default: () => null }));
vi.mock('../../PeopleTableDetails', () => ({ default: () => null }));

const mockStore = configureStore([thunk]);

const buildState = (profileOverrides = {}) => ({
  auth: { user: { role: 'Owner' } },
  userProfile: {
    _id: 'user1',
    firstName: 'Test',
    lastName: 'User',
    role: 'Volunteer',
    jobTitle: 'Dev',
    isActive: true,
    isRehireable: true,
    infringements: [],
    weeklycommittedHours: 10,
    tangibleHoursReportedThisWeek: 0,
    ...profileOverrides,
  },
  userTask: [],
  timeEntries: { period: [] },
  userProjects: {},
  theme: { darkMode: false },
});

const renderReport = (profileOverrides) =>
  render(
    <Provider store={mockStore(buildState(profileOverrides))}>
      <MemoryRouter>
        <PeopleReport match={{ params: { userId: 'user1' } }} />
      </MemoryRouter>
    </Provider>,
  );

const openModal = async (name) => {
  fireEvent.click(await screen.findByRole('button', { name }));
};
const reasonBox = () => screen.getByRole('textbox', { name: /reason for not rehireable status/i });

describe('PeopleReport Rehireable control', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    updateRehireableStatus.mockImplementation(() => () => Promise.resolve());
  });

  it('opens the reason modal when unchecking Rehireable', async () => {
    renderReport();
    await openModal('Rehireable');

    expect(screen.getByText(/please enter the reason below/i)).toBeInTheDocument();
    expect(updateRehireableStatus).not.toHaveBeenCalled();
  });

  it.each([
    ['empty', ''],
    ['whitespace-only', '   '],
  ])('does not update status for an %s reason', async (_label, value) => {
    renderReport();
    await openModal('Rehireable');
    fireEvent.change(reasonBox(), { target: { value } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(updateRehireableStatus).not.toHaveBeenCalled();
    expect(screen.getByText(/a reason is required/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Rehireable' })).toBeInTheDocument();
  });

  it('passes a trimmed valid reason and shows the not-rehireable state', async () => {
    renderReport();
    await openModal('Rehireable');
    fireEvent.change(reasonBox(), { target: { value: '  x  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() => expect(toast.success).toHaveBeenCalled());
    expect(updateRehireableStatus).toHaveBeenCalledWith(
      expect.objectContaining({ _id: 'user1' }),
      false,
      'x',
    );
    const control = screen.getByRole('button', { name: 'Not rehireable' });
    expect(control.title).toBe('x');
    expect(control.style.border).toBe('2px solid rgb(240, 140, 0)');
  });

  it('shows the persisted reason after load', async () => {
    renderReport({ isRehireable: false, notRehireableReason: 'Saved reason' });

    const control = await screen.findByRole('button', { name: 'Not rehireable' });
    expect(control.title).toBe('Saved reason');
    expect(control.style.border).toBe('2px solid rgb(240, 140, 0)');
  });

  it('changes back to Rehireable without a reason and clears it', async () => {
    renderReport({ isRehireable: false, notRehireableReason: 'Saved reason' });
    await openModal('Not rehireable');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() => expect(toast.success).toHaveBeenCalled());
    expect(updateRehireableStatus).toHaveBeenCalledWith(
      expect.objectContaining({ _id: 'user1' }),
      true,
      '',
    );
    const control = screen.getByRole('button', { name: 'Rehireable' });
    expect(control).toHaveClass('fa-check-square-o');
    expect(control.style.border).toBe('');
  });

  it('restores the previous state and alerts when the update fails', async () => {
    updateRehireableStatus.mockImplementation(() => () => Promise.reject(new Error('fail')));
    renderReport();
    await openModal('Rehireable');
    fireEvent.change(reasonBox(), { target: { value: 'Reason' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() => expect(window.alert).toHaveBeenCalled());
    expect(toast.success).not.toHaveBeenCalled();
    const control = screen.getByRole('button', { name: 'Rehireable' });
    expect(control).toHaveClass('fa-check-square-o');
    expect(control.style.border).toBe('');
  });
});
