import { describe, expect, it } from 'vitest';
import {
  DEFAULT_FIXED_FIELDS,
  getVisibleStandardApplicantFields,
  normalizeFixedFields,
} from '../jobFormQuestionUtils';

describe('normalizeFixedFields', () => {
  it('defaults missing flags to true', () => {
    expect(normalizeFixedFields(undefined)).toEqual(DEFAULT_FIXED_FIELDS);
    expect(normalizeFixedFields({})).toEqual(DEFAULT_FIXED_FIELDS);
  });

  it('preserves explicit false flags', () => {
    expect(
      normalizeFixedFields({
        includePersonalInfo: false,
        includeBasicInfo: true,
      }),
    ).toEqual({
      includePersonalInfo: false,
      includeBasicInfo: true,
      includeExperience: true,
      includeAvailability: true,
    });
  });
});

describe('getVisibleStandardApplicantFields', () => {
  it('returns all standard fields when fixedFields are default', () => {
    const fields = getVisibleStandardApplicantFields(DEFAULT_FIXED_FIELDS);
    expect(fields.map(f => f.label)).toEqual([
      'First Name',
      'Last Name',
      'Email',
      'Location',
      'Time Zone',
      'Phone number',
      'Company & position',
      'Primary website / social',
      'Upload Resume (optional)',
    ]);
  });

  it('hides personal-info fields when includePersonalInfo is false', () => {
    const fields = getVisibleStandardApplicantFields({
      ...DEFAULT_FIXED_FIELDS,
      includePersonalInfo: false,
    });
    expect(fields.map(f => f.label)).toEqual([
      'Location',
      'Time Zone',
      'Phone number',
      'Primary website / social',
      'Upload Resume (optional)',
    ]);
  });

  it('hides basic-info fields when includeBasicInfo is false', () => {
    const fields = getVisibleStandardApplicantFields({
      ...DEFAULT_FIXED_FIELDS,
      includeBasicInfo: false,
    });
    expect(fields.map(f => f.label)).toEqual([
      'First Name',
      'Last Name',
      'Email',
      'Company & position',
    ]);
  });
});
