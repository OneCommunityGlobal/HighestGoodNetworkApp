/** Normalize question type strings from API, templates, and legacy data. */
export function normalizeQuestionType(field) {
  const raw = String(field?.questionType || field?.type || 'textbox').toLowerCase();
  if (raw === 'text' || raw === 'email') return 'textbox';
  return raw;
}

/** Detect email questions when type is missing or stored inconsistently. */
export function isEmailQuestion(field) {
  const raw = String(field?.questionType || field?.type || '').toLowerCase();
  if (raw === 'email') return true;
  const text = String(field?.questionText || field?.label || '').toLowerCase();
  return /\bemail\b/.test(text) && !/\bphone\b/.test(text);
}

export function resolveInputType(field) {
  if (isEmailQuestion(field)) return 'email';
  return 'text';
}

/**
 * Backend JobForms.fixedFields defaults. Missing/undefined flags mean "on"
 * so existing forms keep today's apply-page behavior.
 */
export const DEFAULT_FIXED_FIELDS = {
  includePersonalInfo: true,
  includeBasicInfo: true,
  includeExperience: true,
  includeAvailability: true,
};

export function normalizeFixedFields(fixedFields) {
  return {
    includePersonalInfo: fixedFields?.includePersonalInfo !== false,
    includeBasicInfo: fixedFields?.includeBasicInfo !== false,
    includeExperience: fixedFields?.includeExperience !== false,
    includeAvailability: fixedFields?.includeAvailability !== false,
  };
}

/** Toggle labels shown in the Job Form Builder for fixedFields. */
export const FIXED_FIELD_GROUP_OPTIONS = [
  {
    key: 'includePersonalInfo',
    label: 'Name, email & company',
    description: 'First Name, Last Name, Email, Company & position',
  },
  {
    key: 'includeBasicInfo',
    label: 'Location, phone, web & resume',
    description: 'Location, Time Zone, Phone, Primary website / social, Upload Resume',
  },
  {
    key: 'includeExperience',
    label: 'Skills & motivation section flag',
    description: 'Stored on the form for compatibility (custom questions cover this on apply)',
  },
  {
    key: 'includeAvailability',
    label: 'Availability section flag',
    description: 'Stored on the form for compatibility (custom questions cover this on apply)',
  },
];

/**
 * Default profile block on /job-application. UI is frontend; visibility is driven
 * by each form's backend fixedFields. Keep labels/types in sync with apply page.
 */
export const STANDARD_APPLICANT_FIELDS = [
  {
    label: 'First Name',
    required: true,
    inputType: 'text',
    placeholder: 'First Name',
    fixedFieldGroup: 'includePersonalInfo',
  },
  {
    label: 'Last Name',
    required: true,
    inputType: 'text',
    placeholder: 'Last Name',
    fixedFieldGroup: 'includePersonalInfo',
  },
  {
    label: 'Email',
    required: true,
    inputType: 'email',
    placeholder: 'Email',
    fixedFieldGroup: 'includePersonalInfo',
  },
  {
    label: 'Location',
    required: true,
    inputType: 'text',
    placeholder: 'Location (e.g., Charlotte, NC)',
    fixedFieldGroup: 'includeBasicInfo',
  },
  {
    label: 'Time Zone',
    required: true,
    inputType: 'select',
    placeholder: 'Select Time Zone',
    fixedFieldGroup: 'includeBasicInfo',
  },
  {
    label: 'Phone number',
    required: true,
    inputType: 'tel',
    placeholder: '+1 213-456-7890',
    fixedFieldGroup: 'includeBasicInfo',
  },
  {
    label: 'Company & position',
    required: false,
    inputType: 'text',
    placeholder: 'Company & Position',
    fixedFieldGroup: 'includePersonalInfo',
  },
  {
    label: 'Primary website / social',
    required: false,
    inputType: 'text',
    placeholder: 'Primary Website/Social',
    fixedFieldGroup: 'includeBasicInfo',
  },
  {
    label: 'Upload Resume (optional)',
    required: false,
    inputType: 'file',
    placeholder: 'Choose file',
    fixedFieldGroup: 'includeBasicInfo',
  },
];

