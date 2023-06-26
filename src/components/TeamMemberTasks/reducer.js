import { fetchTeamMembersTask } from 'actions/task';
import { fetchTeamMembersTaskSuccess } from 'components/TeamMemberTasks/actions';
import axios from 'axios';
import { ApiEndpoint } from 'utils/URL';

const initialState = {
  isLoading: false,
  usersWithTasks: [],
};

export const teamMemberTasksReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'DATA_LOADING':
      return { ...state, isLoading: true };
    case 'FINISH_LOADING':
      return { ...state, isLoading: false };
    case 'FETCH_TEAM_MEMBERS_TASK_BEGIN':
      return { ...state, isLoading: true };
    case 'FETCH_TEAM_MEMBERS_TASK_SUCCESS':
      return { ...state, isLoading: false, usersWithTasks: [...action.payload] }; // change that when there will be backend
    case 'FETCH_TEAM_MEMBERS_TASK_ERROR':
      return { ...state, isLoading: false };
    // TODO:
    //   1. check structure of usersWithTasks to find what id is called for user, task, and taskNotification
    //   2. check what taskNotification looks like when there is no taskNotification - is it an empty array? empty object? something else?
    case 'DELETE_TASK_NOTIFICATION_SUCCESS':
      return {
        ...state,
        usersWithTasks: usersWithTasks.map(user =>
          user.personId === action.payload.userId
            ? {
                ...user,
                tasks: user.tasks.map(task =>
                  task._id === action.payload.taskId
                    ? {
                        ...task,
                        taskNotifications: task.taskNotifications.filter(
                          taskNotification =>
                            taskNotification._id !== action.payload.taskNotificationId,
                        ),
                      }
                    : task,
                ),
              }
            : user,
        ),
      };
    default:
      return state;
  }
};

export const deleteSelectedTask = async (taskId, taskMother) => {
  await axios.post(`${ApiEndpoint}/task/del/${taskId}/${taskMother}`);
};