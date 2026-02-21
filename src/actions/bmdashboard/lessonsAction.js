import axios from 'axios';
import { toast } from 'react-toastify';
import { ENDPOINTS } from '~/utils/URL';
import {
  GET_BM_LESSONS,
  UPDATE_LESSON,
  DELETE_LESSON,
  SET_LESSON,
} from '../../constants/bmdashboard/lessonConstants';
import { getUserProfile } from '../userProfile';
import { fetchProjectById } from './projectByIdAction';
import { GET_ERRORS } from '../../constants/errors';

export const deleteLesson = lessonId => {
  return {
    type: DELETE_LESSON,
    lessonId,
  };
};

export const setErrors = payload => {
  return {
    type: GET_ERRORS,
    payload,
  };
};

export const updateLesson = (lessonId, content) => {
  return {
    type: UPDATE_LESSON,
    lessonId,
    content,
  };
};

export const setLesson = updatedLesson => ({
  type: SET_LESSON,
  payload: updatedLesson,
});

export const setLessons = payload => {
  return {
    type: GET_BM_LESSONS,
    payload,
  };
};

export const fetchBMLessons = () => {
  return async dispatch => {
    try {
      const response = await axios.get(ENDPOINTS.BM_LESSONS);
      const lessons = response.data;
      const authorIds = [...new Set(lessons.map(lesson => lesson.author))];
      const projectIds = [...new Set(lessons.map(lesson => lesson.relatedProject))];

      // Keep the more robust approach from honglin-lesson-list-buttons branch
      const [authorProfiles, projectDetails] = await Promise.all([
        Promise.all(
          authorIds.map(async authorId => {
            try {
              return await dispatch(getUserProfile(authorId));
            } catch (error) {
              return null;
            }
          })
        ),
        Promise.all(
          projectIds.map(async projectId => {
            try {
              return await dispatch(fetchProjectById(projectId));
            } catch (error) {
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
      // Add toast notification from development branch
      toast.error('Error fetching lessons:', error);
      dispatch(setErrors(error));
    }
  };
};

export const fetchSingleBMLesson = lessonId => {
  const url = ENDPOINTS.BM_LESSON + lessonId;
  return async dispatch => {
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
      toast.error('Error fetching lesson:', error);
      dispatch(setErrors(error));
    }
  };
};

export const updateBMLesson = (lessonId, content) => {
  return async dispatch => {
    const url = ENDPOINTS.BM_LESSON + lessonId;
    try {
      await axios.put(url, { content });
    } catch (err) {
      toast.error('Error updating lesson');
    }
    dispatch(updateLesson(lessonId, content));
  };
};

export const deleteBMLesson = lessonId => {
  return async dispatch => {
    const url = ENDPOINTS.BM_LESSON + lessonId;
    try {
      await axios.delete(url);
      dispatch(deleteLesson(lessonId));
      return Promise.resolve();
    } catch (err) {
      toast.error('Error deleting lesson');
      return Promise.reject(err);
    }
  };
};

