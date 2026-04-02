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

export const peopleTasksPieChartViewData = (state) => {
  const userProjects = state.userProjects;
  const timeEntries = state.timeEntries;
  const userId = state.userProfile?._id;

  const period = Array.isArray(timeEntries?.period) ? timeEntries.period : [];

  const allUserEntries = period.filter(
    e => (e.personId ?? e.userId) === userId
  );

  const completedUserEntries = allUserEntries.filter(e => e.isActive === true);

  const projectHours = {};
  const projectNames = {};

  allUserEntries.forEach(entry => {
    const { projectId, taskId, projectName } = entry;
    if (!projectId || taskId) return;
    const time = (entry.hours || 0) + (entry.minutes || 0) / 60;
    projectHours[projectId] = (projectHours[projectId] || 0) + time;
    if (projectName) projectNames[projectId] = projectName;
  });

  const hoursLoggedToProjectsOnly = Object.entries(projectHours).map(([projectId, totalTime]) => {
    const project = (userProjects?.projects || []).find(p => p.projectId === projectId);
    return {
      projectId,
      projectName: project?.projectName || projectNames[projectId] || `Unknown (${projectId.slice(-6)})`,
      totalTime,
    };
  });

  const userTasks = state.userTask?.tasks || [];

  const taskHours = {};
  allUserEntries.forEach(entry => {
    if (entry.taskId == null) return;
    const taskKey = entry.taskId;
    const taskName = entry.taskName || `Task in "${entry.projectName || 'Unknown Project'}"`;
    const time = (entry.hours || 0) + (entry.minutes || 0) / 60;

    if (!taskHours[taskKey]) {
      taskHours[taskKey] = { totalTime: 0, projectId: entry.projectId, taskName };
    }
    taskHours[taskKey].totalTime += time;
  });

  const tasksArray = Object.keys(taskHours).map(taskId => {
    const t = taskHours[taskId];
    return {
      projectId: taskId,   
      projectName: t.taskName,
      totalTime: t.totalTime,
    };
  });

  const tasksWithLoggedHoursById = tasksArray;
  const tasksLegend = tasksArray;

  return {
    hoursLoggedToProjectsOnly,
    tasksWithLoggedHoursById,
    tasksLegend,
    showTasksPieChart: tasksWithLoggedHoursById.length > 0,
    showProjectsPieChart: hoursLoggedToProjectsOnly.some(p => p.totalTime > 0),
    displayedTasksWithLoggedHoursById: {},
    displayedTasksLegend: {},
    showViewAllTasksButton: false,
  };
};
