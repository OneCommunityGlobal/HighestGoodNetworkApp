/**
 * Shared utility functions for task components
 */

/**
 * Calculate progress percentage for a task based on intermediate tasks
 * @param {Object} task - The task object
 * @param {Array} intermediateTasks - Array of intermediate tasks (optional)
 * @returns {number} Progress percentage (0-100)
 */
export const calculateProgressPercentage = (task, intermediateTasks = []) => {
  // If there are intermediate tasks, calculate progress based on number of completed tasks
  if (intermediateTasks && intermediateTasks.length > 0) {
    const totalTasks = intermediateTasks.length;
    const completedTasks = intermediateTasks.filter(t => t.status === 'completed').length;

    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  }

  // Otherwise, use logged hours vs suggested hours
  return task.suggested_total_hours > 0
    ? Math.round((task.logged_hours / task.suggested_total_hours) * 100)
    : 0;
};

/**
 * Determine if a task can be marked as done
 * @param {Object} task - The task object
 * @param {Array} intermediateTasks - Array of intermediate tasks (optional)
 * @returns {boolean} Whether the task can be marked as done
 */
export const canMarkTaskAsDone = (task, intermediateTasks = []) => {
  if (task.is_completed) return false;

  // If there are intermediate tasks, ONLY check if all sub-tasks are completed
  if (intermediateTasks && intermediateTasks.length > 0) {
    return intermediateTasks.every(t => t.status === 'completed');
  }

  // Otherwise, use the original logic for tasks without sub-tasks
  if (task.task_type === 'read') {
    return task.logged_hours >= task.suggested_total_hours;
  }

  return false;
};

/**
 * Get status badge information for a task
 * @param {Object} task - The task object
 * @param {Object} styles - CSS module styles object
 * @param {Array} intermediateTasks - Array of intermediate tasks (optional)
 * @returns {Object} Status badge info with text and className
 */
export const getTaskStatusBadge = (task, styles, intermediateTasks = []) => {
  // Check if all sub-tasks are completed
  if (intermediateTasks && intermediateTasks.length > 0) {
    const allSubTasksCompleted = intermediateTasks.every(t => t.status === 'completed');
    if (allSubTasksCompleted) {
      return { text: 'Completed', className: styles.completedBadge };
    }
  }

  if (task.status === 'completed' || task.status === 'graded') {
    return { text: 'Completed', className: styles.completedBadge };
  }

  if (task.has_upload && task.task_type === 'write') {
    return { text: 'Hours Met', className: styles.hoursMetBadge };
  }

  if (task.logged_hours >= task.suggested_total_hours) {
    return { text: 'Hours Met', className: styles.hoursMetBadge };
  }

  if (task.has_comments || (task.feedback && task.feedback.length > 0)) {
    return { text: 'Comments', className: styles.commentsBadge };
  }

  if (task.status === 'assigned') {
    return { text: 'Assigned', className: styles.pendingBadge };
  }

  return { text: 'Pending Review', className: styles.pendingBadge };
};

/**
 * Get tooltip text for mark as done button
 * @param {Object} task - The task object
 * @param {Array} intermediateTasks - Array of intermediate tasks (optional)
 * @returns {string} Tooltip text
 */
export const getMarkAsDoneTooltip = (task, intermediateTasks = []) => {
  if (task.is_completed) {
    return 'Task is already completed';
  }

  // If there are intermediate tasks, ONLY consider sub-task completion
  if (intermediateTasks && intermediateTasks.length > 0) {
    const completedCount = intermediateTasks.filter(t => t.status === 'completed').length;
    const totalCount = intermediateTasks.length;

    if (completedCount === totalCount) {
      return 'Mark as Done - All sub-tasks completed';
    }

    const remaining = totalCount - completedCount;
    return `Cannot mark as done: Complete ${remaining} more sub-task${
      remaining !== 1 ? 's' : ''
    } (${completedCount}/${totalCount} done)`;
  }

  // Otherwise, use original logic for tasks without sub-tasks
  if (task.task_type !== 'read') {
    return `Cannot mark as done: Only read tasks can be completed manually (Current type: ${task.task_type})`;
  }

  if (task.logged_hours < task.suggested_total_hours) {
    return `Cannot mark as done: Insufficient hours logged (${task.logged_hours || 0}/${
      task.suggested_total_hours
    } hrs required)`;
  }

  return 'Mark as Done - All requirements met';
};

/**
 * Format time in hours and minutes
 * @param {number} hours - Hours as decimal number
 * @returns {string} Formatted time string
 */
export const formatTime = hours => {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  return `${wholeHours}h ${minutes}m`;
};

/**
 * Format date string to readable format
 * @param {string} dateString - Date string
 * @returns {string} Formatted date string
 */
export const formatDate = dateString => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Get formatted time and date string for display
 * @param {Object} task - The task object
 * @param {Array} intermediateTasks - Array of intermediate tasks (optional)
 * @returns {string} Formatted time and date string
 */
export const getFormattedTimeAndDate = (task, intermediateTasks = []) => {
  // If there are intermediate tasks, just show the date (no hours)
  if (intermediateTasks && intermediateTasks.length > 0) {
    return formatDate(task.last_logged_date || task.created_at);
  }

  // Otherwise, show logged hours
  return `${formatTime(task.logged_hours || 0)} • ${formatDate(
    task.last_logged_date || task.created_at,
  )}`;
};

/**
 * Get progress text for display
 * @param {Object} task - The task object
 * @param {Array} intermediateTasks - Array of intermediate tasks (optional)
 * @returns {string} Progress text
 */
export const getProgressText = (task, intermediateTasks = []) => {
  const progressPercentage = calculateProgressPercentage(task, intermediateTasks);

  // If there are intermediate tasks, show number of completed tasks
  if (intermediateTasks && intermediateTasks.length > 0) {
    const totalTasks = intermediateTasks.length;
    const completedTasks = intermediateTasks.filter(t => t.status === 'completed').length;

    return `Progress: ${completedTasks} / ${totalTasks} tasks (${progressPercentage}%)`;
  }

  // Otherwise, show logged hours
  return `Progress: ${task.logged_hours || 0} / ${
    task.suggested_total_hours
  } hrs (${progressPercentage}%)`;
};

/**
 * Determine if an intermediate task can be marked as done
 * @param {Object} intermediateTask - The intermediate task object
 * @returns {boolean} Whether the intermediate task can be marked as done
 */
export const canMarkIntermediateTaskAsDone = intermediateTask => {
  // Already completed
  if (intermediateTask.status === 'completed') return false;

  // Check if logged hours meet or exceed expected hours
  const loggedHours = intermediateTask.logged_hours || 0;
  const expectedHours = intermediateTask.expected_hours || 0;

  return loggedHours >= expectedHours;
};

/**
 * Get tooltip text for mark intermediate task as done button
 * @param {Object} intermediateTask - The intermediate task object
 * @returns {string} Tooltip text
 */
export const getMarkIntermediateAsDoneTooltip = intermediateTask => {
  if (intermediateTask.status === 'completed') {
    return 'Sub-task is already completed';
  }

  const loggedHours = intermediateTask.logged_hours || 0;
  const expectedHours = intermediateTask.expected_hours || 0;

  if (loggedHours >= expectedHours) {
    return 'Mark as Done - Hour requirement met';
  }

  return `Cannot mark as done: Insufficient hours logged (${loggedHours}/${expectedHours} hrs required)`;
};
