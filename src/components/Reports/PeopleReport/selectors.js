import _, { result } from 'lodash';

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

const getRounded = number => {
  return Math.round(number * 100) / 100;
};

export const peopleTasksPieChartViewData = ({ userTask, allProjects, userProjects,timeEntries }) => {
  
  var hoursLoggedToProjectsOnly = {};
  var tasksWithLoggedHoursOnly = {};
  var totalHours = 0;
    for(let i=0; i<timeEntries.period.length; i++){
      totalHours += timeEntries.period[i].hours + (timeEntries.period[i].minutes/60);
   }
  
  timeEntries.period.map(entry=>{
    if(entry.wbsId===null){
      hoursLoggedToProjectsOnly[entry.projectId] = hoursLoggedToProjectsOnly[entry.projectId] ? hoursLoggedToProjectsOnly[entry.projectId] + entry.hours+(entry.minutes/60) : entry.hours+(entry.minutes/60);
    }
  })
  
  
  timeEntries.period.map(entry=>{
    if(entry.wbsId!==null){
      tasksWithLoggedHoursOnly[entry.projectId] = tasksWithLoggedHoursOnly[entry.projectId] ? tasksWithLoggedHoursOnly[entry.projectId] + entry.hours+(entry.minutes/60) : entry.hours+(entry.minutes/60);
    }
  })
  
  
  const resultArray = Object.keys(hoursLoggedToProjectsOnly).map(projectId => {
    const project = userProjects?.projects.find(proj => proj.projectId === projectId);
    return {
      projectId,
      projectName: project ? project.projectName : "Unknown", // Use "Unknown" if no matching project is found
      totalTime: hoursLoggedToProjectsOnly[projectId]
    };
  });

  const resultArray2 = Object.keys(tasksWithLoggedHoursOnly).map(projectId => {
    const project = userProjects?.projects.find(proj => proj.projectId === projectId);
    return {
      projectId,
      projectName: project ? project.projectName : "Unknown", // Use "Unknown" if no matching project is found
      totalTime: tasksWithLoggedHoursOnly[projectId]
    };
  });
  
  hoursLoggedToProjectsOnly = resultArray;

  var tasksWithLoggedHoursById = {};
  const displayedTasksWithLoggedHoursById = {};
  const projectsWithLoggedHoursById = {};
  var tasksLegend = {};
  const displayedTasksLegend = {};
  // const projectsWithLoggedHoursLegend = {};
  // const tasksWithLoggedHours = userTask?.filter(({ hoursLogged }) => hoursLogged);
  tasksLegend=resultArray2;
  tasksWithLoggedHoursById=resultArray2;
  return {
    hoursLoggedToProjectsOnly,
    tasksWithLoggedHoursById,
    // projectsWithLoggedHoursById,
    tasksLegend,
    // projectsWithLoggedHoursLegend,
    showTasksPieChart: Object.keys(tasksWithLoggedHoursById).length > 0,
    showProjectsPieChart: Object.keys(projectsWithLoggedHoursById).length > 0,
    displayedTasksWithLoggedHoursById,
    displayedTasksLegend,
    showViewAllTasksButton:
      Object.keys(tasksWithLoggedHoursById).length >
      Object.keys(displayedTasksWithLoggedHoursById).length,
  };
};
