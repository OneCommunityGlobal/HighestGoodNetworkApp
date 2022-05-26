import { fetchTeamMembersTask } from 'actions/task';
import { fetchTeamMembersTaskSuccess } from 'components/TeamMemberTasks/actions';

const initialState = {
  isLoading: false,
  usersWithTasks: [],
};

export const teamMemberTasksReducer = (state = initialState, action) => {
  switch (action.type) {
    case "FETCH_TEAM_MEMBERS_TASK_BEGIN":
      return { ...state, isLoading: true} 
    case "FETCH_TEAM_MEMBERS_TASK_SUCCESS":
      return { ...state, isLoading: false, usersWithTasks: [...action.payload]} // change that when there will be backend
    case "FETCH_TEAM_MEMBERS_TASK_ERROR":
      return { ...state, isLoading: false }
    default:
      return state;
  }
};
