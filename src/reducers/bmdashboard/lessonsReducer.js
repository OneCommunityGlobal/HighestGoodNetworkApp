import { GET_BM_LESSONS, UPDATE_LESSON, DELETE_LESSON } from '../../constants/bmdashboard/lessonConstants'

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
          // Return the current state if the lesson to delete is not found
          return state;


      default:
        return state;
      }      
}


 
