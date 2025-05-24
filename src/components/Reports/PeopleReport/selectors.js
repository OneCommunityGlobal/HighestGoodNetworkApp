import _ from 'lodash';

export const getPeopleReportData = state => ({
  auth: state.auth,
  userProfile: state.userProfile,
  userTask: state.userTask,
  infringements: state.userProfile.infringements,
  user: _.get(state, 'user', {}),
  timeEntries: state.timeEntries,
  userProjects: state.userProjects,
  allProjects: _.get(state, 'allProjects'),
  allTeams: state,
  isAssigned: state.isAssigned,
  isActive: state.isActive,
  priority: state.priority,
  status: state.status,
  hasFilter: state.hasFilter,
  allClassification: state.allClassification,
  classification: state.classification,
  users: state.users,
  classificationList: state.classificationList,
  priorityList: state.priorityList,
  statusList: state.statusList,
  tangibleHoursReportedThisWeek: parseFloat(state.userProfile.tangibleHoursReportedThisWeek),
  darkMode: state.theme.darkMode,
});

export const peopleTasksPieChartViewData = ({ userProjects, timeEntries, tasks }) => {
  let hoursLoggedToProjectsOnly = {};
  const tasksWithLoggedHoursOnly = {};

  timeEntries.period.forEach(entry => {
    if (entry.wbsId === null) {
      hoursLoggedToProjectsOnly[entry.projectId] = hoursLoggedToProjectsOnly[entry.projectId]
        ? hoursLoggedToProjectsOnly[entry.projectId] + entry.hours + entry.minutes / 60
        : entry.hours + entry.minutes / 60;
    }
  });

  timeEntries.period.forEach(entry => {
    if (entry.wbsId !== null && entry.taskId) {
      // Try to get the task name from the global tasks list if not present in entry
      let taskName = entry.taskName;
      let taskItems = [];
      if (tasks && Array.isArray(tasks.taskItems)) {
        ({ taskItems } = tasks);
      }
      if (!taskName && taskItems.length > 0) {
        const foundTask = taskItems.find(t => t._id === entry.taskId);
        taskName = foundTask ? foundTask.taskName : `Task ${entry.taskId}`;
      }
      if (!tasksWithLoggedHoursOnly[entry.taskId]) {
        tasksWithLoggedHoursOnly[entry.taskId] = {
          taskId: entry.taskId,
          taskName,
          totalTime: 0,
          projectId: entry.projectId,
          projectName:
            userProjects?.projects.find(proj => proj.projectId === entry.projectId)?.projectName ||
            'Unknown',
        };
      }
      tasksWithLoggedHoursOnly[entry.taskId].totalTime += entry.hours + entry.minutes / 60;
    }
  });

  const resultArray = Object.keys(hoursLoggedToProjectsOnly).map(projectId => {
    const project = userProjects?.projects.find(proj => proj.projectId === projectId);
    return {
      projectId,
      projectName: project ? project.projectName : 'Unknown', // Use 'Unknown' if no matching project is found
      totalTime: hoursLoggedToProjectsOnly[projectId],
    };
  });

  const resultArray2 = Object.values(tasksWithLoggedHoursOnly);

  hoursLoggedToProjectsOnly = resultArray;

  let tasksWithLoggedHoursById = {};
  const displayedTasksWithLoggedHoursById = {};
  const projectsWithLoggedHoursById = {};
  let tasksLegend = {};
  const displayedTasksLegend = {};

  tasksLegend = resultArray2;
  tasksWithLoggedHoursById = resultArray2;
  return {
    hoursLoggedToProjectsOnly,
    tasksWithLoggedHoursById,
    tasksLegend,
    showTasksPieChart: Object.keys(tasksWithLoggedHoursById).length > 0,
    showProjectsPieChart: Object.keys(projectsWithLoggedHoursById).length > 0,
    displayedTasksWithLoggedHoursById,
    displayedTasksLegend,
    showViewAllTasksButton:
      Object.keys(tasksWithLoggedHoursById).length >
      Object.keys(displayedTasksWithLoggedHoursById).length,
  };
};
