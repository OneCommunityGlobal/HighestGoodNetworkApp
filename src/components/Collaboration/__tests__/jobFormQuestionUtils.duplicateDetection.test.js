import {
  normalizeQuestionText,
  isDuplicateQuestion,
  findDuplicateQuestions,
} from '../jobFormQuestionUtils';

describe('normalizeQuestionText', () => {
  it('trims leading and trailing whitespace', () => {
    expect(normalizeQuestionText('  What is your name?  ')).toBe('what is your name');
  });

  it('collapses internal whitespace', () => {
    expect(normalizeQuestionText('What   is    your name?')).toBe('what is your name');
  });

  it('lowercases the text', () => {
    expect(normalizeQuestionText('WHAT IS YOUR NAME?')).toBe('what is your name');
  });

  it('strips trailing punctuation', () => {
    expect(normalizeQuestionText('What is your name???')).toBe('what is your name');
    expect(normalizeQuestionText('What is your name.')).toBe('what is your name');
    expect(normalizeQuestionText('What is your name;')).toBe('what is your name');
  });

  it('returns empty string for null/undefined/empty input', () => {
    expect(normalizeQuestionText(null)).toBe('');
    expect(normalizeQuestionText(undefined)).toBe('');
    expect(normalizeQuestionText('')).toBe('');
  });
});

describe('isDuplicateQuestion', () => {
  const existingFields = [
    { questionText: 'What is your favorite color?' },
    { questionText: 'How many years of experience do you have?' },
  ];

  it('returns true for an exact match', () => {
    const candidate = { questionText: 'What is your favorite color?' };
    expect(isDuplicateQuestion(candidate, existingFields)).toBe(true);
  });

  it('returns true for a near-exact match (different casing/spacing/punctuation)', () => {
    const candidate = { questionText: '  what IS your   favorite color??  ' };
    expect(isDuplicateQuestion(candidate, existingFields)).toBe(true);
  });

  it('returns false when the question is genuinely new', () => {
    const candidate = { questionText: 'What is your greatest weakness?' };
    expect(isDuplicateQuestion(candidate, existingFields)).toBe(false);
  });

  it('returns false when candidate text is empty', () => {
    const candidate = { questionText: '' };
    expect(isDuplicateQuestion(candidate, existingFields)).toBe(false);
  });

  it('returns false when existingFields is empty', () => {
    const candidate = { questionText: 'What is your favorite color?' };
    expect(isDuplicateQuestion(candidate, [])).toBe(false);
  });

  it('supports fields using the label property instead of questionText', () => {
    const fieldsWithLabel = [{ label: 'What is your favorite color?' }];
    const candidate = { label: 'What is your favorite color?' };
    expect(isDuplicateQuestion(candidate, fieldsWithLabel)).toBe(true);
  });
});

describe('findDuplicateQuestions', () => {
  const existingFields = [{ questionText: 'What is your favorite color?' }];

  it('returns only the candidates that duplicate existing fields', () => {
    const candidates = [
      { questionText: 'What is your favorite color?' }, // duplicate
      { questionText: 'What is your dream job?' }, // new
    ];
    const result = findDuplicateQuestions(candidates, existingFields);
    expect(result).toHaveLength(1);
    expect(result[0].questionText).toBe('What is your favorite color?');
  });

  it('returns an empty array when there are no duplicates', () => {
    const candidates = [
      { questionText: 'What is your dream job?' },
      { questionText: 'Why do you want to work here?' },
    ];
    expect(findDuplicateQuestions(candidates, existingFields)).toEqual([]);
  });

  it('detects duplicates within the candidate batch itself', () => {
    const candidates = [
      { questionText: 'What is your dream job?' },
      { questionText: 'what is your DREAM job???' }, // duplicate of the one above
    ];
    const result = findDuplicateQuestions(candidates, []);
    expect(result).toHaveLength(1);
  });

  it('returns an empty array when candidates is empty', () => {
    expect(findDuplicateQuestions([], existingFields)).toEqual([]);
  });

  it('returns an empty array when existingFields is empty and no internal duplicates', () => {
    const candidates = [{ questionText: 'A' }, { questionText: 'B' }];
    expect(findDuplicateQuestions(candidates, [])).toEqual([]);
  });
});
