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

const getRounded = number => {
  return Math.round(number * 100) / 100;
};

/**
 * Builds pie chart data for tasks and projects.
 * Now uses `timeEntries.period` to accumulate hours,
 * rather than relying on `userTask.hoursLogged`.
 */
export const peopleTasksPieChartViewData = ({
  userTask = [],
  allProjects = {},
  timeEntries = {},
}) => {
  // Helper objects to keep track of hours by task and by project
  const tasksWithLoggedHoursById = {};
  const projectsWithLoggedHoursById = {};

  // Legends for chart display
  const tasksLegend = {};
  const projectsWithLoggedHoursLegend = {};

  // We rely on `timeEntries.period` to accumulate actual hours
  if (Array.isArray(timeEntries.period)) {
    timeEntries.period.forEach(({ taskId, projectId, hours }) => {
      
      const taskKey = (() => {
        if (!taskId) return null;
        return typeof taskId === 'object' ? taskId._id : taskId;
      })();

      const projectKey = (() => {
        if (!projectId) return null;
        return typeof projectId === 'object' ? projectId._id : projectId;
      })();
      
      // Accumulate task hours
      if (taskKey) {
        tasksWithLoggedHoursById[taskKey] =
          (tasksWithLoggedHoursById[taskKey] || 0) + hours;
      }
      // Accumulate project hours
      if (projectKey) {
        projectsWithLoggedHoursById[projectKey] =
          (projectsWithLoggedHoursById[projectKey] || 0) + hours;
      }
    });
  }

  // Build a consistent array of tasks (with total hours) we can sort, slice, etc.
  const tasksWithLoggedHours = Object.entries(tasksWithLoggedHoursById).map(
    ([taskId, totalHours]) => {
      const foundTask = userTask.find(t => t._id === taskId);
      return {
        _id: taskId,
        hoursLogged: totalHours,
        // fallback to "Untitled Task" in case userTask doesn't have a matching entry
        taskName: foundTask?.taskName || 'Untitled Task',
        projectId: foundTask?.projectId,
      };
    },
  );

  // Sort descending by hours
  tasksWithLoggedHours.sort((a, b) => b.hoursLogged - a.hoursLogged);

  // Build tasks legend from tasksWithLoggedHours
  tasksWithLoggedHours.forEach(({ _id, hoursLogged, taskName }) => {
    tasksLegend[_id] = [taskName, getRounded(hoursLogged)];
  });

  // Build the projects legend
  Object.entries(projectsWithLoggedHoursById).forEach(
    ([projectId, totalHours]) => {
      const foundProject = allProjects?.projects?.find(
        p => p._id === projectId,
      );
      projectsWithLoggedHoursLegend[projectId] = [
        foundProject?.projectName || 'Untitled Project',
        getRounded(totalHours),
      ];
    },
  );

  // Decide how many tasks we want to display before grouping them as "Other Tasks"
  const displayedTasksCount = Math.max(
    4,
    Object.keys(projectsWithLoggedHoursById).length,
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
    // If exactly one more (5 tasks total), include it in the chart fully
    if (tasksWithLoggedHours.length === displayedTasksCount + 1) {
      const remainder = tasksWithLoggedHours.slice(displayedTasksCount);
      remainder.forEach(({ _id, hoursLogged, taskName }) => {
        displayedTasksWithLoggedHoursById[_id] = hoursLogged;
        displayedTasksLegend[_id] = [taskName, getRounded(hoursLogged)];
      });
    } else {
      // Sum up everything beyond displayedTasksCount into "Other Tasks"
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
    // Tasks
    tasksWithLoggedHoursById,
    // Projects
    projectsWithLoggedHoursById,
    // Full legends
    tasksLegend,
    projectsWithLoggedHoursLegend,
    // Flags to show/hide charts
    showTasksPieChart: Object.keys(tasksWithLoggedHoursById).length > 0,
    showProjectsPieChart: Object.keys(projectsWithLoggedHoursById).length > 0,
    // Minimal chart data
    displayedTasksWithLoggedHoursById,
    displayedTasksLegend,
    // If there's more tasks in the "full" set than the "displayed" set
    showViewAllTasksButton:
      Object.keys(tasksWithLoggedHoursById).length >
      Object.keys(displayedTasksWithLoggedHoursById).length,
  };
};
