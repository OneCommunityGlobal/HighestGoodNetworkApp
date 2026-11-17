import {
  GET_BM_LESSONS,
  UPDATE_LESSON,
  DELETE_LESSON,
  BM_LESSON_LIKES,
  SET_LESSON,
  BM_LESSONS_REQUEST,
  BM_LESSONS_FAILURE,
  BM_LESSONS_CANCEL,
  BM_LESSON_LIKE_SUCCEEDED,
  BM_LESSON_LIKE_FINISHED,
} from '../../constants/bmdashboard/lessonConstants';

const initialState = {
  lessons: [],
  loading: false,
  error: null,
  requestId: null,
  query: {},
  queryKey: '',
  resultQueryKey: null,
  pagination: null,
  tagMetadataVersion: 0,
  pendingLikes: {}, // Track optimistic updates
};

function receiveLessonResults(state, action) {
  if (action.requestId !== undefined && state.requestId !== action.requestId) return state;
  return {
    ...state,
    // Server order and counts are authoritative, even if another mutation is pending.
    lessons: action.payload || [],
    resultQueryKey: state.queryKey,
    pendingLikes: Object.fromEntries(
      Object.entries(state.pendingLikes).map(([id, pending]) => [
        id,
        pending ? { ...pending, optimistic: false } : pending,
      ]),
    ),
    loading: false,
    error: null,
    pagination: action.pagination || null,
  };
}

function updateLessonContent(state, action) {
  const index = state.lessons.findIndex(lesson => lesson._id === action.lessonId);

  if (index !== -1) {
    const updatedLesson = {
      ...state.lessons[index],
      content: action.content,
    };

    return {
      ...state,
      tagMetadataVersion: (state.tagMetadataVersion || 0) + 1,
      lessons: [...state.lessons.slice(0, index), updatedLesson, ...state.lessons.slice(index + 1)],
    };
  }

  return { ...state, tagMetadataVersion: (state.tagMetadataVersion || 0) + 1 };
}

function startOptimisticLike(state, action) {
  const { lessonId } = action.payload;
  if (state.pendingLikes[lessonId]) return state;
  const lesson = state.lessons.find(item => item._id === lessonId);
  // `likes` contains Like-record IDs. Only an explicit per-user flag can give direction.
  const optimistic = typeof lesson?.isLiked === 'boolean';
  return {
    ...state,
    pendingLikes: {
      ...state.pendingLikes,
      [lessonId]: {
        previousState: lesson ? { totalLikes: lesson.totalLikes, isLiked: lesson.isLiked } : null,
        optimistic,
        phase: 'updating',
      },
    },
    lessons: optimistic
      ? state.lessons.map(item =>
          item._id === lessonId
            ? {
                ...item,
                totalLikes: Math.max(0, (item.totalLikes || 0) + (item.isLiked ? -1 : 1)),
                isLiked: !item.isLiked,
              }
            : item,
        )
      : state.lessons,
  };
}

function revertOptimisticLike(state, action) {
  const { lessonId } = action.payload;
  const pending = state.pendingLikes[lessonId];
  const pendingLikes = { ...state.pendingLikes };
  delete pendingLikes[lessonId];
  return {
    ...state,
    pendingLikes,
    lessons:
      pending?.optimistic && pending.previousState
        ? state.lessons.map(item =>
            item._id === lessonId ? { ...item, ...pending.previousState } : item,
          )
        : state.lessons,
  };
}

function receiveLikeSuccess(state, action) {
  const { lessonId, lesson } = action.payload;
  const pending = state.pendingLikes[lessonId];
  if (!pending) return state;
  const authoritative = lesson?._id === lessonId && Number.isFinite(lesson.totalLikes);
  return {
    ...state,
    pendingLikes: {
      ...state.pendingLikes,
      [lessonId]: { ...pending, optimistic: false, phase: 'refreshing' },
    },
    lessons: authoritative
      ? state.lessons.map(item =>
          item._id === lessonId
            ? {
                ...item,
                totalLikes: lesson.totalLikes,
                ...(Array.isArray(lesson.likes) ? { likes: lesson.likes } : {}),
                ...(typeof lesson.isLiked === 'boolean' ? { isLiked: lesson.isLiked } : {}),
              }
            : item,
        )
      : state.lessons,
  };
}

function receiveLegacyLike(state, action) {
  const updatedLesson = action.payload;
  if (!updatedLesson?._id) return state;
  return {
    ...state,
    pendingLikes: {
      ...state.pendingLikes,
      [updatedLesson._id]: undefined,
    },
    lessons: state.lessons.map(lesson =>
      lesson._id === updatedLesson._id
        ? {
            ...lesson,
            ...(Array.isArray(updatedLesson.likes) ? { likes: updatedLesson.likes } : {}),
            ...(Number.isFinite(updatedLesson.totalLikes)
              ? { totalLikes: updatedLesson.totalLikes }
              : {}),
            ...(typeof updatedLesson.isLiked === 'boolean'
              ? { isLiked: updatedLesson.isLiked }
              : {}),
          }
        : lesson,
    ),
  };
}

// eslint-disable-next-line default-param-last
export const lessonsReducer = (state = initialState, action) => {
  switch (action.type) {
    case BM_LESSONS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
        requestId: action.requestId,
        query: action.query,
        queryKey: action.queryKey,
      };
    case BM_LESSONS_FAILURE:
    case BM_LESSONS_CANCEL:
      if (state.requestId !== action.requestId) return state;
      return { ...state, loading: false, error: action.error || null };
    case GET_BM_LESSONS:
      return receiveLessonResults(state, action);

    // Successful mutations invalidate only metadata, never active filter settings.
    case 'POST_LESSON_SUCCESS':
      return { ...state, tagMetadataVersion: (state.tagMetadataVersion || 0) + 1 };
    case UPDATE_LESSON:
      return updateLessonContent(state, action);

    case DELETE_LESSON:
      return {
        ...state,
        tagMetadataVersion: (state.tagMetadataVersion || 0) + 1,
        lessons: state.lessons.filter(lesson => lesson._id !== action.lessonId),
      };

    case SET_LESSON:
      return {
        ...state,
        lessons: state.lessons.map(lesson =>
          lesson._id === action.payload._id ? action.payload : lesson,
        ),
      };

    case 'OPTIMISTIC_LIKE_UPDATE':
      return startOptimisticLike(state, action);
    case 'REVERT_LIKE_UPDATE':
      return revertOptimisticLike(state, action);
    case BM_LESSON_LIKE_SUCCEEDED:
      return receiveLikeSuccess(state, action);
    case BM_LESSON_LIKE_FINISHED: {
      const pendingLikes = { ...state.pendingLikes };
      delete pendingLikes[action.payload.lessonId];
      return { ...state, pendingLikes };
    }

    case BM_LESSON_LIKES:
      return receiveLegacyLike(state, action);

    default:
      return state;
  }
};

export default lessonsReducer;
