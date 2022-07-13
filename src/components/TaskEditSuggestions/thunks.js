export const fetchTaskEditSuggestions = () => async (dispatch, getState) => {
  try {
    const state = getState();
    const userId = selectFetchTeamMembersTaskData(state);
    dispatch(fetchTeamMembersTaskBegin());
    const response = await axios.get(ENDPOINTS.TEAM_MEMBER_TASKS(userId));
    dispatch(fetchTeamMembersTaskSuccess(response.data));
  } catch (error) {
    dispatch(fetchTeamMembersTaskError());
  }
};