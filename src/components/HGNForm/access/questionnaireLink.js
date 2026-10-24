// Permanent, reusable questionnaire link. Administrators share this same link with
// everyone; it only opens the questionnaire for people who were set up and invited
// through the HGN Dropbox process (see QuestionnaireAccessGate).
export const QUESTIONNAIRE_PERMANENT_PATH = '/questionnaire';
export const QUESTIONNAIRE_START_PATH = '/hgnform/page1';

export const getQuestionnaireLink = () =>
  `${window.location.origin}${QUESTIONNAIRE_PERMANENT_PATH}`;
