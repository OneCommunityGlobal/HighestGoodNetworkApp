import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import moment from 'moment';
import SetUpFinalDayPopUp from '../../components/UserManagement/SetUpFinalDayPopUp';

describe('SetUpFinalDayPopUp', () => {
  it('renders without crashing', () => {
    render(<SetUpFinalDayPopUp open onClose={() => {}} onSave={() => {}} />);
  });

  it('calls onClose when close button is clicked', () => {
    const onCloseMock = jest.fn();
    const { getByText } = render(<SetUpFinalDayPopUp open onClose={onCloseMock} onSave={() => {}} />);

    fireEvent.click(getByText('Close'));

    expect(onCloseMock).toHaveBeenCalled();
  });

  it('calls onSave with correct date when Save button is clicked with a future date', () => {
    const onSaveMock = jest.fn();
    const { getByText, getByTestId } = render(
      <SetUpFinalDayPopUp open onClose={() => {}} onSave={onSaveMock} />
    );

    const futureDate = moment().add(1, 'days').format('YYYY-MM-DD');
    fireEvent.change(getByTestId('date-input'), { target: { value: futureDate } });
    fireEvent.click(getByText('Save'));

    expect(onSaveMock).toHaveBeenCalledWith(futureDate);
  });

  it('shows date error when Save button is clicked with a past date', () => {
    const onSaveMock = jest.fn();
    const { getByText, getByTestId, getByRole } = render(
      <SetUpFinalDayPopUp open onClose={() => {}} onSave={onSaveMock} />
    );

    const pastDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
    fireEvent.change(getByTestId('date-input'), { target: { value: pastDate } });
    fireEvent.click(getByText('Save'));

    expect(onSaveMock).not.toHaveBeenCalled();
    expect(getByRole('alert')).toHaveTextContent('Please choose a future date.');
  });
});
