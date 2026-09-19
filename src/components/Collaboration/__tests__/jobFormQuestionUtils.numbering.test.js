import { describe, expect, it } from 'vitest';
import { numberedQuestionLabel, stripLeadingQuestionNumber } from '../jobFormQuestionUtils';

describe('job form question numbering', () => {
  it.each([
    ['2.) What is your location?', 'What is your location?'],
    ['  2. What is your location?', 'What is your location?'],
    ['2) What is your location?', 'What is your location?'],
    ['2- What is your location?', 'What is your location?'],
    ['4.) .) What is your location?', 'What is your location?'],
  ])('removes legacy prefix %s', (questionText, expected) => {
    expect(stripLeadingQuestionNumber(questionText)).toBe(expected);
  });

  it('uses the current position instead of a saved number', () => {
    expect(numberedQuestionLabel('4.) What is your location?', 0)).toBe(
      '1.) What is your location?',
    );
    expect(numberedQuestionLabel('What is your availability?', 2)).toBe(
      '3.) What is your availability?',
    );
  });

  it.each(['1-2 years of experience', '2.5 years of experience'])(
    'preserves a non-numbering leading value: %s',
    questionText => {
      expect(stripLeadingQuestionNumber(questionText)).toBe(questionText);
    },
  );
});
