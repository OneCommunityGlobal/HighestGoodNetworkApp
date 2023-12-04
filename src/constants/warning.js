export const GET_WARNINGS_BY_ID = 'GET_WARNINGS_BY_ID';

export const getWarningByUserId = data => ({
  type: GET_WARNINGS_BY_ID,
  payload: data,
});
