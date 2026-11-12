import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { toast } from 'react-toastify';
import RentedToolsDisplay from '../RentedTools/RentedToolsDisplay';
import { DAY_MS } from '../alertUtils';
import { fetchTools } from '~/actions/bmdashboard/toolActions';
import {
  extendRental,
  markRentalReturned,
  sendRentalReminder,
} from '~/actions/bmdashboard/rentalActions';

vi.mock('~/actions/bmdashboard/toolActions', () => ({
  fetchTools: vi.fn(() => () => Promise.resolve()),
}));
vi.mock('~/actions/bmdashboard/equipmentActions', () => ({
  fetchAllEquipments: vi.fn(() => () => Promise.resolve()),
}));
vi.mock('~/actions/bmdashboard/rentalActions', () => ({
  markRentalReturned: vi.fn(),
  extendRental: vi.fn(),
  sendRentalReminder: vi.fn(),
}));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

const PROJECT = 'p1';
const DUE = new Date(Date.now() + 2 * DAY_MS);
const mockStore = configureMockStore([thunk]);

const state = {
  theme: { darkMode: false },
  bmTools: {
    toolslist: [
      {
        _id: 't1',
        project: { _id: PROJECT },
        purchaseStatus: 'Rental',
        rentalDueDate: DUE.toISOString(),
        itemType: { name: 'Drill' },
      },
    ],
  },
  bmEquipments: { equipmentslist: [] },
};

const setup = () => {
  render(
    <Provider store={mockStore(state)}>
      <Router history={createMemoryHistory()}>
        <RentedToolsDisplay projectId={PROJECT} />
      </Router>
    </Provider>,
  );
};

const openCardAction = async name => {
  const card = await screen.findByTestId('alert-card-t1');
  fireEvent.click(within(card).getByRole('button', { name }));
};

beforeEach(() => vi.clearAllMocks());

describe('rental quick actions', () => {
  it('marks a rental returned after confirmation and refreshes the list', async () => {
    markRentalReturned.mockResolvedValue({ ok: true, status: 200, data: { returnedLate: false } });
    setup();
    await openCardAction('Mark returned');
    expect(markRentalReturned).not.toHaveBeenCalled();
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Mark returned' }),
    );

    await waitFor(() => expect(markRentalReturned).toHaveBeenCalledWith('t1'));
    expect(toast.success).toHaveBeenCalledWith('Drill marked as returned');
    await waitFor(() => expect(fetchTools).toHaveBeenCalledTimes(2));
  });

  it('notes a late return in the confirmation', async () => {
    markRentalReturned.mockResolvedValue({ ok: true, status: 200, data: { returnedLate: true } });
    setup();
    await openCardAction('Mark returned');
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Mark returned' }),
    );
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('Drill marked as returned (returned late)'),
    );
  });

  it('extends a rental with a date after the current due date', async () => {
    extendRental.mockResolvedValue({ ok: true, status: 200, data: {} });
    setup();
    await openCardAction('Extend rental');
    const input = screen.getByLabelText('New due date');
    // Defaults to a week after the current due date.
    expect(new Date(`${input.value}T12:00`).getTime()).toBeGreaterThan(DUE.getTime());
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Extend rental' }),
    );

    await waitFor(() => expect(extendRental).toHaveBeenCalledWith('t1', expect.any(String)));
    expect(new Date(extendRental.mock.calls[0][1]).getTime()).toBeGreaterThan(DUE.getTime());
    expect(toast.success).toHaveBeenCalled();
  });

  it('blocks an extension date before the minimum', async () => {
    setup();
    await openCardAction('Extend rental');
    fireEvent.change(screen.getByLabelText('New due date'), { target: { value: '2000-01-01' } });
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Extend rental' }),
    );
    // The date input's min blocks submission natively, as in a browser.
    expect(screen.getByLabelText('New due date')).toBeInvalid();
    expect(extendRental).not.toHaveBeenCalled();
  });

  it('shows the server error inside the extend dialog', async () => {
    extendRental.mockResolvedValue({
      ok: false,
      status: 400,
      data: { message: 'The new due date must be after the current due date.' },
    });
    setup();
    await openCardAction('Extend rental');
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Extend rental' }),
    );
    expect(await screen.findByRole('alert')).toHaveTextContent('after the current due date');
  });

  it('confirms an emailed reminder', async () => {
    sendRentalReminder.mockResolvedValue({
      ok: true,
      status: 200,
      data: { sentTo: 'Ana Lee', emailSent: true },
    });
    setup();
    await openCardAction('Send reminder');
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('Return reminder emailed to Ana Lee'),
    );
  });

  it('says so when email is off in this environment', async () => {
    sendRentalReminder.mockResolvedValue({
      ok: true,
      status: 200,
      data: { sentTo: 'Ana Lee', emailSent: false },
    });
    setup();
    await openCardAction('Send reminder');
    await waitFor(() =>
      expect(toast.info).toHaveBeenCalledWith(expect.stringMatching(/turned off/)),
    );
  });

  it('shows the cooldown and missing-person messages from the server', async () => {
    sendRentalReminder.mockResolvedValueOnce({
      ok: false,
      status: 429,
      data: { message: 'A reminder was already sent for this item in the last 24 hours.' },
    });
    sendRentalReminder.mockResolvedValueOnce({
      ok: false,
      status: 422,
      data: { message: 'No responsible person with an email address is recorded for this item.' },
    });
    setup();
    await openCardAction('Send reminder');
    await waitFor(() => expect(toast.info).toHaveBeenCalledWith(expect.stringMatching(/24 hours/)));
    await openCardAction('Send reminder');
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(expect.stringMatching(/No responsible person/)),
    );
  });
});
