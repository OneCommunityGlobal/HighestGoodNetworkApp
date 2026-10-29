/**
 * Helpers for the public (logged-out) job application portal.
 * Schema GET + submit POST must work with no Authorization header.
 */

/** Human-readable position title → URL slug (e.g. "Software Engineer" → "software-engineer"). */
export function slugifyPositionTitle(title) {
  return String(title || '')
    .toLowerCase()
    .trim()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .join('-');
}

/** Build a friendly apply URL for a position title. */
export function buildApplyPath(title, { base = '/apply' } = {}) {
  const slug = slugifyPositionTitle(title);
  if (!slug) return '/job-application';
  return `${base}/${slug}`;
}

function hasApplicantToken() {
  try {
    return Boolean(globalThis.localStorage?.getItem('token'));
  } catch {
    return false;
  }
}

/**
 * Axios config for public apply APIs.
 * When the visitor is anonymous, strip Authorization so a stale default JWT
 * cannot force a 401 on endpoints that are intentionally open.
 * Logged-in applicants keep their token (public routes still accept it).
 */
export function publicApplyRequestConfig(extra = {}) {
  if (hasApplicantToken()) {
    return extra;
  }

  return {
    ...extra,
    headers: {
      ...extra.headers,
      // axios 1.x: `false` removes a header for this request (including defaults).
      Authorization: false,
    },
  };
}

/**
 * Applicant-facing forms must not expose inactive, retired, or internal
 * "Applied Through Site" templates.
 */
export function isApplicantVisibleForm(form) {
  if (!form || form.isActive === false) return false;

  const title = String(form.title || '').trim();
  return !/\[retired\]|applied through site/i.test(title);
}

export function filterApplicantVisibleForms(forms) {
  return (Array.isArray(forms) ? forms : []).filter(isApplicantVisibleForm);
}

export function filterApplicantVisiblePositions(positions) {
  return (Array.isArray(positions) ? positions : []).filter(position => {
    if (position && typeof position === 'object' && position.isActive === false) {
      return false;
    }

    const title = typeof position === 'string' ? position : position?.title;
    return !/\[retired\]|applied through site/i.test(String(title || '').trim());
  });
}

/** Match a form by URL slug against form titles. */
export function findFormByPositionSlug(formsArr, slug) {
  if (!slug || !formsArr?.length) return null;
  const target = String(slug)
    .trim()
    .toLowerCase();
  if (!target) return null;

  return formsArr.find(f => slugifyPositionTitle(f.title) === target) || null;
}

/** Canonical dropdown title for a URL slug (e.g. "t-a-s-t-hgn" → "T.A.S.T. - HGN"). */
export function findPositionBySlug(options, slug) {
  const target = String(slug || '')
    .trim()
    .toLowerCase();
  if (!target || !options?.length) return '';
  return options.find(o => slugifyPositionTitle(o) === target) || '';
}

/** Decode slug into a rough job title hint for matching / banner display. */
export function titleHintFromSlug(slug) {
  return String(slug || '')
    .replaceAll('-', ' ')
    .replaceAll(/\s+/g, ' ')
    .trim();
}

/** Ensure the navigated job title appears in the position dropdown options. */
export function ensurePositionOption(options, title) {
  const list = Array.isArray(options) ? [...options] : [];
  const t = String(title || '').trim();
  if (!t) return list;
  if (
    list.some(
      o =>
        String(o)
          .trim()
          .toLowerCase() === t.toLowerCase(),
    )
  ) {
    return list;
  }
  return [t, ...list];
}
