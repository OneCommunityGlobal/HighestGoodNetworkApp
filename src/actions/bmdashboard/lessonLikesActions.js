import axios from 'axios';
import { toast } from 'react-toastify';
import { ENDPOINTS } from '~/utils/URL';
import { fetchBMLessons } from './lessonsAction';
import { BM_LESSON_LIKES } from '../../constants/bmdashboard/lessonConstants';

export const likeLessonAction = (lessonId, userId) => {
  const url = ENDPOINTS.BM_LESSON_LIKES(lessonId);
  return async dispatch => {
    try {
      // Dispatch optimistic update
      dispatch({
        type: 'OPTIMISTIC_LIKE_UPDATE',
        payload: { lessonId, userId }
      });

      const response = await axios.put(url, {
        lessonId,
        userId,
      });
      
      if (response.status === 200) {
        // Update with actual server response
        dispatch({
          type: BM_LESSON_LIKES,
          payload: response.data
        });
        dispatch(fetchBMLessons());
      } else {
        // Revert optimistic update on failure
        dispatch({
          type: 'REVERT_LIKE_UPDATE',
          payload: { lessonId, userId }
        });
        toast.error('Unexpected response status:', response.status);
      }
    } catch (error) {
      // Revert optimistic update on error
      dispatch({
        type: 'REVERT_LIKE_UPDATE',
        payload: { lessonId, userId }
      });
      toast.error('Error liking lesson:', error);
    }
  };
};

export const setLikes = payload => {
  return {
    type: BM_LESSON_LIKES,
    payload,
  };
};
