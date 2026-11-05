import { describe, expect, it } from 'vitest';
import { isJobApplicationFileUploadQuestion } from '../JobApplicationForm/jobApplicationQuestionUtils';

describe('isJobApplicationFileUploadQuestion', () => {
  it.each(['file', 'upload', 'document', 'attachment'])(
    'recognizes the explicit %s question type',
    questionType => {
      expect(
        isJobApplicationFileUploadQuestion({ questionType, questionText: 'Additional details' }),
      ).toBe(true);
    },
  );

  it.each([
    'Second Document',
    'Supporting document (optional)',
    'Please upload your identity document',
    'Attach your cover letter',
  ])('recognizes the upload prompt "%s"', questionText => {
    expect(isJobApplicationFileUploadQuestion({ questionText })).toBe(true);
  });

  it.each([
    'How do you document your work?',
    'Describe this document',
    'Tell us about your documentation process',
    'Upload a work sample',
    'Portfolio file',
    'Attach a writing sample',
  ])('does not misclassify the text prompt "%s"', questionText => {
    expect(isJobApplicationFileUploadQuestion({ questionText })).toBe(false);
  });

  it('keeps the dedicated resume upload separate', () => {
    expect(
      isJobApplicationFileUploadQuestion({ questionType: 'file', questionText: 'Upload resume' }),
    ).toBe(false);
  });
});
