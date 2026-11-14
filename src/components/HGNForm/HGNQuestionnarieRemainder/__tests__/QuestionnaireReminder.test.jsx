import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import QuestionnaireReminder from '../components/QuestionnaireReminder';

vi.mock('reactstrap', () => ({
  Modal: ({ children, isOpen, backdrop, keyboard, centered }) => (
    <div
      data-testid="questionnaire-modal"
      data-open={isOpen}
      data-backdrop={backdrop}
      data-keyboard={keyboard}
      data-centered={centered}
    >
      {children}
    </div>
  ),
  ModalBody: ({ children, className }) => <div className={className}>{children}</div>,
}));

describe('QuestionnaireReminder', () => {
  it('renders the questionnaire reminder message', () => {
    render(<QuestionnaireReminder onComplete={vi.fn()} />);

    expect(screen.getByText('Complete Your HGN Skills Questionnaire')).toBeInTheDocument();

    expect(
      screen.getByText('Please complete the questionnaire before accessing the dashboard.'),
    ).toBeInTheDocument();
  });

  it('renders an open, non-dismissible modal', () => {
    render(<QuestionnaireReminder onComplete={vi.fn()} />);

    const modal = screen.getByTestId('questionnaire-modal');

    expect(modal).toHaveAttribute('data-open', 'true');
    expect(modal).toHaveAttribute('data-backdrop', 'static');
    expect(modal).toHaveAttribute('data-keyboard', 'false');
    expect(modal).toHaveAttribute('data-centered', 'true');
  });

  it('calls onComplete when the button is clicked', () => {
    const onComplete = vi.fn();

    render(<QuestionnaireReminder onComplete={onComplete} />);

    fireEvent.click(screen.getByRole('button', { name: 'Complete Questionnaire' }));

    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
