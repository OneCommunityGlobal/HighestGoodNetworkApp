import React from 'react';
import { screen, render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureStore from 'redux-mock-store';
import ActivationDatePopup from '../ActivationDatePopup';
import { themeMock } from '__tests__/mockStates';
import { renderWithProvider } from '__tests__/utils';
import thunk from 'redux-thunk';

const mockStore = configureStore([thunk]);

describe('<ActivationDatePopup />', () => {
  const onClose = jest.fn();
  const onPause = jest.fn();
  let store;
  beforeEach(() => {
    store = mockStore({
      theme: themeMock,
    })

    renderWithProvider(<ActivationDatePopup open onClose={onClose} onPause={onPause} />, {store});
  });

  it('should render text `pause until`', () => {
    expect(screen.getByText(/pause until/i)).toBeInTheDocument();
  });
  it('should render 1 date input field', () => {
    expect(screen.getByTestId('date-input')).toBeInTheDocument();
  });
  it('should render one pause button. two close buttons', () => {
    expect(screen.getByRole('button', { name: /pause the user/i })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /close/i })).toHaveLength(1);
  });
  it('should change value while user type in the date input', async () => {
    const date = screen.getByTestId('date-input');
    userEvent.click(date);
    await userEvent.type(date, '2020-08-08', { allAtOnce: false });
    expect(date).toHaveValue('2020-08-08');
  });
  it('should fire onClose() when user clicks `close` button', () => {
    const buttons = screen.getAllByRole('button', { name: /close/i });
    userEvent.click(buttons[0]);
    expect(onClose).toBeCalledTimes(1);
  });
  it('should fire onPause() when user clicks `pause the user` button', async () => {
    const date = screen.getByTestId('date-input');
    const button = screen.getByRole('button', { name: /pause the user/i });
    await userEvent.type(date, '2100-08-30', { allAtOnce: false });
    userEvent.click(button);
    expect(onPause).toBeCalledTimes(1);
    expect(onPause).toBeCalledWith('2100-08-30');
  });
  it('should popup warning when selected date is earier than today', async () => {
    const date = screen.getByTestId('date-input');
    const button = screen.getByRole('button', { name: /pause the user/i });
    await userEvent.type(date, '2000-08-08', { allAtOnce: false });
    userEvent.click(button);
    expect(screen.getByText('Please choose a future date.')).toBeInTheDocument();
  });
});
