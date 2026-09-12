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
