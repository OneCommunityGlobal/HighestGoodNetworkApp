import httpService from '../services/httpService';
import { ENDPOINTS } from './URL';

// The ranked endpoint scores every response, so returning to a tab repeatedly must not re-run it.
export const QUESTIONNAIRE_REFRESH_MIN_INTERVAL_MS = 30000;

/**
 * Returns a Set of user ids that have submitted the HGN questionnaire.
 * The ranked endpoint (without filters) lists every questionnaire response.
 */
export const fetchCompletedQuestionnaireUserIds = async () => {
  const response = await httpService.get(ENDPOINTS.HGN_FORM_RANKED);
  const responses = Array.isArray(response?.data) ? response.data : [];
  return new Set(responses.map(r => r.userId?.toString()).filter(Boolean));
};

const isSameSet = (a, b) => !!a && a.size === b.size && [...b].every(id => a.has(id));

/**
 * Loads the completed user ids and reloads them when the person returns to the tab.
 * The questionnaire can be filled in from another tab (it has a shareable link and its
 * thank-you page says to close the window), so a page already open would otherwise keep
 * showing the indicator until it is reloaded.
 *
 * `onChange` receives the Set on the first load and whenever its contents change. If a
 * request fails it is not called, so the last known status stays on screen.
 * Returns a function that stops listening.
 */
export const subscribeToCompletedQuestionnaireUserIds = onChange => {
  let current = null;
  let lastRequestAt = 0;
  let active = true;

  const load = async () => {
    lastRequestAt = Date.now();
    try {
      const userIds = await fetchCompletedQuestionnaireUserIds();
      if (active && !isSameSet(current, userIds)) {
        current = userIds;
        onChange(userIds);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load questionnaire completion status', error);
    }
  };

  const refresh = () => {
    const isVisible = document.visibilityState === 'visible';
    if (isVisible && Date.now() - lastRequestAt >= QUESTIONNAIRE_REFRESH_MIN_INTERVAL_MS) {
      void load();
    }
  };

  void load();
  document.addEventListener('visibilitychange', refresh);
  window.addEventListener('focus', refresh);

  return () => {
    active = false;
    document.removeEventListener('visibilitychange', refresh);
    window.removeEventListener('focus', refresh);
  };
};

export default fetchCompletedQuestionnaireUserIds;
