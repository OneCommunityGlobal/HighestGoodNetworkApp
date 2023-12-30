import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import moment from 'moment';
import SetUpFinalDayPopUp from './SetUpFinalDayPopUp';

describe('SetUpFinalDayPopUp Component', () => {
  test('renders the component with initial state', () => {
    render(<SetUpFinalDayPopUp open={true} onClose={() => {}} onSave={() => {}} />);
    
    // Ensure the date input is rendered
    expect(screen.getByTestId('date-input')).toBeInTheDocument();
    
    // Ensure the Save and Close buttons are rendered
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Close')).toBeInTheDocument();
  });
  
  test('updates the date when input changes', () => {
    render(<SetUpFinalDayPopUp open={true} onClose={() => {}} onSave={() => {}} />);
    
    const dateInput = screen.getByTestId('date-input');
    
    // Simulate user entering a date
    fireEvent.change(dateInput, { target: { value: '2023-12-31' } });
    
    // Check if the state is updated
    expect(dateInput.value).toBe('2023-12-31');
  });

  test('calls onSave when Save is clicked with a future date', async () => {
    const onSaveMock = jest.fn();
    render(<SetUpFinalDayPopUp open={true} onClose={() => {}} onSave={onSaveMock} />);
    
    // Simulate user entering a future date
    fireEvent.change(screen.getByTestId('date-input'), { target: { value: '2023-12-31' } });
    
    // Click the Save button
    fireEvent.click(screen.getByText('Save'));

    // Ensure onSave is called
    await waitFor(() => {
      expect(onSaveMock).toHaveBeenCalled();
    });
  });
  
  test('displays date error alert when Save is clicked with a past date', () => {
    const onCloseMock = jest.fn();
    const onSaveMock = jest.fn();

    render(
      <SetUpFinalDayPopUp open={true} onClose={onCloseMock} onSave={onSaveMock} />
    );

    // Simulate a date change to a past date
    const dateInput = screen.getByTestId('date-input');
    fireEvent.change(dateInput, { target: { value: moment().subtract(1, 'days').format('YYYY-MM-DD') } });

    // Trigger the Save button click
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    // Check if the date error alert is rendered
    expect(screen.getByText('Please choose a future date.')).toBeInTheDocument();

    // Check if onSave is not called
    expect(onSaveMock).not.toHaveBeenCalled();

    // Check if onClose is not called
    expect(onCloseMock).not.toHaveBeenCalled();
  });
});
