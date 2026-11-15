import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import FormPreviewModal from '../FormPreviewModal';

describe('FormPreviewModal question numbering', () => {
  it('keeps preview labels aligned with the current visible question order', () => {
    render(
      <FormPreviewModal
        isOpen
        onClose={() => {}}
        jobTitle="Developer"
        darkMode={false}
        formFields={[
          { questionText: '4.) .) What is your location?', questionType: 'textbox' },
          {
            questionText: '2) Select your availability',
            questionType: 'radio',
            options: ['Weekdays'],
          },
        ]}
      />,
    );

    expect(screen.getByText('1.) What is your location?')).toBeInTheDocument();
    expect(screen.getByText('2.) Select your availability')).toBeInTheDocument();
  });
});
