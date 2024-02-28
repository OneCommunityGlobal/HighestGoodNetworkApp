import { GET_BM_LESSONS, UPDATE_LESSON, DELETE_LESSON, BM_LESSON_LIKES, SET_LESSON } from '../../constants/bmdashboard/lessonConstants'

const initialState = {
  lessons: [],
};

export const lessonsReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_BM_LESSONS:
      return {
        lessons: action.payload,
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
          const lessonIdToDelete = action.payload;
          // Find the index of the lesson to delete
          const lessonIndex = state.lessons.findIndex(lesson => lesson._id === lessonIdToDelete);
    
          if (lessonIndex !== -1) {
            // Create a new array without the deleted lesson
            const updatedLessons = [
              ...state.lessons.slice(0, lessonIndex),
              ...state.lessons.slice(lessonIndex + 1),
            ];
    
            return {
              ...state,
              lessons: updatedLessons,
            };
          }
          
          return state;


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


 
