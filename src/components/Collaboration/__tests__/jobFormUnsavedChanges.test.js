import { describe, expect, it } from 'vitest';
import { hasUnsavedJobFormChanges } from '../jobFormDirtyState';

const initialNewField = {
  questionText: '',
  questionType: 'textbox',
  options: [],
  visible: true,
  isRequired: false,
  required: false,
};

function getState(overrides = {}) {
  return {
    formFields: [{ questionText: 'Why?' }],
    initialFormFields: [{ questionText: 'Why?' }],
    newField: initialNewField,
    initialNewField,
    templateName: '',
    jobTitle: 'Software Engineer',
    initialJobTitle: 'Software Engineer',
    ...overrides,
  };
}

describe('hasUnsavedJobFormChanges', () => {
  it('returns false when the persisted form state is unchanged', () => {
    expect(hasUnsavedJobFormChanges(getState())).toBe(false);
  });

  it('tracks a changed job title', () => {
    expect(hasUnsavedJobFormChanges(getState({ jobTitle: 'Project Manager' }))).toBe(true);
  });

  it('tracks changed form fields', () => {
    expect(
      hasUnsavedJobFormChanges(
        getState({ formFields: [{ questionText: 'Why do you want to volunteer?' }] }),
      ),
    ).toBe(true);
  });

  it('tracks a partially entered new question', () => {
    expect(
      hasUnsavedJobFormChanges(
        getState({ newField: { ...initialNewField, questionText: 'New question' } }),
      ),
    ).toBe(true);
  });

  it('tracks an unsaved template name', () => {
    expect(hasUnsavedJobFormChanges(getState({ templateName: 'Engineering form' }))).toBe(true);
  });
});
