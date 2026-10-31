import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import IncompleteQuestionnaireIndicator, { INCOMPLETE_QUESTIONNAIRE_LABEL } from '..';

describe('IncompleteQuestionnaireIndicator', () => {
  it('renders an accessible indicator anchored to a unique id', () => {
    render(<IncompleteQuestionnaireIndicator id="user123" />);
    const indicator = screen.getByRole('img', { name: INCOMPLETE_QUESTIONNAIRE_LABEL });
    expect(indicator).toHaveAttribute('id', 'incomplete-questionnaire-user123');
  });

  it('shows the tooltip message on hover', async () => {
    render(<IncompleteQuestionnaireIndicator id="user123" />);
    await userEvent.hover(screen.getByTestId('incomplete-questionnaire-indicator'));
    expect(await screen.findByRole('tooltip')).toHaveTextContent(INCOMPLETE_QUESTIONNAIRE_LABEL);
  });

  it('applies an additional className', () => {
    render(<IncompleteQuestionnaireIndicator id="user123" className="extra" />);
    expect(screen.getByTestId('incomplete-questionnaire-indicator')).toHaveClass('extra');
  });
});
