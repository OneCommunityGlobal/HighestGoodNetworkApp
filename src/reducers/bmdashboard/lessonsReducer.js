import { GET_BM_LESSONS, UPDATE_LESSON, DELETE_LESSON, BM_LESSON_LIKES, SET_LESSON } from '../../constants/bmdashboard/lessonConstants'

const initialState = {
  lessons: [],
};

export const lessonsReducer = (state = initialState, action) => {
  console.log('Reducer received action:', action.type, action.payload);
  switch (action.type) {
    case GET_BM_LESSONS:
      return {
        ...state,
        lessons: action.payload || [],
      };

      case UPDATE_LESSON:
        const index = state.lessons.findIndex(lesson => lesson._id === action.lessonId);
      
        if (index !== -1) {
          const updatedLesson = {
            ...state.lessons[index],
            content: action.content,
          };
      
          return {
            ...state,
            lessons: [
              ...state.lessons.slice(0, index),
              updatedLesson,
              ...state.lessons.slice(index + 1),
            ],
          };
        }
      
        // Return the current state if the lesson with the given ID is not found
        return state;
      

        case DELETE_LESSON:
          return {
            ...state,
            lessons: state.lessons.filter(lesson => lesson._id !== action.lessonId)
          };


      case SET_LESSON:
      return {
        ...state,
        lessons: state.lessons.map((lesson) =>
          lesson._id === action.payload._id ? action.payload : lesson
        ),
      };
      case BM_LESSON_LIKES:
        const updatedLesson = action.payload;
        const updatedLessons = state.lessons.map(lesson => {
          return lesson._id === updatedLesson._id ? updatedLesson : lesson;
        });
  
        return {
          ...state,
          lessons: updatedLessons,
        };

      default:
        return state;
      }      
}


 
