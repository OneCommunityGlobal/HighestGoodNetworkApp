export const GET_WARNINGS_BY_USER_ID = 'GET_WARNINGS_BY_USER_ID';
export const POST_WARNINGS_BY_USER_ID = 'POST_WARNINGS_BY_USER_ID';
export const DELETE_WARNINGS_BY_USER_ID = 'DELETE_WARNINGS_BY_USER_ID';
export const CURRENT_WARNINGS = 'CURRENT_WARNINGS';
export const getWarningByUserId = data => ({
  type: GET_WARNINGS_BY_USER_ID,
  payload: data,
});

export const getCurrentWarnings = data => ({
  type: CURRENT_WARNINGS,
  payload: data,
});

export const postWarningsByUserId = data => ({
  type: POST_WARNINGS_BY_USER_ID,
  payload: data,
});

export const deleteWarningByUserId = data => ({
  type: DELETE_WARNINGS_BY_USER_ID,
  payload: data,
});
