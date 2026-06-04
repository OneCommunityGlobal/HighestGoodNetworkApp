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
