import _ from 'lodash';

export const calculateTotalTangibleHours = (timeEntries) => {
  if (!Array.isArray(timeEntries.period)) {
    return 0;
  }

  return timeEntries.period.reduce((total, entry) => {
    if (!entry.isTangible) {
      return total;
    }
    const hours = Number(entry.hours) || 0;
    const minutes = Number(entry.minutes) || 0;
    return total + hours + (minutes / 60);
  }, 0);
};

export const getPeopleReportData = state => ({
  auth: state.auth,
  userProfile: state.userProfile,
  userTask: state.userTask,
  infringements: state.userProfile.infringements,
  user: _.get(state, 'user', {}),
  timeEntries: state.timeEntries,
  totalTangibleHours: calculateTotalTangibleHours(state.timeEntries),
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

export const peopleTasksPieChartViewData = ({
  userTask = [],
  allProjects = {},
  timeEntries = {},
}) => {
  const tasksWithLoggedHoursById = {};
  const projectsWithLoggedHoursById = {};
  const projectNameMapping = {};
  const tasksLegend = {};
  const projectsWithLoggedHoursLegend = {};

  // Create a mapping of task IDs to task names
  const taskNameMapping = {};
  userTask.forEach(task => {
    taskNameMapping[task._id] = task.taskName;
    if (task.projectId && task.projectName) {
      projectNameMapping[task.projectId] = task.projectName;
    }
  });

  // Only count tangible hours for the pie chart
  if (Array.isArray(timeEntries.period)) {
    timeEntries.period.forEach((entry) => {
      // Skip non-tangible entries or entries without a project
      if (!entry.isTangible || !entry.projectId) {
        return;
      }

      const { taskId, projectId, hours = 0, minutes = 0, projectName, taskName } = entry;
      
      // Convert hours and minutes to total hours
      const totalHours = Number(hours) + (Number(minutes) / 60);
      
      const taskKey = (() => {
        if (!taskId) return null;
        return typeof taskId === 'object' ? taskId._id : taskId;
      })();

      const projectKey = (() => {
        if (!projectId) return null;
        return typeof projectId === 'object' ? projectId._id : projectId;
      })();

      // Only accumulate hours for tasks that have a valid project
      if (taskKey && projectKey) {
        tasksWithLoggedHoursById[taskKey] = 
          (tasksWithLoggedHoursById[taskKey] || 0) + totalHours;
        
        // Store task name if available
        if (taskName) {
          taskNameMapping[taskKey] = taskName;
        }
      }

      // Store project name if available
      if (projectKey && projectName) {
        projectNameMapping[projectKey] = projectName;
      }
      
      // Accumulate tangible project hours 
      if (projectKey) {
        projectsWithLoggedHoursById[projectKey] = 
          (projectsWithLoggedHoursById[projectKey] || 0) + totalHours;
      }
    });
  }

  // Build the projects legend with proper names
  Object.entries(projectsWithLoggedHoursById).forEach(
    ([projectId, totalHours]) => {
      // Try to get project name from multiple sources
      const projectName = 
        projectNameMapping[projectId] || // From our mapping
        allProjects?.projects?.find(p => p._id === projectId)?.projectName || // From allProjects
        'Untitled Project'; 

      projectsWithLoggedHoursLegend[projectId] = [
        projectName,
        getRounded(totalHours),
      ];
    },
  );

  // Combine projects with the same name (handle duplicates)
  const combinedProjects = {};
  Object.entries(projectsWithLoggedHoursLegend).forEach(([, [name, hours]]) => {
    if (!combinedProjects[name]) {
      combinedProjects[name] = hours;
    } else {
      combinedProjects[name] += hours;
    }
  });

  // Rebuild projectsWithLoggedHoursById and legend with combined values
  const newProjectsWithLoggedHoursById = {};
  const newProjectsWithLoggedHoursLegend = {};
  
  Object.entries(combinedProjects).forEach(([name, hours]) => {
    const id = `combined_${name.replace(/\s+/g, '_')}`;
    newProjectsWithLoggedHoursById[id] = hours;
    newProjectsWithLoggedHoursLegend[id] = [name, getRounded(hours)];
  });

  // Build a consistent array of tasks (with total hours) we can sort, slice, etc.
  const tasksWithLoggedHours = Object.entries(tasksWithLoggedHoursById).map(
    ([taskId, totalHours]) => {
      // Look up task name from our mapping or userTask array
      const taskName = taskNameMapping[taskId] || 
                      userTask.find(t => t._id === taskId)?.taskName || 
                      'Untitled Task';
      
      return {
        _id: taskId,
        hoursLogged: totalHours,
        taskName,
        projectId: userTask.find(t => t._id === taskId)?.projectId,
      };
    },
  );

  // Sort descending by hours
  tasksWithLoggedHours.sort((a, b) => b.hoursLogged - a.hoursLogged);

  // Build tasks legend from tasksWithLoggedHours
  tasksWithLoggedHours.forEach(({ _id, hoursLogged, taskName }) => {
    tasksLegend[_id] = [taskName, getRounded(hoursLogged)];
  });

  // Decide how many tasks we want to display before grouping them as "Other Tasks"
  const displayedTasksCount = Math.max(
    4,
    Object.keys(newProjectsWithLoggedHoursById).length,
  );

  // Minimal chart data
  const displayedTasksWithLoggedHoursById = {};
  const displayedTasksLegend = {};

  // Take the top (displayedTasksCount) tasks
  tasksWithLoggedHours.slice(0, displayedTasksCount).forEach(task => {
    displayedTasksWithLoggedHoursById[task._id] = task.hoursLogged;
    displayedTasksLegend[task._id] = [
      task.taskName,
      getRounded(task.hoursLogged),
    ];
  });

  // If there are more tasks than displayedTasksCount, handle "other tasks" logic
  if (tasksWithLoggedHours.length > displayedTasksCount) {
    if (tasksWithLoggedHours.length === displayedTasksCount + 1) {
      const remainder = tasksWithLoggedHours.slice(displayedTasksCount);
      remainder.forEach(({ _id, hoursLogged, taskName }) => {
        displayedTasksWithLoggedHoursById[_id] = hoursLogged;
        displayedTasksLegend[_id] = [taskName, getRounded(hoursLogged)];
      });
    } else {
      const remainder = tasksWithLoggedHours.slice(displayedTasksCount);
      const totalOtherHours = remainder.reduce(
        (acc, val) => acc + val.hoursLogged,
        0,
      );
      const numberOtherTasks = remainder.length;
      displayedTasksWithLoggedHoursById.otherTasksTotalHours = totalOtherHours;
      displayedTasksLegend.otherTasksTotalHours = [
        `${numberOtherTasks} other tasks`,
        getRounded(totalOtherHours),
      ];
    }
  }

  return {
    tasksWithLoggedHoursById,
    projectsWithLoggedHoursById: newProjectsWithLoggedHoursById,
    tasksLegend,
    projectsWithLoggedHoursLegend: newProjectsWithLoggedHoursLegend,
    showTasksPieChart: Object.keys(tasksWithLoggedHoursById).length > 0,
    showProjectsPieChart: Object.keys(newProjectsWithLoggedHoursById).length > 0,
    displayedTasksWithLoggedHoursById,
    displayedTasksLegend,
    showViewAllTasksButton:
      Object.keys(tasksWithLoggedHoursById).length >
      Object.keys(displayedTasksWithLoggedHoursById).length,
  };
};
