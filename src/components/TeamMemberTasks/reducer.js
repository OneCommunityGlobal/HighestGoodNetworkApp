import { fetchTeamMembersTask } from 'actions/task';
import { fetchTeamMembersTaskSuccess } from 'components/TeamMemberTasks/actions';
import axios from 'axios';
import { ApiEndpoint } from 'utils/URL';

const initialState = {
  isLoading: false,
  usersWithTasks: [],
  usersWithTimeEntries: []
};

export const teamMemberTasksReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'FETCH_TEAM_MEMBERS_DATA_BEGIN':
      return { ...state, isLoading: true };
    case 'FETCH_TEAM_MEMBERS_DATA_ERROR':
      return { ...state, isLoading: false };
    case 'FETCH_TEAM_MEMBERS_TASK_SUCCESS': // fall through
    case 'FETCH_TEAM_MEMBERS_TIMEENTRIES_SUCCESS':
      return { ...state, isLoading: false, ...action.payload };
    case 'UPDATE_TEAM_MEMBERS_TIMEENTRY_SUCCESS':
      const { usersWithTimeEntries } = state;
      const newTimeEntry = action.payload;
      const updatedTimeEntries = usersWithTimeEntries.map((timeentry) => {
        if (timeentry._id === newTimeEntry._id) return { ...timeentry, ...newTimeEntry };
        return timeentry
      })
      return { ...state, usersWithTimeEntries: updatedTimeEntries }
    case 'UPDATE_TEAM_MEMBERS_TASK_TIME':
      const {usersWithTasks} = state;
      const {newTime, taskId, personId} = action.payload;
      const updatedusersWithTasks = usersWithTasks.map((user,index)=>{
        if(user.personId === personId){
          let newTotalTime = Number(newTime.hours) + (Number(newTime.minutes)/60)
          user.totaltangibletime_hrs += newTotalTime;
          user.totaltime_hrs += newTotalTime;
          if(taskId) {
            let {tasks} = user;
            tasks = tasks.map((task)=>{
              if(task._id === taskId){
                task.hoursLogged += newTotalTime;
              }
              return task
            })
          }
        }
        return user
      })
      return {...state, usersWithTasks : updatedusersWithTasks}
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
                          taskNotification =>
                            taskNotification._id !== action.payload.taskNotificationId,
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
      return {
        ...state,
        isLoading: true,
      };
    default:
      return state;
  }
};

export const deleteSelectedTask = async (taskId, taskMother) => {
  await axios.post(`${ApiEndpoint}/task/del/${taskId}/${taskMother}`);
};
