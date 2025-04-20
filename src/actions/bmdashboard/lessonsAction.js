import axios from "axios";
import { ENDPOINTS } from "utils/URL";
import { GET_BM_LESSONS, UPDATE_LESSON, DELETE_LESSON, SET_LESSON } from "constants/bmdashboard/lessonConstants";
import { getUserProfile } from "actions/userProfile";
import { fetchProjectById } from "actions/bmdashboard/projectByIdAction";


export const fetchBMLessons = () => {
  return async dispatch => {
    try {
      const response = await axios.get(ENDPOINTS.BM_LESSONS);
      const lessons = response.data;
      const authorIds = lessons.map(lesson => lesson.author);
      const projectIds = lessons.map(lesson => lesson.relatedProject);

      // Fetch user profiles and project details concurrently
      const [projectDetails, userProfiles] = await Promise.all([
        Promise.all(projectIds.map(projectId => dispatch(fetchProjectById(projectId)))),
        Promise.all(authorIds.map(authorId => dispatch(getUserProfile(authorId))))
      ]);

      const updatedLessons = lessons.map((lesson, index) => {
        return {
        ...lesson,
        author: userProfiles[index]
        ? {
            id: userProfiles[index]._id,
            name: `${userProfiles[index].firstName} ${userProfiles[index].lastName}`,
          }
        : lesson.author,
      relatedProject: projectDetails[index]
        ? {
            id: projectDetails[index]._id, 
            name: projectDetails[index].projectName,
          }
        : lesson.relatedProject,
    };
      });
      // Dispatch an action to update the lessons with the new author and project info
      dispatch(setLessons(updatedLessons));
    } catch (error) {
      console.error('Error fetching lessons:', error);
      dispatch(setErrors(error));
    }
  };
};

export const setLessons = payload => {
  return {
    type: GET_BM_LESSONS,
    payload
  }
}
export const fetchSingleBMLesson = (lessonId) => {
  const url = ENDPOINTS.BM_LESSON + lessonId;
  return async (dispatch) => {
    try {
      const response = await axios.get(url);
      const lesson = response.data;

      // Fetch user profile and project details concurrently
      const [projectDetails, userProfile] = await Promise.all([
        dispatch(fetchProjectById(lesson.relatedProject)),
        dispatch(getUserProfile(lesson.author)),
      ]);

      // Update the lesson with author and project details
      const updatedLesson = {
        ...lesson,
        author: userProfile
          ? {
              id: userProfile._id,
              name: `${userProfile.firstName} ${userProfile.lastName}`,
            }
          : lesson.author,
        relatedProject: projectDetails
          ? {
              id: projectDetails._id,
              name: projectDetails.projectName,
            }
          : lesson.relatedProject,
      };
      dispatch(setLesson(updatedLesson));
    } catch (error) {
      console.error('Error fetching lesson:', error);
      dispatch(setErrors(error));
    }
  };
};

export const setLesson = (updatedLesson) => ({
  type: SET_LESSON,
  payload: updatedLesson,
});

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