import {
  buildApplyPath,
  ensurePositionOption,
  findFormByPositionSlug,
  publicApplyRequestConfig,
  slugifyPositionTitle,
  titleHintFromSlug,
} from '../JobApplicationForm/jobApplicationPublicApi';

describe('jobApplicationPublicApi', () => {
  describe('slugifyPositionTitle', () => {
    it('slugifies titles for friendly apply URLs', () => {
      expect(slugifyPositionTitle('Software Engineer')).toBe('software-engineer');
      expect(slugifyPositionTitle('  Full-Stack / React  ')).toBe('full-stack-react');
    });
  });

  describe('buildApplyPath', () => {
    it('builds /apply/<slug> paths', () => {
      expect(buildApplyPath('Product Manager')).toBe('/apply/product-manager');
      expect(buildApplyPath('')).toBe('/job-application');
    });
  });

  describe('findFormByPositionSlug', () => {
    const forms = [
      { _id: '1', title: 'Software Engineer' },
      { _id: '2', title: 'UX Designer' },
    ];

    it('matches a form by slug', () => {
      expect(findFormByPositionSlug(forms, 'software-engineer')?._id).toBe('1');
      expect(findFormByPositionSlug(forms, 'ux-designer')?.title).toBe('UX Designer');
    });

    it('returns null when no slug match', () => {
      expect(findFormByPositionSlug(forms, 'unknown-role')).toBeNull();
    });
  });

  describe('titleHintFromSlug', () => {
    it('turns slugs into readable title hints', () => {
      expect(titleHintFromSlug('software-engineer')).toBe('software engineer');
    });
  });

  describe('ensurePositionOption', () => {
    it('prepends a missing title', () => {
      expect(ensurePositionOption(['Chef'], 'Executive Assistant')).toEqual([
        'Executive Assistant',
        'Chef',
      ]);
    });

    it('does not duplicate an existing title', () => {
      expect(ensurePositionOption(['Chef'], 'chef')).toEqual(['Chef']);
    });
  });

  describe('publicApplyRequestConfig', () => {
    const originalToken = globalThis.localStorage?.getItem('token');

    afterEach(() => {
      if (originalToken == null) {
        globalThis.localStorage?.removeItem('token');
      } else {
        globalThis.localStorage?.setItem('token', originalToken);
      }
    });

    it('strips Authorization when anonymous', () => {
      globalThis.localStorage?.removeItem('token');
      const config = publicApplyRequestConfig({
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      expect(config.headers.Authorization).toBe(false);
      expect(config.headers['Content-Type']).toBe('multipart/form-data');
    });

    it('keeps config unchanged when a token is present', () => {
      globalThis.localStorage?.setItem('token', 'jwt-test');
      const config = publicApplyRequestConfig({ headers: { 'X-Test': '1' } });
      expect(config.headers.Authorization).toBeUndefined();
      expect(config.headers['X-Test']).toBe('1');
    });
  });
});
