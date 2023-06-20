export const GET_USER_PROFILE = 'GET_USER_PROFILE';
export const GET_USER_TASK_BY_ID = 'GET_USER_TASK_BY_ID';
export const GET_USER_PROJECT_BY_ID = 'GET_USER_PROJECT_BY_ID';
export const CLEAR_USER_PROFILE = 'CLEAR_USER_PROFILE';
export const EDIT_USER_PROFILE = 'EDIT_USER_PROFILE';
export const EDIT_FIRST_NAME = 'EDIT_FIRST_NAME';

export const getUserProfile = data => ({
  type: GET_USER_PROFILE,
  payload: data,
});

export const getUserTask = data => ({
  type: GET_USER_TASK_BY_ID,
  payload: data,
});

export const editFirstName = data => ({
  type: EDIT_FIRST_NAME,
  payload: data,
});

export const putUserProfile = data => ({
  type: EDIT_USER_PROFILE,
  payload: data,
});
