import { describe, expect, it } from 'vitest';
import {
  isDegreeMajorQuestion,
  isTechnologyExperienceQuestion,
  missingTechnologyYearMessages,
  serializeTechnologyAnswer,
  syncTechnologyDetails,
} from '../jobQuestionFollowUps';

describe('job question follow-ups', () => {
  it('hides the degree major question and keeps the other listing questions', () => {
    expect(isDegreeMajorQuestion({ questionText: 'What is your degree major?' })).toBe(true);
    expect(
      isDegreeMajorQuestion({
        questionText: 'What is the minimum length of time (in months) you are willing to pledge?',
      }),
    ).toBe(false);
    expect(isDegreeMajorQuestion({ questionText: 'What is your location and time zone?' })).toBe(
      false,
    );
  });

  it('recognizes the technology experience question', () => {
    expect(
      isTechnologyExperienceQuestion({
        questionText: 'Which of the following technologies do you have full time experience in',
      }),
    ).toBe(true);
    expect(
      isTechnologyExperienceQuestion({
        questionText: 'How many hours a week can you give towards this role?',
      }),
    ).toBe(false);
  });

  it('keeps a full-time flag and years input for every selected technology', () => {
    const details = syncTechnologyDetails({ 'React.JS': { fullTime: true, years: '3' } }, [
      'React.JS',
      'Python',
    ]);

    expect(details).toEqual({
      'React.JS': { fullTime: true, years: '3' },
      Python: { fullTime: false, years: '' },
    });
    expect(serializeTechnologyAnswer(['React.JS', 'Python'], details)).toEqual([
      { technology: 'React.JS', fullTime: true, years: '3' },
      { technology: 'Python', fullTime: false, years: '' },
    ]);
    expect(missingTechnologyYearMessages(['React.JS', 'Python'], details)).toEqual([
      'Years of experience for Python',
    ]);
  });
});
