// import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PauseAndResumeButton from '../PauseAndResumeButton';
import { PAUSE, RESUME, PROCESSING } from '../../../languages/en/ui';
import { userProfileMock } from '../../../__tests__/mockStates';
import { renderWithProvider } from '../../../__tests__/utils';
import * as userMgmtActions from '../../../actions/userManagement';

vi.mock('react-toastify');

// Provide a default for loadUserProfile so the component doesn't error
PauseAndResumeButton.defaultProps = {
  loadUserProfile: vi.fn(),
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('PauseAndResumeButton', () => {
  // beforeEach(() => {

  // });

  describe('Structure', () => {
    it('should render a button', () => {
      renderWithProvider(<PauseAndResumeButton isBigBtn userProfile={userProfileMock} />);
      const pauseResumeButton = screen.getByTestId('pause-resume-button');
      expect(pauseResumeButton).toBeInTheDocument();
    });
  });

  describe('Behavior', () => {
    it('should render modal after the user clicks the pause button', async () => {
      renderWithProvider(<PauseAndResumeButton isBigBtn userProfile={userProfileMock} />);
      await userEvent.click(screen.getByRole('button', { name: PAUSE }));

      // Wait for the dialog to appear
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('should change pause button to processing and then to resume after clicking on "Pause the User"', async () => {
      let resolveUpdate;
      const updatePromise = new Promise(res => { resolveUpdate = res; });
      vi.spyOn(userMgmtActions, 'updateUserStatus').mockImplementation(() => {
        // return a thunk that returns our deferred promise
        return () => updatePromise;
      });
      renderWithProvider(<PauseAndResumeButton isBigBtn userProfile={userProfileMock} />);
      // Select a Pause button
      const pauseButton = screen.getAllByRole('button', { name: PAUSE })[0];

      // Click on Pause button to open the modal
      await userEvent.click(pauseButton);

      // Wait for the modal to appear
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Select a future date
      const dateInput = screen.getByTestId('date-input');
      await userEvent.type(dateInput, '2100-05-24');

      // Click on 'Pause the User' button to trigger processing
      const confirmButton = screen.getByRole('button', { name: /pause the user/i });
      await userEvent.click(confirmButton);

      // Expect the button to show PROCESSING and be disabled
      await waitFor(() => {
        expect(pauseButton).toHaveTextContent(PROCESSING)
        // expect(pauseButton).toBeDisabled();
      });
      await waitFor(() => expect(pauseButton).toBeDisabled());
      resolveUpdate();
      // Wait for the button text to change to RESUME after processing is complete
      await waitFor(() => {
        expect(pauseButton).toHaveTextContent(RESUME)
        // expect(pauseButton).not.toBeDisabled();
      });
      await waitFor(() => expect(pauseButton).not.toBeDisabled());
    });
  });
});
