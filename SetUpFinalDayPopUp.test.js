import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import moment from 'moment';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import SetUpFinalDayPopUp from '../SetUpFinalDayPopUp';



const mockStore = configureStore([]);
const onSaveMock = jest.fn();
const onCloseMock = jest.fn();

const renderComponent = (store, props) =>
  render(
    <Provider store={store}>
      <SetUpFinalDayPopUp {...props} />
    </Provider>
  );

describe('SetUpFinalDayPopUp Component', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      theme: { darkMode: false },
    });
    jest.clearAllMocks();
  });

  it('renders modal with title and buttons', () => {
    renderComponent(store, {
      open: true,
      onClose: onCloseMock,
      onSave: onSaveMock,
    });

    expect(screen.getByText('Set Your Final Day')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Close')).toBeInTheDocument();
  });

  it('calls onClose when Close is clicked', () => {
    renderComponent(store, {
      open: true,
      onClose: onCloseMock,
      onSave: onSaveMock,
    });

    fireEvent.click(screen.getByText('Close'));
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('shows error if selected date is not in the future', () => {
    renderComponent(store, {
      open: true,
      onClose: onCloseMock,
      onSave: onSaveMock,
    });

    const pastDate = moment()
      .subtract(1, 'days')
      .format('YYYY-MM-DD');

    fireEvent.change(screen.getByTestId('date-input'), {
      target: { value: pastDate },
    });
    fireEvent.click(screen.getByText('Save'));

    expect(
      screen.getByText('Please choose a future date.')
    ).toBeInTheDocument();
    expect(onSaveMock).not.toHaveBeenCalled();
  });

  it('calls onSave with valid future date', () => {
    const futureDate = moment()
      .add(1, 'days')
      .format('YYYY-MM-DD');

    renderComponent(store, {
      open: true,
      onClose: onCloseMock,
      onSave: onSaveMock,
    });

    fireEvent.change(screen.getByTestId('date-input'), {
      target: { value: futureDate },
    });
    fireEvent.click(screen.getByText('Save'));

    expect(onSaveMock).toHaveBeenCalledWith(futureDate);
    expect(
      screen.queryByText('Please choose a future date.')
    ).not.toBeInTheDocument();
  });

  it('applies dark mode styles when darkMode is true', () => {
    store = mockStore({ theme: { darkMode: true } });
    renderComponent(store, {
      open: true,
      onClose: onCloseMock,
      onSave: onSaveMock,
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('auto-focuses on date input field', () => {
    renderComponent(store, {
      open: true,
      onClose: onCloseMock,
      onSave: onSaveMock,
    });

    const dateInput = screen.getByTestId('date-input');
    expect(dateInput).toHaveFocus();
  });

  it('does not render modal content when open is false', () => {
    renderComponent(store, {
      open: false,
      onClose: onCloseMock,
      onSave: onSaveMock,
    });

    expect(
      screen.queryByText('Set Your Final Day')
    ).not.toBeInTheDocument();
  });

  it('shows error and does not call onSave on invalid past date', () => {
    const pastDate = moment()
      .subtract(5, 'days')
      .format('YYYY-MM-DD');

    renderComponent(store, {
      open: true,
      onClose: onCloseMock,
      onSave: onSaveMock,
    });

    fireEvent.change(screen.getByTestId('date-input'), {
      target: { value: pastDate },
    });
    fireEvent.click(screen.getByText('Save'));

    expect(
      screen.getByText('Please choose a future date.')
    ).toBeInTheDocument();
    expect(onSaveMock).not.toHaveBeenCalled();
  });

  it('calls onSave on valid future date', () => {
    const futureDate = moment()
      .add(10, 'days')
      .format('YYYY-MM-DD');

    renderComponent(store, {
      open: true,
      onClose: onCloseMock,
      onSave: onSaveMock,
    });

    fireEvent.change(screen.getByTestId('date-input'), {
      target: { value: futureDate },
    });
    fireEvent.click(screen.getByText('Save'));

    expect(onSaveMock).toHaveBeenCalledWith(futureDate);
  });

  it('closes modal without calling onSave when Close is clicked', () => {
    renderComponent(store, {
      open: true,
      onClose: onCloseMock,
      onSave: onSaveMock,
    });

    fireEvent.click(screen.getByText('Close'));

    expect(onCloseMock).toHaveBeenCalledTimes(1);
    expect(onSaveMock).not.toHaveBeenCalled();
  });

  it('updates date value on change', () => {
    const newDate = moment()
      .add(5, 'days')
      .format('YYYY-MM-DD');

    renderComponent(store, {
      open: true,
      onClose: onCloseMock,
      onSave: onSaveMock,
    });

    const dateInput = screen.getByTestId('date-input');
    fireEvent.change(dateInput, { target: { value: newDate } });

    expect(dateInput).toHaveValue(newDate);
  });
});
