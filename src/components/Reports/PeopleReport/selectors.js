export const getPeopleReportData = (state) => ({
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
  tangibleHoursReportedThisWeek: parseFloat(state.userProfile.tangibleHoursReportedThisWeek)
});

const getRounded = (number) => {
  return Math.round(number * 100) / 100;
};

export const peopleTasksPieChartViewData = ({ userTask, allProjects }) => {
  const tasksWithLoggedHoursById = {};
  const displayedTasksWithLoggedHoursById = {};
  const projectsWithLoggedHoursById = {};
  const tasksLegend = {};
  const displayedTasksLegend = {};
  const projectsWithLoggedHoursLegend = {};
  const tasksWithLoggedHours = userTask?.filter(({ hoursLogged }) => hoursLogged);

  tasksWithLoggedHours.forEach(({ _id, hoursLogged, taskName }) => {
    tasksWithLoggedHoursById[_id] = hoursLogged;
    tasksLegend[_id] = [taskName, getRounded(hoursLogged)];

    const currentTask = userTask?.find((task) => task._id === _id);

    if (currentTask) {
      const currentProjectName = allProjects?.projects?.find(({ _id }) => _id === currentTask.projectId)?.projectName;
      const savedProjectWithLoggedHours = projectsWithLoggedHoursById[currentTask.projectId];

      projectsWithLoggedHoursById[currentTask.projectId] = savedProjectWithLoggedHours ? savedProjectWithLoggedHours + hoursLogged : hoursLogged;

      if (projectsWithLoggedHoursLegend[currentTask.projectId]) {
        projectsWithLoggedHoursLegend[currentTask.projectId][1] += getRounded(hoursLogged);
      } else {
        projectsWithLoggedHoursLegend[currentTask.projectId] = [currentProjectName, getRounded(hoursLogged)];
      }
    }
  });

  const displayedTasksCount = Math.max(4, Object.keys(projectsWithLoggedHoursById).length);

  tasksWithLoggedHours.sort((a, b) => new Date(b.modifiedDatetime) - new Date(a.modifiedDatetime))
    .slice(0, displayedTasksCount)
    .forEach(({ _id, hoursLogged, taskName }) => {
      displayedTasksWithLoggedHoursById[_id] = hoursLogged;
      displayedTasksLegend[_id] = [taskName, getRounded(hoursLogged)];
    });

  return {
    tasksWithLoggedHoursById,
    projectsWithLoggedHoursById,
    tasksLegend,
    projectsWithLoggedHoursLegend,
    showTasksPieChart: Object.keys(tasksWithLoggedHoursById).length > 0,
    showProjectsPieChart: Object.keys(projectsWithLoggedHoursById).length > 0,
    displayedTasksWithLoggedHoursById,
    displayedTasksLegend,
    showViewAllTasksButton: Object.keys(tasksWithLoggedHoursById).length > Object.keys(displayedTasksWithLoggedHoursById).length
  }

}
