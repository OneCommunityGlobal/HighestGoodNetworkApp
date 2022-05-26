import { createAction } from "redux-actions";

export const fetchTeamMembersTaskBegin = createAction("FETCH_TEAM_MEMBERS_TASK_BEGIN");
export const fetchTeamMembersTaskSuccess = createAction("FETCH_TEAM_MEMBERS_TASK_SUCCESS");
export const fetchTeamMembersTaskError = createAction("FETCH_TEAM_MEMBERS_TASK_ERROR");