import React from 'react';
import { render, screen } from '@testing-library/react';
import IncompleteQuestionnaireIndicator, { INCOMPLETE_QUESTIONNAIRE_LABEL } from '..';

describe('IncompleteQuestionnaireIndicator', () => {
  it('renders an accessible indicator with an explanatory tooltip', () => {
    render(<IncompleteQuestionnaireIndicator />);
    const indicator = screen.getByTestId('incomplete-questionnaire-indicator');
    expect(indicator).toHaveAttribute('title', INCOMPLETE_QUESTIONNAIRE_LABEL);
    expect(screen.getByRole('img', { name: INCOMPLETE_QUESTIONNAIRE_LABEL })).toBeInTheDocument();
  });

  it('applies an additional className', () => {
    render(<IncompleteQuestionnaireIndicator className="extra" />);
    expect(screen.getByTestId('incomplete-questionnaire-indicator')).toHaveClass('extra');
  });
});
