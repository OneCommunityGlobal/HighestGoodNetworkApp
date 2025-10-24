import axios from 'axios';
import { ENDPOINTS } from '../../utils/URL';

const postNewLesson = lessonData => async dispatch => {
  const response = await axios.post(ENDPOINTS.POST_LESSON, lessonData);
  dispatch({ type: 'POST_LESSON_SUCCESS', payload: response.data });
  return response.data;
};

export default postNewLesson;
