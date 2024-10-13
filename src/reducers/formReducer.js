import { v4 as uuid4 } from 'uuid';
import { GET_FORM_STATE,ADD_QUESTION,UPDATE_QUESTION, ADD_OPTION, UPDATE_OPTION } from 'constants/form';

const initialState = {
    id: uuid4(),
    name: 'untitled form',
    questions: [{
        id: uuid4(),
        label: 'untitled question',
        type: 'select',
        required: false,
        options: [],
    }],
};

export default function formReducer(state = initialState, action) {
    switch (action.type) {
        case GET_FORM_STATE:
            return { ...state };
        case ADD_QUESTION:
            return {
                ...state,
                questions: [...state.questions, {
                    id: uuid4(),
                    label: 'untitled question',
                    type: 'select',
                    required: false,
                    options: [],
                }],
            };
        case UPDATE_QUESTION:
            return {
                ...state,
                questions: state.questions.map(question => {
                    if (question.id === action.payload.id) {
                        return { ...question, ...action.payload.data };
                    }
                    return question;
                })
            };
        case ADD_OPTION:
            return {
                ...state,
                questions: state.questions.map(question => {
                    if (question.id === action.payload.id) {
                        return {
                            ...question,
                            options: [...question.options, {
                                id: uuid4(),
                                value: '',
                            }],
                        };
                    }
                    return question;
                })
            }
        case UPDATE_OPTION:
            return {
                ...state,
                //find the question
                questions: state.questions.map(question => {
                    if (question.id !== action.payload.questionId) {
                        return question;
                    }
                    //find the option
                    return {
                        ...question,
                        options: question.options.map(option => {
                            if (option.id === action.payload.optionId) {
                                console.log("In reducer", action.payload.data);
                              return { ...option, ...action.payload.data };
                            }
                            console.log("In reducer", option);
                            return option;
                          })
                    }
                })
            }
        default:
            return state;
    }
}