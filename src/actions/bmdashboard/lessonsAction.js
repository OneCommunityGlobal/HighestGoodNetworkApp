import axios from "axios";
import { ENDPOINTS } from "utils/URL";
import { GET_BM_LESSONS, UPDATE_LESSON, DELETE_LESSON } from "constants/bmdashboard/lessonConstants";

export const fetchBMLessons = () => {
  return async dispatch => {
    axios.get(ENDPOINTS.BM_LESSONS)
    .then(res => {
      dispatch(setLessons(res.data))
    })
    .catch(err => {
      console.log('err', err)
      dispatch(setErrors(err))
    })
  } 
}

export const setLessons = payload => {
  return {
    type: GET_BM_LESSONS,
    payload
  }
}

export const updateBMLesson = (lessonId, content) => {
  return async dispatch => {
    const url = ENDPOINTS.BM_LESSON + lessonId;
    try {
      await axios.put(url, { content });
    } catch (err) {
     console.log('err')
    }
    dispatch(updateLesson());
  };
}

export const updateLesson = (lessonId, content) => {
  return {
    type: UPDATE_LESSON,
    lessonId,
    content,
  };
};
  


  export const deleteBMLesson = (lessonId) => {
    return async dispatch => {
      const url = ENDPOINTS.BM_LESSON + lessonId;
      try {
        await axios.delete(url);
      } catch (err) {
       console.log('err')
      }
      dispatch(deleteLesson(lessonId));
      dispatch(fetchBMLessons())
      
    };
  }
  
  export const deleteLesson = (lessonId) => {
    return {
      type: DELETE_LESSON,
      lessonId
    };
  };