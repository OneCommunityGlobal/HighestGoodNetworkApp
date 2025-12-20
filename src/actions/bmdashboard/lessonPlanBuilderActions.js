import axios from 'axios';
import { toast } from 'react-toastify';
import { ENDPOINTS } from '~/utils/URL';
import {
  FETCH_LESSON_PLAN_TEMPLATES_REQUEST,
  FETCH_LESSON_PLAN_TEMPLATES_SUCCESS,
  FETCH_LESSON_PLAN_TEMPLATES_FAIL,
  SAVE_LESSON_PLAN_DRAFT_REQUEST,
  SAVE_LESSON_PLAN_DRAFT_SUCCESS,
  SAVE_LESSON_PLAN_DRAFT_FAIL
} from '../../constants/bmdashboard/lessonPlanBuilderConstants';

export const fetchLessonPlanTemplates = () => {
  const url = ENDPOINTS.LESSON_PLAN_TEMPLATES;

  return async dispatch => {
    try {
      dispatch({ type: FETCH_LESSON_PLAN_TEMPLATES_REQUEST });

      const response = await axios.get(url);

      if (response.status === 200) {
        dispatch({
          type: FETCH_LESSON_PLAN_TEMPLATES_SUCCESS,
          payload: response.data,
        });
      } else {
        dispatch({
          type: FETCH_LESSON_PLAN_TEMPLATES_FAIL,
          payload: `Failed to fetch lesson plan templates. Status: ${response.status}`,
        });
        toast.error(`Failed to fetch lesson plan templates. Status: ${response.status}`);
      }
    } catch (error) {
      dispatch({
        type: FETCH_LESSON_PLAN_TEMPLATES_FAIL,
        payload: error.message,
      });
      toast.error(`Error fetching lesson plan templates: ${error.message}`);
    }
  };
};


export const saveLessonPlanDraft = (draftData) => {
  return async dispatch => {
    try {
      dispatch({ type: SAVE_LESSON_PLAN_DRAFT_REQUEST });

      const response = await axios.post(
        ENDPOINTS.LESSON_PLAN_DRAFT,
        draftData
      );

      dispatch({
        type: SAVE_LESSON_PLAN_DRAFT_SUCCESS,
        payload: response.data.draft,
      });

      toast.success('Draft saved successfully');
    } catch (error) {
      dispatch({
        type: SAVE_LESSON_PLAN_DRAFT_FAIL,
        payload: error.message,
      });

      toast.error('Failed to save draft');
    }
  };
};