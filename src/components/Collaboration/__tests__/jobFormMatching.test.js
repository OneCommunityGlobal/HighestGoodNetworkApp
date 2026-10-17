import { describe, expect, it } from 'vitest';
import {
  findApplicantFormBySlug,
  findDefaultSoftwareForm,
  findFormForJobTitle,
  isApplicantFacingForm,
  pickInitialForm,
} from '../JobApplicationForm/JobApplicationForm';
import {
  buildApplyPath,
  findPositionBySlug,
  slugifyPositionTitle,
} from '../JobApplicationForm/jobApplicationPublicApi';
import catalog from './fixtures/devJobCatalog.json';

/* Real shared-dev catalog: /api/jobs/positions titles and /api/jobforms/all titles (API order). */
const { positions } = catalog;
const forms = catalog.formTitles.map((title, idx) => ({ _id: `form-${idx}`, title }));
const RETIRED_TITLES = forms.map(f => f.title).filter(t => t.startsWith('[RETIRED]'));
const retiredFirst = [
  ...forms.filter(f => !isApplicantFacingForm(f)),
  ...forms.filter(isApplicantFacingForm),
];

/** Apply Now link the job board builds for a title — reported for every failing role. */
const applyLink = title => `${buildApplyPath(title)}?jobTitle=${encodeURIComponent(title)}`;

describe('isApplicantFacingForm', () => {
  it('filters out retired / internal ATS templates only', () => {
    expect(RETIRED_TITLES).toHaveLength(3);
    expect(forms.filter(f => !isApplicantFacingForm(f)).map(f => f.title)).toEqual(RETIRED_TITLES);
  });
});

describe('findFormForJobTitle', () => {
  it('resolves every dev position to the form with the same title', () => {
    const failures = positions
      .map(title => ({
        link: applyLink(title),
        expected: title,
        got: findFormForJobTitle(forms, title)?.title ?? null,
      }))
      .filter(r => r.got !== r.expected);
    expect(failures).toEqual([]);
  });

  it('never returns a retired form for junk or partial titles', () => {
    const inputs = [
      'Applied through site',
      'APPLIED THROUGH SITE - SEEKING SOFTWARE POSITION',
      'Seeking Software',
      'Test Create Form',
      '[RETIRED] T.A.S.T',
    ];
    const failures = inputs.flatMap(title =>
      [forms, retiredFirst]
        .map(formList => findFormForJobTitle(formList, title))
        .filter(match => match && !isApplicantFacingForm(match))
        .map(match => ({
          link: `/job-application?jobTitle=${encodeURIComponent(title)}`,
          got: match.title,
        })),
    );
    expect(failures).toEqual([]);
  });

  it('maps the old default title to the live software form', () => {
    expect(
      findFormForJobTitle(retiredFirst, 'APPLIED THROUGH SITE - SEEKING SOFTWARE POSITION')?.title,
    ).toBe('SEEKING SOFTWARE POSITION');
  });

  it('treats an ambiguous partial title as no match instead of guessing', () => {
    // Three live T.A.S.T. roles contain "t.a.s.t".
    expect(findFormForJobTitle(forms, 'T.A.S.T')).toBeNull();
  });

  it('matches regardless of case and punctuation', () => {
    expect(findFormForJobTitle(forms, 'photoshop graphic designer')?.title).toBe(
      'PHOTOSHOP/GRAPHIC DESIGNER',
    );
    expect(findFormForJobTitle(forms, 't a s t hgn')?.title).toBe('T.A.S.T. - HGN');
  });
});

describe('slug round-trip for /apply/<slug> deep links', () => {
  it('maps every dev position slug back to the same form and dropdown title', () => {
    const failures = positions
      .map(title => {
        const slug = slugifyPositionTitle(title);
        return {
          link: buildApplyPath(title),
          expected: title,
          form: findApplicantFormBySlug(forms, slug)?.title ?? null,
          dropdown: findPositionBySlug(positions, slug) || null,
        };
      })
      .filter(r => r.form !== r.expected || r.dropdown !== r.expected);
    expect(failures).toEqual([]);
  });

  it('never resolves a slug to a retired form', () => {
    const slug = slugifyPositionTitle('[RETIRED] APPLIED THROUGH SITE - SEEKING SOFTWARE POSITION');
    expect(findApplicantFormBySlug(forms, slug)).toBeNull();
  });
});

describe('findDefaultSoftwareForm', () => {
  it('picks SEEKING SOFTWARE POSITION, not the retired ATS form', () => {
    expect(findDefaultSoftwareForm(forms)?.title).toBe('SEEKING SOFTWARE POSITION');
    expect(findDefaultSoftwareForm(retiredFirst)?.title).toBe('SEEKING SOFTWARE POSITION');
  });

  it('returns null when only retired forms exist', () => {
    expect(findDefaultSoftwareForm(forms.filter(f => !isApplicantFacingForm(f)))).toBeNull();
  });
});

describe('pickInitialForm', () => {
  const byTitle = title => forms.find(f => f.title === title);

  it('prefers an explicit formId', () => {
    const target = byTitle('GENERAL');
    expect(
      pickInitialForm(forms, { formId: target._id, jobTitle: 'MASTER CARPENTER' }, 'vermiculture'),
    ).toBe(target);
  });

  it('uses the slug before the title', () => {
    expect(pickInitialForm(forms, { jobTitle: 'MASTER CARPENTER' }, 'vermiculture')?.title).toBe(
      'VERMICULTURE',
    );
  });

  it('matches the navigated job title', () => {
    expect(
      pickInitialForm(forms, { jobTitle: 'T.A.S.T. - NEED RESUME & WORK SAMPLES' }, '')?.title,
    ).toBe('T.A.S.T. - NEED RESUME & WORK SAMPLES');
  });

  it('falls back to the default software form for an unknown title or slug', () => {
    expect(pickInitialForm(retiredFirst, { jobTitle: 'Applied through site' }, '')?.title).toBe(
      'SEEKING SOFTWARE POSITION',
    );
    expect(pickInitialForm(retiredFirst, {}, 'does-not-exist')?.title).toBe(
      'SEEKING SOFTWARE POSITION',
    );
  });

  it('returns null with no navigation context', () => {
    expect(pickInitialForm(forms, {}, '')).toBeNull();
  });
});
