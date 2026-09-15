import { stripLeadingQuestionNumber, numberedQuestionLabel } from '../jobFormQuestionUtils';

describe('stripLeadingQuestionNumber', () => {
  it.each([
    ['13.) What is your name?', 'What is your name?', '"N.)" style prefix'],
    ['2. What is your email?', 'What is your email?', '"N." style prefix'],
    ['7) What is your role?', 'What is your role?', '"N)" style prefix'],
    ['4- What is your role?', 'What is your role?', '"N-" style prefix'],
  ])('strips a %s (%s)', (input, expected) => {
    expect(stripLeadingQuestionNumber(input)).toBe(expected);
  });

  it('leaves text without a leading number untouched', () => {
    expect(stripLeadingQuestionNumber('What is your name?')).toBe('What is your name?');
  });

  it('does not strip a number that is not at the very start', () => {
    expect(stripLeadingQuestionNumber('Question 5 details')).toBe('Question 5 details');
  });

  it('returns empty string for null/undefined/empty input', () => {
    expect(stripLeadingQuestionNumber(null)).toBe('');
    expect(stripLeadingQuestionNumber(undefined)).toBe('');
    expect(stripLeadingQuestionNumber('')).toBe('');
  });
});

describe('numberedQuestionLabel', () => {
  it('prepends the correct 1-based number for a given index', () => {
    expect(numberedQuestionLabel('What is your name?', 0)).toBe('1.) What is your name?');
    expect(numberedQuestionLabel('What is your email?', 4)).toBe('5.) What is your email?');
  });

  it('replaces a stale embedded number with the live position-based number', () => {
    // Question was originally 3rd (index 2) but moved to 1st (index 0):
    // old baked-in "3.)" should be replaced with the correct "1.)"
    expect(numberedQuestionLabel('3.) What is your name?', 0)).toBe('1.) What is your name?');
  });

  it('works correctly across a simulated reorder (swap)', () => {
    const fields = ['1.) Name', '2.) Email', '3.) Phone'];
    // simulate moving index 2 up to index 0
    const reordered = [fields[2], fields[0], fields[1]];
    const labels = reordered.map((text, index) => numberedQuestionLabel(text, index));
    expect(labels).toEqual(['1.) Phone', '2.) Name', '3.) Email']);
  });
});
