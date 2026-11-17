import axios from 'axios';
import { toast } from 'react-toastify';
import { ENDPOINTS } from '~/utils/URL';
import {
  GET_BM_LESSONS,
  UPDATE_LESSON,
  DELETE_LESSON,
  SET_LESSON,
  BM_LESSONS_REQUEST,
  BM_LESSONS_FAILURE,
  BM_LESSONS_CANCEL,
} from '../../constants/bmdashboard/lessonConstants';
import { getUserProfile } from '../userProfile';
import { fetchProjectById } from './projectByIdAction';
import { GET_ERRORS } from '../../constants/errors';
import { serializeLessonQuery, normalizeLessonResponse } from '~/utils/lessonListQuery';

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

// A valid MongoDB ObjectId is a 24-character hex string. Lesson author/project
// fields sometimes hold display names (e.g. "James", "project 1") instead of
// real references; skip those so we don't fire doomed 404/500/400 requests.
const isObjectId = id => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);

let lessonRequestSequence = 0;

// Enrich only the requested result set; deduplicate references within each response.
// Read references directly so list requests do not overwrite unrelated profile/project state.
async function enrichLessons(lessons) {
  const authors = new Map();
  const projects = new Map();
  const lookup = (map, id, url) => {
    if (!isObjectId(id)) return Promise.resolve(null);
    if (!map.has(id))
      map.set(
        id,
        axios
          .get(url(id))
          .then(response => response.data)
          .catch(() => null),
      );
    return map.get(id);
  };
  return Promise.all(
    lessons.map(async lesson => {
      const [author, project] = await Promise.all([
        typeof lesson.author === 'object'
          ? lesson.author
          : lookup(authors, lesson.author, ENDPOINTS.USER_PROFILE),
        typeof lesson.relatedProject === 'object'
          ? lesson.relatedProject
          : lookup(projects, lesson.relatedProject, ENDPOINTS.BM_PROJECT_BY_ID),
      ]);
      return {
        ...lesson,
        author: {
          id: author?.id || author?._id || lesson.author,
          name:
            author?.name ||
            (author ? `${author.firstName || ''} ${author.lastName || ''}`.trim() : 'Unknown'),
        },
        relatedProject: {
          id: project?.id || project?._id || lesson.relatedProject,
          name: project?.name || 'Unknown Project',
          location: project?.location || '',
        },
      };
    }),
  );
}

export const fetchBMLessons = (query = {}, { signal } = {}) => async (dispatch, getState) => {
  const requestId = ++lessonRequestSequence;
  const activeQuery = { ...query, ...(query.tags ? { tags: [...query.tags] } : {}) };
  const queryKey = serializeLessonQuery(activeQuery);
  dispatch({ type: BM_LESSONS_REQUEST, requestId, query: activeQuery, queryKey });
  try {
    const queryString = queryKey ? `?${queryKey}` : '';
    const url = `${ENDPOINTS.BM_LESSONS}${queryString}`;
    const response = signal ? await axios.get(url, { signal }) : await axios.get(url);
    const result = normalizeLessonResponse(response.data);
    if (signal?.aborted) throw new Error('Request cancelled');
    if (getState().lessons?.requestId !== requestId) return { ok: false, stale: true };
    const lessons = await enrichLessons(result.lessons);
    if (signal?.aborted) throw new Error('Request cancelled');
    if (getState().lessons?.requestId !== requestId) return { ok: false, stale: true };
    dispatch({ type: GET_BM_LESSONS, payload: lessons, pagination: result.pagination, requestId });
    return { ok: true, lessons, pagination: result.pagination };
  } catch (error) {
    if (signal?.aborted || error.code === 'ERR_CANCELED') {
      dispatch({ type: BM_LESSONS_CANCEL, requestId });
      return { ok: false, cancelled: true };
    }
    const message = error.response?.data?.error || error.message || 'Failed to load lessons.';
    dispatch({
      type: BM_LESSONS_FAILURE,
      requestId,
      error: typeof message === 'string' ? message : 'Failed to load lessons.',
    });
    return { ok: false, error: message };
  }
};

export const refreshBMLessons = () => (dispatch, getState) =>
  dispatch(fetchBMLessons(getState().lessons?.query || {}));

export const fetchSingleBMLesson = lessonId => {
  const url = ENDPOINTS.BM_LESSON + lessonId;
  return async dispatch => {
    try {
      const response = await axios.get(url);
      const lesson = response.data;

      // Fetch user profile and project details concurrently, but only when the
      // stored values are real ObjectIds (not display names like "project 1").
      const [projectDetails, userProfile] = await Promise.all([
        isObjectId(lesson.relatedProject)
          ? dispatch(fetchProjectById(lesson.relatedProject))
          : null,
        isObjectId(lesson.author) ? dispatch(getUserProfile(lesson.author)) : null,
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

export const updateBMLesson = (lessonId, content) => async dispatch => {
  try {
    await axios.put(ENDPOINTS.BM_LESSON + lessonId, { content });
    dispatch(updateLesson(lessonId, content));
    await dispatch(refreshBMLessons());
    return true;
  } catch {
    toast.error('Error updating lesson');
    return false;
  }
};

export const deleteBMLesson = lessonId => async dispatch => {
  try {
    await axios.delete(ENDPOINTS.BM_LESSON + lessonId);
    dispatch(deleteLesson(lessonId));
    await dispatch(refreshBMLessons());
    return true;
  } catch (error) {
    toast.error('Error deleting lesson');
    throw error;
  }
};
