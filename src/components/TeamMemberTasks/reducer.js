import axios from 'axios';
import { ApiEndpoint } from '../../utils/URL';

const initialState = {
  isLoading: false,
  usersWithTasks: [],
  usersWithTimeEntries: [],
};

// eslint-disable-next-line default-param-last
export const teamMemberTasksReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'FETCH_TEAM_MEMBERS_DATA_BEGIN':
      return { ...state, isLoading: true };

    case 'FETCH_TEAM_MEMBERS_DATA_ERROR':
      return { ...state, isLoading: false };

    case 'FETCH_TEAM_MEMBERS_TASK_SUCCESS': // fall through
    case 'FETCH_TEAM_MEMBERS_TIMEENTRIES_SUCCESS':
      return { ...state, isLoading: false, ...action.payload };

    // ──────────────────────────────────────────────────────────
    case 'UPDATE_TEAM_MEMBERS_TIMEENTRY_SUCCESS': {
      // ← opens block
      const { usersWithTimeEntries } = state;
      const newTimeEntry = action.payload;

      const updatedTimeEntries = usersWithTimeEntries.map(timeentry =>
        timeentry._id === newTimeEntry._id ? { ...timeentry, ...newTimeEntry } : timeentry,
      );

      return { ...state, usersWithTimeEntries: updatedTimeEntries };
    } // ← closes block ✅
    // ──────────────────────────────────────────────────────────
    case 'UPDATE_TEAM_MEMBERS_TASK_TIME': {
      // ← open new block
      const { usersWithTasks } = state;
      const { newTime, taskId, personId } = action.payload;

      const timeToAdd = Number(newTime.hours) + Number(newTime.minutes) / 60;

      const updatedUsersWithTasks = usersWithTasks.map(user => {
        if (user.personId !== personId) return user;

        // clone user to avoid mutating original state
        const userClone = {
          ...user,
          totaltangibletime_hrs: user.totaltangibletime_hrs + timeToAdd,
          totaltime_hrs: user.totaltime_hrs + timeToAdd,
          tasks: user.tasks.map(task =>
            taskId && task._id === taskId
              ? { ...task, hoursLogged: task.hoursLogged + timeToAdd }
              : task,
          ),
        };
        return userClone;
      });

      return { ...state, usersWithTasks: updatedUsersWithTasks };
    } // ← closes block ✅
    // ──────────────────────────────────────────────────────────
    case 'DELETE_TASK_NOTIFICATION_SUCCESS':
      return {
        ...state,
        usersWithTasks: state.usersWithTasks.map(user =>
          user.personId === action.payload.userId
            ? {
                ...user,
                tasks: user.tasks.map(task =>
                  task._id === action.payload.taskId
                    ? {
                        ...task,
                        taskNotifications: task.taskNotifications.filter(
                          tn => tn._id !== action.payload.taskNotificationId,
                        ),
                      }
                    : task,
                ),
              }
            : user,
        ),
        isLoading: false,
      };

    case 'DELETE_TASK_NOTIFICATION_BEGIN':
      return { ...state, isLoading: true };

    default:
      return state;
  }
};

export const deleteSelectedTask = async (taskId, taskMother) => {
  await axios.post(`${ApiEndpoint}/task/del/${taskId}/${taskMother}`);
};
