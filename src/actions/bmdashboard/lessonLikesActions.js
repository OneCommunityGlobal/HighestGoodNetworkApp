import axios from 'axios';
import { toast } from 'react-toastify';
import { ENDPOINTS } from '../../utils/URL';
import { fetchBMLessons } from './lessonsAction';
import { BM_LESSON_LIKES } from '../../constants/bmdashboard/lessonConstants';

export const likeLessonAction = (lessonIndex, userId) => {
  const url = ENDPOINTS.BM_LESSON_LIKES(lessonIndex);
  return async dispatch => {
    try {
      const response = await axios.put(url, {
        lessonIndex,
        userId,
      });

      if (response.status === 200) {
        dispatch(fetchBMLessons());
      } else {
        toast.error('Unexpected response status:', response.status);
      }
    } catch (error) {
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
