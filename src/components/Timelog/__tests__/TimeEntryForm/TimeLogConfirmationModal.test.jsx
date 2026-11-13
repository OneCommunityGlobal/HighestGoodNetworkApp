import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import moment from 'moment-timezone';
import TimeLogConfirmationModal from '../../TimeEntryForm/TimeLogConfirmationModal';

describe('TimeLogConfirmationModal Component', () => {
  const baseProps = () => ({
    isOpen: true,
    toggleModal: vi.fn(),
    onBack: vi.fn(),
    onSubmit: vi.fn(),
    darkMode: false,
  });

  it('shows the INTANGIBLE TIME REASON title and explanatory text', () => {
    render(<TimeLogConfirmationModal {...baseProps()} />);
    expect(screen.getByText('INTANGIBLE TIME REASON')).toBeInTheDocument();
    expect(
      screen.getByText(
        /you must include a reason why you didn.t use the required timer/i,
      ),
    ).toBeInTheDocument();
  });

  it('defaults the date picker to today', () => {
    render(<TimeLogConfirmationModal {...baseProps()} />);
    const dateInput = screen.getByLabelText('DATE THIS BELONGS ON:');
    expect(dateInput.value).toBe(moment().format('YYYY-MM-DD'));
  });

  it('keeps submit disabled until the reason has at least 10 words and a date is set', () => {
    render(<TimeLogConfirmationModal {...baseProps()} />);
    const submitButton = screen.getByText("I've added all the specifics, submit!");
    const reasonInput = screen.getByPlaceholderText('Detailed reason (10-word minimum)');
    const dateInput = screen.getByLabelText('DATE THIS BELONGS ON:');

    expect(submitButton).toBeDisabled();

    fireEvent.change(reasonInput, { target: { value: 'too short reason' } });
    expect(submitButton).toBeDisabled();

    fireEvent.change(reasonInput, {
      target: { value: 'this reason definitely has at least ten words in it now' },
    });
    expect(submitButton).not.toBeDisabled();

    fireEvent.change(dateInput, { target: { value: '' } });
    expect(submitButton).toBeDisabled();
  });

  it('calls onSubmit with the trimmed reason and chosen date once valid', () => {
    const props = baseProps();
    render(<TimeLogConfirmationModal {...props} />);
    const submitButton = screen.getByText("I've added all the specifics, submit!");
    const reasonInput = screen.getByPlaceholderText('Detailed reason (10-word minimum)');
    const dateInput = screen.getByLabelText('DATE THIS BELONGS ON:');

    fireEvent.change(reasonInput, {
      target: { value: '  this reason definitely has at least ten words in it now  ' },
    });
    fireEvent.change(dateInput, { target: { value: '2026-01-15' } });
    fireEvent.click(submitButton);

    expect(props.onSubmit).toHaveBeenCalledWith(
      'this reason definitely has at least ten words in it now',
      '2026-01-15',
    );
  });

  it('calls onBack when "Whoops, take me back to edit this." is clicked', () => {
    const props = baseProps();
    render(<TimeLogConfirmationModal {...props} />);
    fireEvent.click(screen.getByText('Whoops, take me back to edit this.'));
    expect(props.onBack).toHaveBeenCalled();
  });

  it('does not render modal content when isOpen is false', () => {
    render(<TimeLogConfirmationModal {...baseProps()} isOpen={false} />);
    expect(screen.queryByText('INTANGIBLE TIME REASON')).not.toBeInTheDocument();
  });
});
