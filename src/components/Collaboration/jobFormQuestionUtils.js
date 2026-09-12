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

export const STANDARD_APPLICANT_FIELDS = [
  { label: 'Name', required: true, inputType: 'text' },
  { label: 'Email', required: true, inputType: 'email' },
  { label: 'Location & Timezone', required: false, inputType: 'text' },
  { label: 'Phone Number', required: false, inputType: 'text' },
  { label: 'Company & Position', required: false, inputType: 'text' },
  { label: 'Primary Website/Social', required: false, inputType: 'text' },
];

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
