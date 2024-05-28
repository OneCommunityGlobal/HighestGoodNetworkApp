import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DueDateTime from '../DueDateTime';
import moment from 'moment-timezone';

describe('DueDateTime Component Tests', () => {
  const mockDueDate = moment();
  const displayTime = moment(mockDueDate).tz('America/Los_Angeles').add(1, 'second');

  it('should render correctly', () => {
    render(<DueDateTime dueDate={mockDueDate} isShow={true} />);
    expect(
      screen
        .getByText(`${displayTime.format('MMM-DD-YY')} at ${displayTime.format('HH:mm')} PST`)
    ).toBeInTheDocument();
  });

  it('should display the right text when isShow switch', () => {
    const { rerender } = render(<DueDateTime dueDate={mockDueDate} isShow={false} />);
    expect(screen.getByText('Weekly Summary Due Date (click to add)')).toBeInTheDocument();

    rerender(<DueDateTime dueDate={mockDueDate} isShow={true} />);
    expect(screen.getByText('Weekly Summary Due Date (click to close)')).toBeInTheDocument();
  });
});
