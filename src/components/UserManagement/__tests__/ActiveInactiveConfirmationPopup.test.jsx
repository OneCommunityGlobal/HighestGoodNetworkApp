import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { configureStore } from 'redux-mock-store';
import thunk from 'redux-thunk';
import ActiveInactiveConfirmationPopup from '../ActiveInactiveConfirmationPopup';
import { renderWithProvider } from '../../../__tests__/utils';
import { themeMock } from '../../../__tests__/mockStates';
import { InactiveReason } from '../../../utils/enums';
import { vi } from 'vitest';

const mockStore = configureStore([thunk]);

describe('ActiveInactiveConfirmationPopup', () => {
  let store;
  const onClose = vi.fn();
  const onDeactivateImmediate = vi.fn();
  const onScheduleFinalDay = vi.fn();
  const onCancelScheduledDeactivation = vi.fn();
  const onReactivateUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    store = mockStore({ theme: themeMock });
  });

  it('renders modal and user name', () => {
    renderWithProvider(
      <ActiveInactiveConfirmationPopup
        open
        fullName="Test Admin"
        isActive
        onClose={onClose}
      />,
      { store }
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/test admin/i)).toBeInTheDocument();
  });

  it('shows inactive message when user is separated', () => {
    renderWithProvider(
      <ActiveInactiveConfirmationPopup
        open
        fullName="Test Admin"
        isActive={false}
        inactiveReason={InactiveReason.SEPARATED}
        onClose={onClose}
      />,
      { store }
    );

    expect(screen.getByText(/this user is inactive/i)).toBeInTheDocument();
  });

  it('shows deactivate and set final day buttons for active user', () => {
    renderWithProvider(
      <ActiveInactiveConfirmationPopup
        open
        fullName="Test Admin"
        isActive
        onClose={onClose}
        onDeactivateImmediate={onDeactivateImmediate}
        onScheduleFinalDay={onScheduleFinalDay}
      />,
      { store }
    );

    expect(screen.getByRole('button', { name: /deactivate immediately/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /set final day/i })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /close/i }).length).toBeGreaterThan(0);
  });

  it('calls onDeactivateImmediate and onClose when clicking deactivate', async () => {
    renderWithProvider(
      <ActiveInactiveConfirmationPopup
        open
        fullName="Test Admin"
        isActive
        onClose={onClose}
        onDeactivateImmediate={onDeactivateImmediate}
      />,
      { store }
    );

    await userEvent.click(
      screen.getByRole('button', { name: /deactivate immediately/i })
    );

    expect(onDeactivateImmediate).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows reactivate button for inactive user', () => {
    renderWithProvider(
      <ActiveInactiveConfirmationPopup
        open
        fullName="Test Admin"
        isActive={false}
        inactiveReason={InactiveReason.PAUSED}
        onReactivateUser={onReactivateUser}
        onClose={onClose}
      />,
      { store }
    );

    expect(screen.getByRole('button', { name: /reactivate user/i })).toBeInTheDocument();
  });

  it('calls onReactivateUser and onClose when clicking reactivate', async () => {
    renderWithProvider(
      <ActiveInactiveConfirmationPopup
        open
        fullName="Test Admin"
        isActive={false}
        inactiveReason={InactiveReason.PAUSED}
        onReactivateUser={onReactivateUser}
        onClose={onClose}
      />,
      { store }
    );

    await userEvent.click(
      screen.getByRole('button', { name: /reactivate user/i })
    );

    expect(onReactivateUser).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
