import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import axios from 'axios';
import { toast } from 'react-toastify';
import WeeklyAutomationPanel from '../WeeklyAutomationPanel';

vi.mock('axios');
vi.mock('react-toastify', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const mockStore = configureMockStore([thunk]);

const buildStore = (permissions = ['putUserProfileImportantInfo'], darkMode = false) =>
  mockStore({
    theme: { darkMode },
    role: { roles: [{ roleName: 'Administrator', permissions }] },
    auth: { user: { role: 'Administrator', permissions: { frontPermissions: [] } } },
  });

const statusFor = (overrides = {}) => ({
  settings: {
    enabled: false,
    dayOfWeek: 0,
    hour: 8,
    minute: 0,
    timezone: 'America/Los_Angeles',
    alertRecipients: [],
    ...overrides,
  },
  nextScheduledSend: '2026-11-01T15:00:00.000Z',
  recipientCount: 3,
  recentRuns: [{ runKey: '2026-10-25', status: 'sent', trigger: 'schedule' }],
});

const renderPanel = store =>
  render(
    <Provider store={store}>
      <WeeklyAutomationPanel />
    </Provider>,
  );

describe('WeeklyAutomationPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockResolvedValue({ data: statusFor() });
  });

  it('shows a read-only line and calls no endpoint without the permission', () => {
    renderPanel(buildStore([]));

    expect(screen.getByText(/sent automatically/i)).toBeInTheDocument();
    expect(axios.get).not.toHaveBeenCalled();
  });

  it('loads the schedule and shows it as off', async () => {
    renderPanel(buildStore());

    expect(await screen.findByLabelText('Off')).not.toBeChecked();
    expect(screen.getByRole('heading', { name: 'Weekly automatic send' })).toBeInTheDocument();
    expect(screen.getByLabelText(/^Day/)).toHaveValue('0');
    expect(screen.getByLabelText(/^Time/)).toHaveValue('08:00');
    expect(screen.getByText(/Goes to 3 recipients/)).toBeInTheDocument();
    expect(screen.getByText('2026-10-25')).toBeInTheDocument();
  });

  it('shows an error when the status cannot be loaded', async () => {
    axios.get.mockRejectedValueOnce({ response: { data: { error: 'Nope' } } });
    renderPanel(buildStore());

    expect(await screen.findByRole('alert')).toHaveTextContent('Nope');
  });

  it('keeps Save disabled until something changes, then saves the new schedule', async () => {
    axios.put.mockResolvedValue({
      data: statusFor({ enabled: true, dayOfWeek: 1, hour: 9, minute: 30 }),
    });
    renderPanel(buildStore());

    const save = await screen.findByRole('button', { name: 'Save schedule' });
    expect(save).toBeDisabled();

    fireEvent.click(screen.getByLabelText('Off'));
    fireEvent.change(screen.getByLabelText(/^Day/), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/^Time/), { target: { value: '09:30' } });
    expect(save).toBeEnabled();
    fireEvent.click(save);

    await waitFor(() =>
      expect(axios.put).toHaveBeenCalledWith(expect.stringContaining('/orgsummaryemail/settings'), {
        enabled: true,
        dayOfWeek: 1,
        hour: 9,
        minute: 30,
        alertRecipients: [],
      }),
    );
    expect(toast.success).toHaveBeenCalledWith('Automatic send settings saved.');
    expect(await screen.findByLabelText('On')).toBeChecked();
  });

  it('blocks saving when an alert address is not an email', async () => {
    renderPanel(buildStore());

    fireEvent.change(await screen.findByLabelText('Extra failure alert recipients'), {
      target: { value: 'ops@example.com\nnot-an-email' },
    });

    expect(screen.getByRole('alert')).toHaveTextContent('not-an-email is not a valid email');
    expect(screen.getByRole('button', { name: 'Save schedule' })).toBeDisabled();
  });

  it('shows the server validation message when saving fails', async () => {
    axios.put.mockRejectedValue({ response: { data: { errors: ['hour must be an integer'] } } });
    renderPanel(buildStore());

    fireEvent.click(await screen.findByLabelText('Off'));
    fireEvent.click(screen.getByRole('button', { name: 'Save schedule' }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('hour must be an integer'));
  });

  it('asks for confirmation before sending and does not send on Cancel', async () => {
    renderPanel(buildStore());

    fireEvent.click(await screen.findByRole('button', { name: 'Send now' }));
    expect(screen.getByText(/Send to 3 recipients now\?/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(axios.post).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Send now' })).toBeInTheDocument();
  });

  it('sends after confirmation and reports the outcome', async () => {
    axios.post.mockResolvedValue({ data: { status: 'sent', recipients: 3 } });
    renderPanel(buildStore());

    fireEvent.click(await screen.findByRole('button', { name: 'Send now' }));
    fireEvent.click(screen.getByRole('button', { name: 'Yes, send' }));

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('Total Org Summary email sent.'),
    );
    expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/orgsummaryemail/send'), {});
    expect(axios.get).toHaveBeenCalledTimes(2);
  });

  it('tells the admin when this week was already sent', async () => {
    axios.post.mockResolvedValue({ data: { status: 'skipped' } });
    renderPanel(buildStore());

    fireEvent.click(await screen.findByRole('button', { name: 'Send now' }));
    fireEvent.click(screen.getByRole('button', { name: 'Yes, send' }));

    await waitFor(() => expect(toast.info).toHaveBeenCalledWith(expect.stringMatching(/already/)));
  });

  it('shows the failure when sending fails', async () => {
    axios.post.mockRejectedValue({ response: { data: { error: 'Login blocked' } } });
    renderPanel(buildStore());

    fireEvent.click(await screen.findByRole('button', { name: 'Send now' }));
    fireEvent.click(screen.getByRole('button', { name: 'Yes, send' }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Login blocked'));
  });
});
