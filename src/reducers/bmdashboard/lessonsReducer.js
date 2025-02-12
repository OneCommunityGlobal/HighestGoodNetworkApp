import { GET_BM_LESSONS, UPDATE_LESSON, DELETE_LESSON, BM_LESSON_LIKES, SET_LESSON } from '../../constants/bmdashboard/lessonConstants'

const initialState = {
  lessons: [],
  pendingLikes: {} // Track optimistic updates
};

export const lessonsReducer = (state = initialState, action) => {
  // console.log('Reducer received action:', action.type, action.payload);
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

      case 'OPTIMISTIC_LIKE_UPDATE': {
        const { lessonId, userId } = action.payload;
        const lesson = state.lessons.find(l => l._id === lessonId);
        
        if (!lesson) return state;
  
        const isLiked = lesson.likes?.includes(userId);
        const updatedLesson = {
          ...lesson,
          totalLikes: isLiked ? lesson.totalLikes - 1 : lesson.totalLikes + 1,
          likes: isLiked
            ? lesson.likes.filter(id => id !== userId)
            : [...(lesson.likes || []), userId]
        };
  
        return {
          ...state,
          pendingLikes: {
            ...state.pendingLikes,
            [lessonId]: { previousState: lesson, timestamp: Date.now() }
          },
          lessons: state.lessons.map(l => 
            l._id === lessonId ? updatedLesson : l
          )
        };
      }
  
      case 'REVERT_LIKE_UPDATE': {
        const { lessonId } = action.payload;
        const pendingUpdate = state.pendingLikes[lessonId];
        
        if (!pendingUpdate) return state;
  
        const { previousState } = pendingUpdate;
        
        return {
          ...state,
          pendingLikes: {
            ...state.pendingLikes,
            [lessonId]: undefined
          },
          lessons: state.lessons.map(l => 
            l._id === lessonId ? previousState : l
          )
        };
      }
      
      case BM_LESSON_LIKES: {
        const updatedLesson = action.payload;
        return {
          ...state,
          pendingLikes: {
            ...state.pendingLikes,
            [updatedLesson._id]: undefined
          },
          lessons: state.lessons.map(lesson =>
            lesson._id === updatedLesson._id ? updatedLesson : lesson
          )
        };
      }

      default:
        return state;
      }      
}


 
