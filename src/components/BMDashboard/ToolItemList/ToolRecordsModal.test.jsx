import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { vi } from 'vitest';

import { approveToolPurchase, rejectToolPurchase } from '~/actions/bmdashboard/toolActions';
import ToolRecordsModal, { Record } from './ToolRecordsModal';

vi.mock('~/actions/bmdashboard/toolActions', () => ({
  approveToolPurchase: vi.fn(),
  rejectToolPurchase: vi.fn(),
}));

const mockStore = configureMockStore([thunk]);

const pendingPurchase = {
  _id: 'purchase-1',
  date: '2026-01-15T00:00:00.000Z',
  status: 'Pending',
  makeModelPref: 'Test Drill',
  priority: 'High',
  quantity: 2,
  requestedBy: {
    _id: 'user-1',
    firstName: 'Test',
    lastName: 'Requester',
  },
  usageDesc: 'Use on Building 1',
};

const renderPurchaseRecord = (
  role,
  record = [pendingPurchase],
  setRecord = vi.fn(),
  { isAuthenticated = true, darkMode = false } = {},
) => {
  const store = mockStore({
    auth: { isAuthenticated, user: { role } },
    theme: { darkMode },
  });

  render(
    <Provider store={store}>
      <table>
        <Record record={record} setRecord={setRecord} recordType="Purchase" />
      </table>
    </Provider>,
  );

  return setRecord;
};

const renderToolModal = (darkMode = false) => {
  const store = mockStore({
    auth: { isAuthenticated: true, user: { role: 'Owner' } },
    theme: { darkMode },
  });

  render(
    <Provider store={store}>
      <ToolRecordsModal
        modal
        setModal={vi.fn()}
        record={[pendingPurchase]}
        setRecord={vi.fn()}
        recordType="Purchase"
      />
    </Provider>,
  );
};

describe('Tool purchase records', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    approveToolPurchase.mockReturnValue(() => Promise.resolve({ status: 200 }));
    rejectToolPurchase.mockReturnValue(() => Promise.resolve({ status: 200 }));
  });

  it.each(['Owner', 'Administrator'])('shows actions for %s users', role => {
    renderPurchaseRecord(role);

    expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reject' })).toBeInTheDocument();
  });

  it('hides approval actions from unauthorized roles', () => {
    renderPurchaseRecord('Volunteer');

    expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reject' })).not.toBeInTheDocument();
  });

  it('hides approval actions when authentication is false despite a stale Owner role', () => {
    renderPurchaseRecord('Owner', [pendingPurchase], vi.fn(), { isAuthenticated: false });

    expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reject' })).not.toBeInTheDocument();
  });

  it('approves a pending purchase and updates its displayed status', async () => {
    const setRecordSpy = vi.fn();
    renderPurchaseRecord('Owner', [pendingPurchase], setRecordSpy);

    await userEvent.click(screen.getByRole('button', { name: 'Approve' }));

    await waitFor(() => {
      expect(approveToolPurchase).toHaveBeenCalledWith('purchase-1', 2);
      expect(setRecordSpy).toHaveBeenCalledWith([
        expect.objectContaining({ _id: 'purchase-1', status: 'Approved' }),
      ]);
    });
  });

  it('rejects a pending purchase without changing any quantity fields', async () => {
    const setRecordSpy = vi.fn();
    renderPurchaseRecord('Administrator', [pendingPurchase], setRecordSpy);

    await userEvent.click(screen.getByRole('button', { name: 'Reject' }));

    await waitFor(() => {
      expect(rejectToolPurchase).toHaveBeenCalledWith('purchase-1');
      expect(setRecordSpy).toHaveBeenCalledWith([
        expect.objectContaining({ _id: 'purchase-1', status: 'Rejected', quantity: 2 }),
      ]);
    });
  });

  it('keeps the status unchanged and clears loading after approval fails', async () => {
    approveToolPurchase.mockReturnValue(() => Promise.resolve(null));
    const setRecordSpy = vi.fn();
    renderPurchaseRecord('Owner', [pendingPurchase], setRecordSpy);

    await userEvent.click(screen.getByRole('button', { name: 'Approve' }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Approve' })).toBeEnabled());
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(setRecordSpy).not.toHaveBeenCalled();
  });

  it('keeps the status unchanged and clears loading after rejection fails', async () => {
    rejectToolPurchase.mockReturnValue(() => Promise.resolve(null));
    const setRecordSpy = vi.fn();
    renderPurchaseRecord('Administrator', [pendingPurchase], setRecordSpy);

    await userEvent.click(screen.getByRole('button', { name: 'Reject' }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Reject' })).toBeEnabled());
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(setRecordSpy).not.toHaveBeenCalled();
  });

  it.each(['Approved', 'Rejected'])('disables actions after a purchase is %s', status => {
    renderPurchaseRecord('Owner', [{ ...pendingPurchase, status }]);

    expect(screen.getByRole('button', { name: 'Approve' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Reject' })).toBeDisabled();
  });

  it('applies the dark-mode modal class', () => {
    renderToolModal(true);

    // Reactstrap puts the custom class on the outer portal wrapper.
    // eslint-disable-next-line testing-library/no-node-access
    expect(document.body.querySelector('[class*="modalDark"]')).toBeInTheDocument();
  });
});
