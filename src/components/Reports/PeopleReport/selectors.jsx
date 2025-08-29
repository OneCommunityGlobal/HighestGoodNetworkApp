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

export const peopleTasksPieChartViewData = ({ userProjects, timeEntries, userTask }) => {

  // console.log('userProjects:', userProjects);
  // console.log('timeEntries:', timeEntries);

  // const directProjectLogs = timeEntries.period.filter(entry => entry.wbsId === null);
  // console.log('Direct-to-project time entries:', directProjectLogs);
  // console.log(userProjects);

  let hoursLoggedToProjectsOnly = {};
  const tasksWithLoggedHoursOnly = {};
  // let totalHours = 0;
  //   for(let i=0; i<timeEntries.period.length; i++){
  //     totalHours += timeEntries.period[i].hours + (timeEntries.period[i].minutes/60);
  //  }

  timeEntries.period.forEach(entry => {
    const { projectId, wbsId } = entry;
    if (!projectId || wbsId !== null) return;
    const time = (entry.hours || 0) + (entry.minutes || 0) / 60;
    hoursLoggedToProjectsOnly[projectId] =
      (hoursLoggedToProjectsOnly[projectId] || 0) + time;
  });

  timeEntries.period.forEach(entry => {
    if (entry.wbsId !== null) {
      const taskKey = entry.wbsId;
      const taskName = entry.taskName || 'Unnamed Task'; // entry.taskName must exist in your data

      if (!tasksWithLoggedHoursOnly[taskKey]) {
        tasksWithLoggedHoursOnly[taskKey] = {
          totalTime: 0,
          projectId: entry.projectId,
          taskName,
        };
      }

      tasksWithLoggedHoursOnly[taskKey].totalTime += entry.hours + (entry.minutes / 60);
    }
  });



  const resultArray = userProjects?.projects.map(project => {
    const totalTime = hoursLoggedToProjectsOnly[project.projectId] || 0;
    return {
      projectId: project.projectId,
      projectName: project.projectName,
      totalTime,
    };
  })
  // .filter(p => p.totalTime > 0); // commented this line to  display all the projects even though the hours are not logged

  const hoursByTask = {};
  (timeEntries?.period ?? []).forEach(e => {
    const taskId = e?.taskId ?? e?.wbsId;
    if (taskId != null) {
      const h = (e.hours || 0) + (e.minutes || 0) / 60;
      hoursByTask[taskId] = (hoursByTask[taskId] || 0) + h;
    }
  });

  const resultArray2 = (userTask ?? []).map(t => ({
    projectId: t._id ?? t.taskId ?? t.wbsId,
    projectName: t.taskName ?? t.wbsName ?? 'Unnamed Task',
    totalTime: Number(t.hoursLogged) || 0,
  }));



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
