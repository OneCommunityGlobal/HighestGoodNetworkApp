import {
  GET_BM_LESSONS,
  UPDATE_LESSON,
  DELETE_LESSON,
  BM_LESSON_LIKES,
  SET_LESSON,
} from '../../constants/bmdashboard/lessonConstants';

const initialState = {
  lessons: [],
};

// eslint-disable-next-line default-param-last
export const lessonsReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_BM_LESSONS: {
      return {
        lessons: action.payload,
      };
    }

    case UPDATE_LESSON: {
      const { lessonId, content } = action;
      const updatedLessons = state.lessons.map(lesson =>
        lesson._id === lessonId ? { ...lesson, content } : lesson,
      );

      return {
        ...state,
        lessons: updatedLessons,
      };
    }

    case DELETE_LESSON: {
      const lessonIdToDelete = action.payload;
      const updatedLessons = state.lessons.filter(lesson => lesson._id !== lessonIdToDelete);

      return {
        ...state,
        lessons: updatedLessons,
      };
    }

    case SET_LESSON: {
      const updatedLessons = state.lessons.map(lesson =>
        lesson._id === action.payload._id ? action.payload : lesson,
      );

      return {
        ...state,
        lessons: updatedLessons,
      };
    }

    case BM_LESSON_LIKES: {
      const updatedLesson = action.payload;
      const updatedLessons = state.lessons.map(lesson =>
        lesson._id === updatedLesson._id ? updatedLesson : lesson,
      );

      return {
        ...state,
        lessons: updatedLessons,
      };
    }

    default: {
      return state;
    }
  }
};

export default lessonsReducer;