/** Profile fields visible for the given form.fixedFields flags. */
export function getVisibleStandardApplicantFields(fixedFields) {
  const flags = normalizeFixedFields(fixedFields);
  return STANDARD_APPLICANT_FIELDS.filter(field => flags[field.fixedFieldGroup] !== false);
}

/** Build requestor payload expected by HGNRest permission checks. */
export function buildJobFormRequestor(authUser) {
  if (!authUser?.userid) return null;
  return {
    requestorId: authUser.userid,
    role: authUser.role,
  };
}

export function isFieldRequired(field) {
  return Boolean(field?.isRequired || field?.required);
}

/** Job forms applicants should not edit via the builder as live defaults (retired / ATS junk). */
export function isApplicantFacingJobForm(form) {
  const title = String(form?.title || '')
    .trim()
    .toUpperCase();
  if (!title) return false;
  if (title.startsWith('[RETIRED]')) return false;
  if (title.includes('APPLIED THROUGH SITE')) return false;
  if (title.includes('TEST CREATE FORM')) return false;
  return true;
}

/** Normalize required flags and strip server-only fields before API writes. */
export function normalizeQuestionForApi(question) {
  const { _id, __v, ...rest } = question || {};
  const isRequired = isFieldRequired(question);
  return {
    ...rest,
    isRequired,
    required: isRequired,
  };
}

/** Clone payload for add-question API (no Mongo _id). */
export function prepareQuestionClone(field) {
  const clone = structuredClone(field);
  delete clone._id;
  return normalizeQuestionForApi(clone);
}

export function normalizeLoadedQuestions(questions = []) {
  return questions.map(question => {
    const isRequired = isFieldRequired(question);
    return {
      ...question,
      isRequired,
      required: isRequired,
    };
  });
}

/** Same title keying as /job-application (spacing, punctuation stripped). */
export function normalizeProfileLabelKey(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Strip numbering baked into saved question text so comparisons match
 * /job-application (e.g. "1.) Full Name" → "Full Name").
 */
export function stripLeadingQuestionEnumeration(raw) {
  let s = String(raw || '').trim();
  if (!s) return s;
  let prev;
  do {
    prev = s;
    s = s
      .replace(/^[Qq]uestion\s*\d+\s*[.:]\s*/, '')
      .replace(/^\d+\.\)\s*/, '')
      .replace(/^\d+\)\s*/, '')
      .trim();
  } while (s !== prev);
  return s;
}

function getQuestionLabelText(q) {
  const raw = (q?.label || q?.questionText || '').trim();
  if (!raw) return '';
  return stripLeadingQuestionEnumeration(raw) || raw;
}

export function isResumeQuestion(q) {
  const label = (q?.label || q?.questionText || '').toLowerCase();
  return /\b(resume|résumé|curriculum\s*vitae|cv)\b/.test(label);
}

/** Profile fields already collected once at the top of /job-application. */
const STANDARD_PROFILE_LABEL_KEYS = new Set([
  'name',
  'your name',
  'full name',
  'first name',
  'last name',
  'applicant name',
  'email',
  'your email',
  'email address',
  'your email address',
  'phone',
  'phone number',
  'your phone',
  'your phone number',
  'mobile',
  'mobile number',
  'location',
  'time zone',
  'timezone',
  'location timezone',
  'location and timezone',
  'your location timezone',
  'company position',
  'company and position',
  'your company position',
  'primary website social',
  'primary website and social',
  'website social',
  'website or social',
  'upload resume',
  'upload resume optional',
  'resume',
]);

export function isStandardProfileFieldQuestion(q) {
  const normalized = normalizeProfileLabelKey(getQuestionLabelText(q));
  if (!normalized || normalized.length > 48) return false;
  return STANDARD_PROFILE_LABEL_KEYS.has(normalized);
}

/** Resume/CV and built-in profile prompts are collected above — skip in the numbered list. */
export function shouldHideQuestionFromApplicantList(q) {
  if (isResumeQuestion(q)) return true;
  if (isStandardProfileFieldQuestion(q)) return true;
  const raw = (q?.label || q?.questionText || '').trim();
  return /^(19|20)[.)\s]/.test(raw) || /^question\s*(19|20)\b/i.test(raw);
}

