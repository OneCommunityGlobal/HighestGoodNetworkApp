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
  console.log(period)
  const userEntries = period.filter(
    e => (e.personId ?? e.userId) === userId && e.isActive === false
  );

  const entries = userEntries;

  const projectHours = {};
  entries.forEach(entry => {
    const { projectId } = entry;
    if (!projectId) return;
    const time = (entry.hours || 0) + (entry.minutes || 0) / 60;
    projectHours[projectId] = (projectHours[projectId] || 0) + time;
  });

  const taskHours = {};
  entries.forEach(entry => {
    if (entry.wbsId == null) return;   
    const taskKey = entry.wbsId;       
    const taskName = entry.taskName || 'Unnamed Task';
    const time = (entry.hours || 0) + (entry.minutes || 0) / 60;

    if (!taskHours[taskKey]) {
      taskHours[taskKey] = { totalTime: 0, projectId: entry.projectId, taskName };
    }
    taskHours[taskKey].totalTime += time;
  });

  const hoursLoggedToProjectsOnly = (userProjects?.projects || []).map(project => ({
    projectId: project.projectId,
    projectName: project.projectName,
    totalTime: projectHours[project.projectId] || 0,
  }));

  const resultArray2 = Object.keys(taskHours).map(taskId => {
    const t = taskHours[taskId];
    return {
      projectId: taskId,           
      projectName: t.taskName,
      totalTime: t.totalTime,
    };
  });

  const tasksWithLoggedHoursById = resultArray2;
  const tasksLegend = resultArray2;

  return {
    hoursLoggedToProjectsOnly,
    tasksWithLoggedHoursById,
    tasksLegend,
    showTasksPieChart: tasksWithLoggedHoursById.length > 0,
    showProjectsPieChart: hoursLoggedToProjectsOnly.length > 0,
    displayedTasksWithLoggedHoursById: {},
    displayedTasksLegend: {},
    showViewAllTasksButton: false,
  };
};
