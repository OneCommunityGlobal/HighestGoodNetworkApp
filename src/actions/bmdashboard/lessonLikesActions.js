import axios from 'axios';
import { toast } from 'react-toastify';
import { ENDPOINTS } from '~/utils/URL';
import { refreshBMLessons } from './lessonsAction';
import {
  BM_LESSON_LIKES,
  BM_LESSON_LIKE_SUCCEEDED,
  BM_LESSON_LIKE_FINISHED,
} from '../../constants/bmdashboard/lessonConstants';

export const likeLessonAction = (lessonId, userId) => async (dispatch, getState) => {
  if (getState().lessons?.pendingLikes?.[lessonId]) return { ok: false, pending: true };
  dispatch({ type: 'OPTIMISTIC_LIKE_UPDATE', payload: { lessonId } });
  let saved = false;
  try {
    const response = await axios.put(ENDPOINTS.BM_LESSON_LIKES(lessonId), { lessonId, userId });
    if (response.status !== 200 || response.data?.status === 'error') {
      throw new Error('Unable to update this lesson like.');
    }
    saved = true;
    // The API returns an acknowledgement, not a lesson. Settle by the requested ID.
    dispatch({ type: BM_LESSON_LIKE_SUCCEEDED, payload: { lessonId, lesson: response.data } });
    const refresh = await dispatch(refreshBMLessons());
    return { ok: true, refreshed: refresh.ok };
  } catch (error) {
    if (!saved) {
      dispatch({ type: 'REVERT_LIKE_UPDATE', payload: { lessonId } });
      toast.error('Error liking/unliking lesson. Please try again.');
    } else {
      // A failed refresh must never undo a mutation already accepted by the server.
      toast.error(
        'Like updated, but lessons could not be refreshed. Please retry loading lessons.',
      );
    }
    return { ok: saved, refreshed: false };
  } finally {
    dispatch({ type: BM_LESSON_LIKE_FINISHED, payload: { lessonId } });
  }
};

// Compatibility action for callers that already have a complete lesson response.
export const setLikes = payload => ({ type: BM_LESSON_LIKES, payload });
