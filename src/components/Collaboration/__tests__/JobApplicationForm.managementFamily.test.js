import { describe, it, expect } from 'vitest';
import {
  findFormByManagementFamily,
  findFormForJobTitle,
  isManagementFamilySoftMatch,
} from '../JobApplicationForm/JobApplicationForm';

const FORMS = [
  {
    _id: 'admin-pr-review',
    title: 'ADMIN OF PR REVIEW TEAM AND FRONTEND TESTER',
    questions: [{ questionText: 'React experience?' }],
  },
  {
    _id: 'admin-assistant',
    title: 'Administrative Assistant',
    questions: [{ questionText: 'Office tools?' }],
  },
  {
    _id: 'software',
    title: 'SEEKING SOFTWARE POSITION',
    questions: [{ questionText: 'Years of JS?' }],
  },
  {
    _id: 'retired-admin',
    title: '[RETIRED] APPLIED THROUGH SITE - ADMINISTRATIVE',
    questions: [],
  },
];

describe('findFormByManagementFamily', () => {
  it('maps Office Coordinator to Administrative Assistant, not the PR-review form', () => {
    const form = findFormByManagementFamily(FORMS, 'Office Coordinator');
    expect(form?._id).toBe('admin-assistant');
    expect(form?.title).toBe('Administrative Assistant');
  });

  it('maps Environmental Planner to Administrative Assistant, not the PR-review form', () => {
    const form = findFormByManagementFamily(FORMS, 'Environmental Planner');
    expect(form?._id).toBe('admin-assistant');
  });

  it('does not treat ADMIN OF PR REVIEW as a management-family candidate', () => {
    const onlyPrReview = FORMS.filter(f => f._id === 'admin-pr-review');
    expect(findFormByManagementFamily(onlyPrReview, 'Office Coordinator')).toBeNull();
  });

  it('returns null for unrelated software job titles', () => {
    expect(findFormByManagementFamily(FORMS, 'Software Developer')).toBeNull();
  });
});

describe('findFormForJobTitle + soft match', () => {
  it('resolves Office Coordinator through management family to Administrative Assistant', () => {
    const form = findFormForJobTitle(FORMS, 'Office Coordinator');
    expect(form?._id).toBe('admin-assistant');
    expect(isManagementFamilySoftMatch(FORMS, 'Office Coordinator', form)).toBe(true);
  });

  it('resolves Environmental Planner through management family to Administrative Assistant', () => {
    const form = findFormForJobTitle(FORMS, 'Environmental Planner');
    expect(form?._id).toBe('admin-assistant');
    expect(isManagementFamilySoftMatch(FORMS, 'Environmental Planner', form)).toBe(true);
  });

  it('keeps exact software title matching', () => {
    const form = findFormForJobTitle(FORMS, 'SEEKING SOFTWARE POSITION');
    expect(form?._id).toBe('software');
    expect(isManagementFamilySoftMatch(FORMS, 'SEEKING SOFTWARE POSITION', form)).toBe(false);
  });

  it('never matches retired applied-through-site forms', () => {
    const form = findFormForJobTitle(FORMS, 'Administrative Assistant');
    expect(form?._id).toBe('admin-assistant');
  });
});
