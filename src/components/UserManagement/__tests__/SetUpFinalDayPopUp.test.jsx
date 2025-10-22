// eslint-disable-next-line no-unused-vars
import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import moment from 'moment';
import { Provider } from 'react-redux';
// eslint-disable-next-line import/no-named-as-default
import configureStore from 'redux-mock-store';
import SetUpFinalDayPopUp from '../SetUpFinalDayPopUp.jsx';
const mockStore = configureStore([]);
const onSaveMock = vi.fn();
const onCloseMock = vi.fn();

const renderComponent = (store, props) => {
  return render(
    <Provider store={store}>
      <SetUpFinalDayPopUp {...props} />
    </Provider>
  );
};

describe('SetUpFinalDayPopUp Component', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      theme: { darkMode: false },
    });
    onSaveMock.mockReset();
    onCloseMock.mockReset();
  });

  it('should render the modal with proper title and buttons', () => {
    renderComponent(store, { open: true, onClose: onCloseMock, onSave: onSaveMock });

    expect(screen.getByText('Set Your Final Day')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Close')).toBeInTheDocument();
  });

  it('should call onClose when the Close button is clicked', () => {
    renderComponent(store, { open: true, onClose: onCloseMock, onSave: onSaveMock });

    fireEvent.click(screen.getByText('Close'));
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('should display an error if the selected date is not in the future', () => {
    renderComponent(store, { open: true, onClose: onCloseMock, onSave: onSaveMock });

    fireEvent.change(screen.getByTestId('date-input'), {
      target: {
        value: moment()
          .subtract(1, 'days')
          .format('YYYY-MM-DD'),
      },
    });
    fireEvent.click(screen.getByText('Save'));

    expect(screen.getByText('Please choose a future date.')).toBeInTheDocument();
    expect(onSaveMock).not.toHaveBeenCalled();
  });

  it('should call onSave with the selected date if it is in the future', () => {
    const futureDate = moment()
      .add(1, 'days')
      .format('YYYY-MM-DD');
    renderComponent(store, { open: true, onClose: onCloseMock, onSave: onSaveMock });

    fireEvent.change(screen.getByTestId('date-input'), { target: { value: futureDate } });
    fireEvent.click(screen.getByText('Save'));

    const expectedIso = moment(futureDate, 'YYYY-MM-DD').endOf('day').toISOString();
    expect(onSaveMock).toHaveBeenCalledWith(expectedIso);
    expect(screen.queryByText('Please choose a future date.')).not.toBeInTheDocument();
  });

  it('should apply dark mode styles when darkMode is true', async () => {
    // store = mockStore({
    //   theme: { darkMode: true },
    // });
    renderComponent(store, { open: true, onClose: onCloseMock, onSave: onSaveMock, darkMode: true });
    
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByRole('heading', { name: 'Set Your Final Day' })).toBeInTheDocument();

    const dateInput = within(dialog).getByTestId('date-input');
    expect(dateInput).toHaveClass('bg-darkmode-liblack', 'text-light', 'border-0', 'calendar-icon-dark');

    expect(within(dialog).getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(within(dialog).getByText(/^Close$/)).toBeInTheDocument();
  });

  /// /////////////////////////

  it('should apply autoFocus to the date input field', () => {
    renderComponent(store, { open: true, onClose: onCloseMock, onSave: onSaveMock });

    const dateInput = screen.getByTestId('date-input');

    expect(dateInput).toBeInTheDocument();
  });

  it('should apply dark mode class to ModalBody when darkMode is true', () => {
    store = mockStore({
      theme: { darkMode: true },
    });
    renderComponent(store, { open: true, onClose: onCloseMock, onSave: onSaveMock });

    const dateInput = screen.getByTestId('date-input');
    expect(dateInput).toBeInTheDocument();

    expect(dateInput).toBeInTheDocument();
  });

  it('should not render the modal content when the open prop is false', () => {
    renderComponent(store, { open: false, onClose: onCloseMock, onSave: onSaveMock });

    expect(screen.queryByText('Set Your Final Day')).not.toBeInTheDocument();
    expect(screen.queryByText('Save')).not.toBeInTheDocument();
    expect(screen.queryByText('Close')).not.toBeInTheDocument();
  });

  it('should display an error message and not call onSave when an invalid date is selected', () => {
    renderComponent(store, { open: true, onClose: onCloseMock, onSave: onSaveMock });

    const pastDate = moment()
      .subtract(5, 'days')
      .format('YYYY-MM-DD');
    fireEvent.change(screen.getByTestId('date-input'), { target: { value: pastDate } });
    fireEvent.click(screen.getByText('Save'));


    expect(screen.getByText('Please choose a future date.')).toBeInTheDocument();
    expect(onSaveMock).not.toHaveBeenCalled();
  });
  it('should call onSave with the correct date when a valid future date is selected', () => {
    renderComponent(store, { open: true, onClose: onCloseMock, onSave: onSaveMock });

    const futureDate = moment()
      .add(10, 'days')
      .format('YYYY-MM-DD');
    fireEvent.change(screen.getByTestId('date-input'), { target: { value: futureDate } });
    fireEvent.click(screen.getByText('Save'));

    const expectedIso = moment(futureDate, 'YYYY-MM-DD').endOf('day').toISOString();
    expect(onSaveMock).toHaveBeenCalledWith(expectedIso);
  });
  it('should close the modal without calling onSave when the Close button is clicked', () => {
    renderComponent(store, { open: true, onClose: onCloseMock, onSave: onSaveMock });

    fireEvent.click(screen.getByText('Close'));

    expect(onCloseMock).toHaveBeenCalledTimes(1);
    expect(onSaveMock).not.toHaveBeenCalled();
  });
  it('should update the date value when the user selects a new date', () => {
    renderComponent(store, { open: true, onClose: onCloseMock, onSave: onSaveMock });

    const newDate = moment()
      .add(5, 'days')
      .format('YYYY-MM-DD');
    const dateInput = screen.getByTestId('date-input');

    fireEvent.change(dateInput, { target: { value: newDate } });

    expect(dateInput).toHaveValue(newDate);
  });
});
