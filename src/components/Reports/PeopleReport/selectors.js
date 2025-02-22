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
  
  // console.log(tasksWithLoggedHoursOnly)
  const resultArray = Object.keys(hoursLoggedToProjectsOnly).map(projectId => {
    const project = userProjects.projects.find(proj => proj.projectId === projectId);
    return {
      projectId,
      projectName: project ? project.projectName : "Unknown", // Use "Unknown" if no matching project is found
      totalTime: hoursLoggedToProjectsOnly[projectId]
    };
  });

  const resultArray2 = Object.keys(tasksWithLoggedHoursOnly).map(projectId => {
    const project = userProjects.projects.find(proj => proj.projectId === projectId);
    return {
      projectId,
      projectName: project ? project.projectName : "Unknown", // Use "Unknown" if no matching project is found
      totalTime: tasksWithLoggedHoursOnly[projectId]
    };
  });
  // tasksWithLoggedHoursOnly = resultArray2;
  hoursLoggedToProjectsOnly = resultArray;

  var tasksWithLoggedHoursById = {};
  const displayedTasksWithLoggedHoursById = {};
  const projectsWithLoggedHoursById = {};
  var tasksLegend = {};
  const displayedTasksLegend = {};
  const projectsWithLoggedHoursLegend = {};
  const tasksWithLoggedHours = userTask?.filter(({ hoursLogged }) => hoursLogged);
  tasksLegend=resultArray2;
  // tasksWithLoggedHours
  //   .sort((a,b)=>b.hoursLogged - a.hoursLogged)
  //   .forEach(({ _id: taskId, hoursLogged, taskName }) => {
  //     tasksWithLoggedHoursById[taskId] = hoursLogged;
  //     tasksLegend[taskId] = [taskName, getRounded(hoursLogged)];

  //     const currentTask = userTask?.find(task => task._id === taskId); 
  //     if (currentTask) {
  //       const currentProjectName = allProjects?.projects?.find(
  //         ({ _id }) => _id === currentTask.projectId,
  //       )?.projectName;
  //       const savedProjectWithLoggedHours = projectsWithLoggedHoursById[currentTask.projectId];

  //     projectsWithLoggedHoursById[currentTask.projectId] = savedProjectWithLoggedHours
  //       ? savedProjectWithLoggedHours + hoursLogged
  //       : hoursLogged;

  //     if (projectsWithLoggedHoursLegend[currentTask.projectId]) {
  //       projectsWithLoggedHoursLegend[currentTask.projectId][1] += getRounded(hoursLogged);
  //     } else {
  //       projectsWithLoggedHoursLegend[currentTask.projectId] = [
  //         currentProjectName,
  //         getRounded(hoursLogged),
  //       ];
  //     }
  //   }
  // });
  tasksWithLoggedHoursById=resultArray2;
  // const displayedTasksCount = Math.max(4, Object.keys(  ).length);

  //   //create minimized chart
  //   tasksWithLoggedHours
  //     .slice(0, displayedTasksCount)
  //     .forEach(({ _id, hoursLogged, taskName }) => {
  //       displayedTasksWithLoggedHoursById[_id] = hoursLogged;
  //       displayedTasksLegend[_id] = [taskName, getRounded(hoursLogged)];
  //     });

      
// if(tasksWithLoggedHours.length > displayedTasksCount){
//   //if the number of tasks with hours logged is greater than 4, these tasks should still be accounted for in the total hours calculation on the minized chart
//   if(tasksWithLoggedHours.length === displayedTasksCount + 1){
//     //edge case for when the number of tasks is exactly 5. The fifth task should be added to the chart and the legend
//     const remainder = tasksWithLoggedHours.slice(displayedTasksCount)
//     remainder.forEach(({ _id, hoursLogged, taskName }) => {
//       displayedTasksWithLoggedHoursById[_id] = hoursLogged;
//       displayedTasksLegend[_id] = [taskName, getRounded(hoursLogged)];
//     });
//   }else{
//     // when the number of tasks is greater than 5, the hours get summed up and added to the chart as "Other Tasks"
//     let totalOtherHours = tasksWithLoggedHours.slice(displayedTasksCount).reduce((acc, val)=> acc + val.hoursLogged, 0)  
//     let numberOtherTasks = tasksWithLoggedHours.length - displayedTasksCount; 
//     displayedTasksWithLoggedHoursById["otherTasksTotalHours"] = totalOtherHours;
//     displayedTasksLegend["otherTasksTotalHours"] = [`${numberOtherTasks} other tasks`, totalOtherHours]
//   }
//   }
  
  // console.log(tasksWithLoggedHoursById)
  // tasksWithLoggedHoursById=tasksWithLoggedHoursOnly;

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
