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

export const peopleTasksPieChartViewData = (state) => {
  const tasksWithLoggedHours = {};
  const tasksLegend = {};

  state.userTask.forEach(({ _id, hoursLogged, taskName }) => {
    if (hoursLogged) {
      tasksWithLoggedHours[_id] = hoursLogged;
      tasksLegend[_id] = [taskName, Math.round(hoursLogged * 100) / 100];
    }
  });

  return {
    tasksWithLoggedHours,
    tasksLegend,
    showPieChart: Object.keys(tasksWithLoggedHours).length > 0,
  }

}
