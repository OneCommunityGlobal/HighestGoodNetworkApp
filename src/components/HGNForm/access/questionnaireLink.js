// Permanent, reusable questionnaire link. Administrators share this same link with
// everyone; it only opens the questionnaire for people who were set up and invited
// through the Highest Good Network Dropbox (see QuestionnaireAccessGate).
export const QUESTIONNAIRE_PERMANENT_PATH = '/questionnaire';
export const QUESTIONNAIRE_START_PATH = '/hgnform/page1';

export const getQuestionnaireLink = () =>
  `${window.location.origin}${QUESTIONNAIRE_PERMANENT_PATH}`;

// Only invites into the Highest Good Network Dropbox team folder unlock the questionnaire.
// Invites into other team folders (e.g. Administration Team) do not.
export const QUESTIONNAIRE_DROPBOX_TEAM_FOLDER_KEY = 'HGN';
