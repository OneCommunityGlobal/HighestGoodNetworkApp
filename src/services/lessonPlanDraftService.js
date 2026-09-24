import axios from 'axios';
import { ENDPOINTS } from '../utils/URL';

/**
 * Student submits a new lesson plan draft proposal.
 * @param {{ goals: string[], topics: string[], suggestedTasks: string[] }} payload
 */
export const submitLessonPlanDraft = async payload => {
  try {
    const response = await axios.post(ENDPOINTS.LESSON_PLAN_DRAFTS_STUDENT(), payload);
    return response.data;
  } catch (error) {
    throw new Error('Failed to submit lesson plan draft');
  }
};

/**
 * Educator views all pending (draft-status) lesson plan proposals.
 */
export const getLessonPlanDrafts = async () => {
  try {
    const response = await axios.get(ENDPOINTS.LESSON_PLAN_DRAFTS_EDUCATOR());
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch lesson plan drafts');
  }
};

/**
 * Educator approves/modifies a draft, turning it into an active lesson plan.
 * @param {string} draftId
 * @param {object} updates - goals, topics, suggestedTasks, and/or assessmentForms
 */
export const updateLessonPlanDraft = async (draftId, updates) => {
  try {
    const response = await axios.put(ENDPOINTS.LESSON_PLAN_DRAFT_UPDATE(draftId), updates);
    return response.data;
  } catch (error) {
    throw new Error('Failed to update lesson plan draft');
  }
};
