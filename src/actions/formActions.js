import {ADD_QUESTION, UPDATE_QUESTION, GET_FORM_STATE, ADD_OPTION, UPDATE_OPTION, DELETE_QUESTION, RESET_FORM_STATE, DELETE_OPTION} from 'constants/form';

export const getFormState = () => {
    return {
        type: GET_FORM_STATE,
    };
}

export const resetFormState = () => {
    return {
        type: RESET_FORM_STATE,
    };
}

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

export const deleteQuestion = (id) => {
    return {
        type: DELETE_QUESTION,
        payload: { id },
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

export const deleteOption = (questionId, optionId) => {
    return {
        type: DELETE_OPTION,
        payload: { questionId, optionId },
    };
}