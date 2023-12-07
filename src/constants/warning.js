export const GET_WARNINGS_BY_USER_ID = 'GET_WARNINGS_BY_USER_ID';
export const POST_WARNINGS_BY_USER_ID = 'POST_WARNINGS_BY_USER_ID';

export const getWarningByUserId = data => ({
  type: GET_WARNINGS_BY_USER_ID,
  payload: data,
});

export const postWarningsByUserId = data => ({
  type: POST_WARNINGS_BY_USER_ID,
  payload: data,
});
