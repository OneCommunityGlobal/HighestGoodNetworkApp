import { v4 as uuid4 } from 'uuid';
import {
  GET_FORM_STATE,
  ADD_QUESTION,
  UPDATE_QUESTION,
  ADD_OPTION,
  UPDATE_OPTION,
  DELETE_QUESTION,
  RESET_FORM_STATE,
  DELETE_OPTION,
} from 'constants/form';

const initialState = {
  id: uuid4(),
  name: 'untitled form',
  questions: [
    {
      id: uuid4(),
      label: '',
      description: '',
      type: 'select',
      required: false,
      options: [],
    },
  ],
};

// eslint-disable-next-line default-param-last
export default function formReducer(state = initialState, action) {
  switch (action.type) {
    case GET_FORM_STATE:
      return { ...state };
    case RESET_FORM_STATE:
      // eslint-disable-next-line no-param-reassign
      state = initialState;
      // console.log("In reducer", state);
      return { ...state };
    case ADD_QUESTION:
      return {
        ...state,
        questions: [
          ...state.questions,
          {
            id: uuid4(),
            label: '',
            description: '',
            type: 'select',
            required: false,
            options: [],
          },
        ],
      };
    case UPDATE_QUESTION:
      return {
        ...state,
        questions: state.questions.map(question => {
          if (question.id === action.payload.id) {
            return { ...question, ...action.payload.data };
          }
          return question;
        }),
      };
    case DELETE_QUESTION:
      return {
        ...state,
        questions: state.questions.filter(question => question.id !== action.payload.id),
      };
    case ADD_OPTION:
      return {
        ...state,
        questions: state.questions.map(question => {
          if (question.id === action.payload.id) {
            return {
              ...question,
              options: [
                ...question.options,
                {
                  id: uuid4(),
                  value: '',
                },
              ],
            };
          }
          return question;
        }),
      };
    case UPDATE_OPTION:
      return {
        ...state,
        // find the question
        questions: state.questions.map(question => {
          if (question.id !== action.payload.questionId) {
            return question;
          }
          // find the option
          return {
            ...question,
            options: question.options.map(option => {
              if (option.id === action.payload.optionId) {
                // console.log("In reducer", action.payload.data);
                return { ...option, ...action.payload.data };
              }
              // console.log("In reducer", option);
              return option;
            }),
          };
        }),
      };
    case DELETE_OPTION:
      return {
        ...state,
        questions: state.questions.map(question => {
          if (question.id !== action.payload.questionId) {
            return question;
          }
          return {
            ...question,
            options: question.options.filter(option => option.id !== action.payload.optionId),
          };
        }),
      };
    default:
      return state;
  }
}
