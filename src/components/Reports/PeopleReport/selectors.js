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
  const tasksWithLoggedHours = state.userTask.reduce((result, { hoursLogged, _id }) => {
    if (hoursLogged) {
      return { ...result, [_id]: hoursLogged }
    }

    return result;
  }, {})

  return {
    tasksWithLoggedHours,
    showPieChart: Object.keys(tasksWithLoggedHours).length > 0,
  }

}
