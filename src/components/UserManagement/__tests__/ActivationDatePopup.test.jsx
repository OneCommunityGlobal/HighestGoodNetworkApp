// import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { configureStore } from 'redux-mock-store';
import thunk from 'redux-thunk';
import ActivationDatePopup from '../ActivationDatePopup';
import { themeMock } from '../../../__tests__/mockStates';
import { renderWithProvider } from '../../../__tests__/utils';

const mockStore = configureStore([thunk]);

describe('<ActivationDatePopup />', () => {
  const onClose = vi.fn();
  const onPause = vi.fn();
  let store;
  beforeEach(() => {
    store = mockStore({
      theme: themeMock,
    })

  });

  it('should render text `pause until`', () => {
    renderWithProvider(<ActivationDatePopup open onClose={onClose} onPause={onPause} />, { store });
    expect(screen.getByText(/pause until/i)).toBeInTheDocument();
  });
  it('should render 1 date input field', () => {
    renderWithProvider(<ActivationDatePopup open onClose={onClose} onPause={onPause} />, { store });
    expect(screen.getByTestId('date-input')).toBeInTheDocument();
  });
  it('should render one pause button. two close buttons', () => {
    renderWithProvider(<ActivationDatePopup open onClose={onClose} onPause={onPause} />, { store });
    expect(screen.getByRole('button', { name: /pause the user/i })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /close/i })).toHaveLength(2);
  });
  it('should change value while user type in the date input', async () => {
    renderWithProvider(<ActivationDatePopup open onClose={onClose} onPause={onPause} />, { store });
    const date = screen.getByTestId('date-input');
    await userEvent.click(date);
    await userEvent.type(date, '2020-08-08', { allAtOnce: false });
    expect(date).toHaveValue('2020-08-08');
  });
  it('should fire onClose() when user clicks `close` buttons', async () => {
    renderWithProvider(<ActivationDatePopup open onClose={onClose} onPause={onPause} />, { store });
    const buttons = screen.getAllByRole('button', { name: /close/i });
    await userEvent.click(buttons[0]);
    await userEvent.click(buttons[1]);
    expect(onClose).toBeCalledTimes(2);
  });
  it('should fire onPause() when user clicks `pause the user` button', async () => {
    renderWithProvider(<ActivationDatePopup open onClose={onClose} onPause={onPause} />, { store });
    const date = screen.getByTestId('date-input');
    const button = screen.getByRole('button', { name: /pause the user/i });
    await userEvent.type(date, '2100-08-30', { allAtOnce: false });
    await userEvent.click(button);
    expect(onPause).toBeCalledTimes(1);
    expect(onPause).toBeCalledWith('2100-08-30');
  });
  it('should popup warning when selected date is earier than today', async () => {
    renderWithProvider(<ActivationDatePopup open onClose={onClose} onPause={onPause} />, { store });
    const date = screen.getByTestId('date-input');
    const button = screen.getByRole('button', { name: /pause the user/i });
    await userEvent.type(date, '2000-08-08', { allAtOnce: false });
    await userEvent.click(button);
    expect(screen.getByText('Please choose a future date.')).toBeInTheDocument();
  });
});
