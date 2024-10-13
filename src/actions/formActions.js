import {ADD_QUESTION, UPDATE_QUESTION, GET_FORM_STATE, ADD_OPTION, UPDATE_OPTION} from 'constants/form';

export const addQuestion = () => {
    return {
        type: ADD_QUESTION,
    };
}

export const updateQuestion = (id, data) => {
    return {
        type: UPDATE_QUESTION,
        payload: { id, data },
    };
}

export const getFormState = () => {
    return {
        type: GET_FORM_STATE,
    };
}

export const addOption = (id) => {
    return {
        type: ADD_OPTION,
        payload: { id },
    };
}

export const updateOption = (questionId, optionId, data) => {
    return {
        type: UPDATE_OPTION,
        payload: { questionId, optionId, data },
    };
}