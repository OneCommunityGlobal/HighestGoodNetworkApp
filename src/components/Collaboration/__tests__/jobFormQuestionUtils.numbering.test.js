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

  it.each([null, undefined, ''])('returns an empty string for %s', questionText => {
    expect(stripLeadingQuestionNumber(questionText)).toBe('');
  });

  it.each(['Question 5 details', 'What is your name?'])(
    'leaves text without a leading number untouched: %s',
    questionText => {
      expect(stripLeadingQuestionNumber(questionText)).toBe(questionText);
    },
  );

  it('replaces a stale embedded number with the 1-based position', () => {
    expect(numberedQuestionLabel('3.) What is your name?', 0)).toBe('1.) What is your name?');
  });

  it('produces sequential labels after a simulated reorder', () => {
    const saved = ['1.) Name?', '2.) Email?', '3.) Phone?'];
    const swapped = [saved[2], saved[1], saved[0]];
    expect(swapped.map((text, index) => numberedQuestionLabel(text, index))).toEqual([
      '1.) Phone?',
      '2.) Email?',
      '3.) Name?',
    ]);
  });

  it('documents current behavior for empty and whitespace-only labels', () => {
    expect(numberedQuestionLabel('', 0)).toBe('1.) ');
    expect(numberedQuestionLabel(null, 1)).toBe('2.) ');
    expect(numberedQuestionLabel('   ', 0)).toBe('1.)    ');
  });
});
