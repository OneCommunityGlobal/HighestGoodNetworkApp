import { screen, waitFor , render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PauseAndResumeButton from '../PauseAndResumeButton';
import { PAUSE, RESUME } from '../../../languages/en/ui';
import { userProfileMock } from '../../../__tests__/mockStates';
import { vi } from 'vitest';
import { Provider } from 'react-redux';

import { updateUserPauseStatus } from '../../../actions/userManagement';

vi.mock('../../../actions/userManagement', () => ({
  updateUserPauseStatus: vi.fn(() => async () => Promise.resolve()),
}));

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const createThunkStore = () => ({
  getState: () => ({
    theme: {
      darkMode: false,
    },
    auth: {
      user: {
        userid: userProfileMock._id,
        role: 'Administrator',
        permissions: ['interactWithPauseUserButton'],
        email: 'test@example.com',
      },
    },
  }),
  dispatch: action =>
    typeof action === 'function'
      ? action(() => {}, () => ({}))
      : action,
  subscribe: () => () => {},
});

describe('PauseAndResumeButton', () => {
  const loadUserProfile = vi.fn(() => Promise.resolve());

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderPauseButton = ui =>
    render(ui, {
      wrapper: ({ children }) => (
        <Provider store={createThunkStore()}>{children}</Provider>
      ),
    });

  it('renders pause button when user is active', () => {
    renderPauseButton(
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
    renderPauseButton(
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
    renderPauseButton(
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
      expect(updateUserPauseStatus).toHaveBeenCalled();
      expect(
        screen.getByRole('button', { name: RESUME })
      ).toBeInTheDocument();
    })
    expect(updateUserPauseStatus).toHaveBeenCalledWith(
        expect.objectContaining({ _id: userProfileMock._id }),
        'Inactive',
        expect.anything()
      );;
  });

  it('resumes user and switches button back to PAUSE', async () => {
    renderPauseButton(
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
      expect(updateUserPauseStatus).toHaveBeenCalled();
      expect(
        screen.getByRole('button', { name: PAUSE })
      ).toBeInTheDocument();
    })
    expect(updateUserPauseStatus).toHaveBeenCalledWith(
        expect.objectContaining({ _id: userProfileMock._id }),
        'Active',
        expect.any(Number)
      );;
  });
});
