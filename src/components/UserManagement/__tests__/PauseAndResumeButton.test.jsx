import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PauseAndResumeButton from '../PauseAndResumeButton';
import { PAUSE, RESUME } from '../../../languages/en/ui';
import { userProfileMock } from '../../../__tests__/mockStates';
import { renderWithProvider } from '../../../__tests__/utils';
import { vi } from 'vitest';

import {
  pauseUserAction,
  activateUserAction,
} from '../../../actions/userLifecycleActions';

vi.mock('../../../actions/userLifecycleActions', () => ({
  pauseUserAction: vi.fn(() => Promise.resolve()),
  activateUserAction: vi.fn(() => Promise.resolve()),
}));

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('PauseAndResumeButton', () => {
  const loadUserProfile = vi.fn(() => Promise.resolve());

  it('renders pause button when user is active', () => {
    renderWithProvider(
      <PauseAndResumeButton
        isBigBtn
        userProfile={{ ...userProfileMock, isActive: true }}
        loadUserProfile={loadUserProfile}
      />
    );

    expect(
      screen.getByRole('button', { name: PAUSE })
    ).toBeInTheDocument();
  });

  it('opens activation date popup when clicking pause', async () => {
    renderWithProvider(
      <PauseAndResumeButton
        isBigBtn
        userProfile={{ ...userProfileMock, isActive: true }}
        loadUserProfile={loadUserProfile}
      />
    );

    await userEvent.click(
      screen.getByRole('button', { name: PAUSE })
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('pauses user and switches button to RESUME', async () => {
    renderWithProvider(
      <PauseAndResumeButton
        isBigBtn
        userProfile={{ ...userProfileMock, isActive: true }}
        loadUserProfile={loadUserProfile}
      />
    );

    // Open popup
    await userEvent.click(
      screen.getByRole('button', { name: PAUSE })
    );

    // Set reactivation date
    const dateInput = await screen.findByTestId('date-input');
    await userEvent.type(dateInput, '2100-05-24');

    // Confirm pause
    await userEvent.click(
      screen.getByRole('button', { name: /pause the user/i })
    );

    await waitFor(() => {
      expect(pauseUserAction).toHaveBeenCalledTimes(1);
      expect(
        screen.getByRole('button', { name: RESUME })
      ).toBeInTheDocument();
    });
  });

  it('resumes user and switches button back to PAUSE', async () => {
    renderWithProvider(
      <PauseAndResumeButton
        isBigBtn
        userProfile={{ ...userProfileMock, isActive: false }}
        loadUserProfile={loadUserProfile}
      />
    );

    await userEvent.click(
      screen.getByRole('button', { name: RESUME })
    );

    await waitFor(() => {
      expect(activateUserAction).toHaveBeenCalledTimes(1);
      expect(
        screen.getByRole('button', { name: PAUSE })
      ).toBeInTheDocument();
    });
  });
});