function questionLabelsNearlyDuplicate(q1, q2) {
  const raw1 = (q1?.label || q1?.questionText || '').trim();
  const raw2 = (q2?.label || q2?.questionText || '').trim();
  const c1 = stripLeadingQuestionEnumeration(raw1) || raw1;
  const c2 = stripLeadingQuestionEnumeration(raw2) || raw2;
  const a = normalizeProfileLabelKey(c1);
  const b = normalizeProfileLabelKey(c2);
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.length < 45 || b.length < 45) return false;
  return a.includes(b) || b.includes(a);
}

/** Drop exact and near-duplicate prompts (templates pasted twice, etc.). */
export function dedupeVisibleQuestions(questions) {
  const kept = [];
  for (const q of questions ?? []) {
    const raw = (q.label || q.questionText || '').trim();
    const cleaned = stripLeadingQuestionEnumeration(raw) || raw;
    const key = normalizeProfileLabelKey(cleaned);
    const dupExact =
      key &&
      kept.some(k => {
        const kr = (k.label || k.questionText || '').trim();
        const kc = stripLeadingQuestionEnumeration(kr) || kr;
        return normalizeProfileLabelKey(kc) === key;
      });
    if (dupExact) continue;
    if (kept.some(k => questionLabelsNearlyDuplicate(q, k))) continue;
    kept.push(q);
  }
  return kept;
}

/**
 * Same question list applicants see on /job-application for a form:
 * visible only, profile/resume duplicates removed, near-duplicates collapsed.
 */
export function getApplicantVisibleQuestions(questions = []) {
  const filtered = (questions || []).filter(
    q => q.visible !== false && !shouldHideQuestionFromApplicantList(q),
  );
  return dedupeVisibleQuestions(filtered);
}

/**
 * Normalize question text for duplicate comparison: trim, collapse
 * internal whitespace, lowercase, and strip trailing punctuation.
 */
export function normalizeQuestionText(text) {
  return String(text || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[.,!?;:]+$/, '');
}

/**
 * Returns true if a question with matching (normalized) text already
 * exists in existingFields. Pure function, safe to unit test standalone.
 */
export function isDuplicateQuestion(candidate, existingFields = []) {
  const candidateText = normalizeQuestionText(candidate?.questionText || candidate?.label);
  if (!candidateText) return false;
  return existingFields.some(
    field => normalizeQuestionText(field?.questionText || field?.label) === candidateText,
  );
}

/**
 * Given a batch of candidate questions (e.g. from a template being
 * appended) and the current form fields, returns the subset of candidates
 * that look like duplicates — either against existingFields or against
 * an earlier candidate in the same batch.
 */
export function findDuplicateQuestions(candidates = [], existingFields = []) {
  const seen = new Set(
    existingFields
      .map(field => normalizeQuestionText(field?.questionText || field?.label))
      .filter(Boolean),
  );
  const duplicates = [];
  candidates.forEach(candidate => {
    const text = normalizeQuestionText(candidate?.questionText || candidate?.label);
    if (!text) return;
    if (seen.has(text)) {
      duplicates.push(candidate);
    } else {
      seen.add(text);
    }
  });
  return duplicates;
}
/** Apply the manager's choice when duplicate questions are found on form load. */
export function applyDuplicateDecision(questions = [], removeDuplicates = false) {
  if (!removeDuplicates) return questions;

  const duplicates = findDuplicateQuestions(questions);
  return questions.filter(question => !duplicates.includes(question));
}
/**
 * Removes legacy, manually-entered numbering from a saved question label.
 * The number shown to users is derived from the question's current position,
 * so it stays correct after Move Up or Move Down.
 */
export function stripLeadingQuestionNumber(questionText) {
  return String(questionText || '').replace(/^\s*\d+(?:\.\)|\.|\)|-)(?:\s+\.\))*(?:\s+|$)/, '');
}

/** Returns a label whose number always follows the question's array position. */
export function numberedQuestionLabel(questionText, index) {
  return `${index + 1}.) ${stripLeadingQuestionNumber(questionText)}`;
}
