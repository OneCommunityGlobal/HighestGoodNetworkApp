export const getPeopleReportData = (state) => ({
  auth: state.auth,
  userProfile: state.userProfile,
  userTask: state.userTask,
  infringments: state.userProfile.infringments,
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

export const peopleTasksPieChartViewData = ({ userTask, teamMemberTasks, userProfile, userProjects }) => {
  const tasksWithLoggedHours = {};
  const projectsWithLoggedHours = {};
  const tasksLegend = {};
  const projectsWithLoggedHoursLegend = {};
  const currentUserTasks = teamMemberTasks.usersWithTasks.find(({ personId }) => personId === userProfile._id)?.tasks;

  userTask.forEach(({ _id, hoursLogged, taskName }) => {
    if (hoursLogged) {
      tasksWithLoggedHours[_id] = hoursLogged;
      tasksLegend[_id] = [taskName, getRounded(hoursLogged)];

      const currentTask = currentUserTasks.find((task) => task._id === _id);
      const currentProjectName = userProjects.projects.find(({ projectId }) => projectId === currentTask.projectId).projectName;
      const savedProjectWithLoggedHours = projectsWithLoggedHours[currentTask.projectId];

      projectsWithLoggedHours[currentTask.projectId] = savedProjectWithLoggedHours ? savedProjectWithLoggedHours + hoursLogged : hoursLogged;

      if (projectsWithLoggedHoursLegend[currentTask.projectId]) {
        projectsWithLoggedHoursLegend[currentTask.projectId][1] += getRounded(hoursLogged);
      } else {
        projectsWithLoggedHoursLegend[currentTask.projectId] = [currentProjectName, getRounded(hoursLogged)];
      }
    }
  });

  return {
    tasksWithLoggedHours,
    projectsWithLoggedHours,
    tasksLegend,
    projectsWithLoggedHoursLegend,
    showTasksPieChart: 15 >= Object.keys(tasksWithLoggedHours).length > 0,
    showProjectsPieChart: Object.keys(projectsWithLoggedHours).length > 0
  }

}
