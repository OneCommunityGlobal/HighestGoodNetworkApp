import { describe, expect, it } from 'vitest';
import { collectMissingRequiredFields } from '../JobApplicationForm/JobApplicationForm';
import { isResumeQuestion } from '../JobApplicationForm/jobApplicationQuestionUtils';

const resumeFile = { name: 'resume.pdf', size: 1024 };

function missingFor({ visibleQuestions = [], answers = [], file = null } = {}) {
  return collectMissingRequiredFields({
    profileErrors: {},
    visibleQuestions,
    answers,
    questionFiles: {},
    resumeFile: file,
  });
}

describe('collectMissingRequiredFields — resume requirement', () => {
  it('requires a resume even when the role template has no resume question', () => {
    const visibleQuestions = [
      { questionText: 'Why do you want to join?', questionType: 'textbox' },
    ];
    expect(missingFor({ visibleQuestions, answers: ['Because'] })).toContain('Resume');
  });

  it('requires a resume when the form has no questions at all', () => {
    expect(missingFor()).toEqual(['Resume']);
  });

  it('does not report the resume once a file is attached', () => {
    expect(missingFor({ file: resumeFile })).not.toContain('Resume');
  });

  it('reports the resume alongside other missing required fields', () => {
    const visibleQuestions = [
      { questionText: 'Portfolio link', questionType: 'textbox', isRequired: true },
    ];
    const missing = collectMissingRequiredFields({
      profileErrors: { applicantEmail: 'Email is required.' },
      visibleQuestions,
      answers: [''],
      questionFiles: {},
      resumeFile: null,
    });
    expect(missing).toEqual(['Email is required.', 'Resume', 'Portfolio link']);
  });
});

describe('isResumeQuestion', () => {
  it.each([
    'Resume',
    'Upload your resume',
    'Upload Résumé',
    'Résumé (PDF)',
    'CV',
    'Attach your CV/portfolio',
    'Curriculum Vitae',
  ])('recognizes "%s"', questionText => {
    expect(isResumeQuestion({ questionText })).toBe(true);
  });

  it('reads the label field as well as questionText', () => {
    expect(isResumeQuestion({ label: 'Résumé' })).toBe(true);
  });

  it.each(['Resumes reviewed by', 'cvs pharmacy experience', 'Describe your career goals', ''])(
    'does not match "%s"',
    questionText => {
      expect(isResumeQuestion({ questionText })).toBe(false);
    },
  );
});
