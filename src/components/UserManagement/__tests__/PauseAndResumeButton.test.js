import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PauseAndResumeButton from '../PauseAndResumeButton';
import { PAUSE, RESUME } from '../../../languages/en/ui';
import { userProfileMock } from '../../../__tests__/mockStates';
import { renderWithProvider } from '../../../__tests__/utils';
jest.mock('react-toastify');

describe('PauseAndResumeButton', () => {
  beforeEach(() => {
    renderWithProvider(<PauseAndResumeButton isBigBtn userProfile={userProfileMock} />);
  });
  describe('Structure', () => {
    it('should render a button', () => {
      const pauseResumeButton = screen.getByTestId('pause-resume-button');;
      expect(pauseResumeButton).toBeInTheDocument();
    });
  });

  describe('Behavior', () => {
    it('should render modal after the user clicks the pause button', async () => {
      userEvent.click(screen.getByRole('button', { name: PAUSE }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should change pause button to resume button after user clicks on pause button', async() => {
      //Select a Pause button
      const pausebutton = screen.getAllByRole('button', { name: PAUSE })[0]

      //Click on Pause button
      await fireEvent.click(pausebutton);

      //Select a future date and click on 'Pause the User' button.
      const date = screen.getByTestId('date-input');
      waitFor(async ()=>await fireEvent.change(date, {target: {value: '2100-05-24'}}));
      await fireEvent.click(screen.getByRole('button', { name: /pause the user/i }));

      await expect(pausebutton).toHaveTextContent(RESUME);
    });

    it('should change resume button to pause button after user clicks on resume button', async() => {
      const button = screen.getAllByRole('button', { name: PAUSE })[0]

      //Click on Pause button
      await fireEvent.click(button);

      //Select a future date and click on 'Pause the User' button.
      const date = screen.getByTestId('date-input');
      waitFor(async ()=>await fireEvent.change(date, {target: {value: '2100-05-24'}}));
      await fireEvent.click(screen.getByRole('button', { name: /pause the user/i }));

      //Pause button is now changed to Resume. Click on Resume button to change it back to Pause button
      await fireEvent.click(button);
      await expect(button).toHaveTextContent(PAUSE);
    });
  });
});