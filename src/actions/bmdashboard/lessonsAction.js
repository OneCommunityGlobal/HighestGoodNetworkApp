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
      const authorIds = [...new Set(lessons.map(lesson => lesson.author))];
      const projectIds = [...new Set(lessons.map(lesson => lesson.relatedProject))];

      const [authorProfiles, projectDetails] = await Promise.all([
        Promise.all(
          authorIds.map(async authorId => {
            try {
              return await dispatch(getUserProfile(authorId));
            } catch (error) {
              console.error('Error fetching user profile:', authorId, error);
              return null;
            }
          })
        ),
        Promise.all(
          projectIds.map(async projectId => {
            try {
              return await dispatch(fetchProjectById(projectId));
            } catch (error) {
              console.error('Error fetching project:', projectId, error);
              return null;
            }
          })
        )
      ]);

      const authorMap = authorIds.reduce((acc, id, index) => {
        if (authorProfiles[index]) {
          acc[id] = authorProfiles[index];
        }
        return acc;
      }, {});

      const projectMap = projectIds.reduce((acc, id, index) => {
        const project = projectDetails[index];
        if (project && project.name) {
          acc[id] = {
            id,
            name: project.name,
            location: project.location
          };
        } else {
          acc[id] = {
            id,
            name: 'Unknown Project',
            location: ''
          };
        }
        return acc;
      }, {});

      const updatedLessons = lessons.map(lesson => ({
        ...lesson,
        author: {
          id: lesson.author,
          name: authorMap[lesson.author] 
            ? `${authorMap[lesson.author].firstName} ${authorMap[lesson.author].lastName}`
            : 'Unknown'
        },
        relatedProject: projectMap[lesson.relatedProject] || {
          id: lesson.relatedProject,
          name: 'Unknown Project'
        }
      }));
      dispatch(setLessons(updatedLessons));
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  };
};

export const setLessons = payload => {
  // console.log('Setting lessons in Redux:', payload);
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
      // console.error('Error fetching lesson:', error);
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
     // console.log('err')
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
      dispatch(deleteLesson(lessonId));
      return Promise.resolve();
    } catch (err) {
      // console.error('Error deleting lesson:', err);
      return Promise.reject(err);
    }
  };
};

export const deleteLesson = (lessonId) => ({
  type: DELETE_LESSON,
  lessonId
});