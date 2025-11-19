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
  // If there are intermediate tasks, calculate progress based on completed hours
  if (intermediateTasks && intermediateTasks.length > 0) {
    const totalHours = intermediateTasks.reduce((sum, t) => sum + (t.expected_hours || 0), 0);
    const completedHours = intermediateTasks
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + (t.expected_hours || 0), 0);

    return totalHours > 0 ? Math.round((completedHours / totalHours) * 100) : 0;
  }

  // Otherwise, use logged hours vs suggested hours
  return task.suggested_total_hours > 0
    ? Math.round((task.logged_hours / task.suggested_total_hours) * 100)
    : 0;
};

/**
 * Determine if a task can be marked as done
 * @param {Object} task - The task object
 * @returns {boolean} Whether the task can be marked as done
 */
export const canMarkTaskAsDone = task => {
  if (task.is_completed) return false;

  // Only read tasks can be marked as complete manually
  // Must have logged hours >= suggested hours
  if (task.task_type === 'read') {
    return task.logged_hours >= task.suggested_total_hours;
  }

  // For other task types, cannot be marked done manually
  return false;
};

/**
 * Get status badge information for a task
 * @param {Object} task - The task object
 * @param {Object} styles - CSS module styles object
 * @returns {Object} Status badge info with text and className
 */
export const getTaskStatusBadge = (task, styles) => {
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
 * @returns {string} Tooltip text
 */
export const getMarkAsDoneTooltip = task => {
  if (task.is_completed) {
    return 'Task is already completed';
  }

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
  // If there are intermediate tasks, show completed hours from sub-tasks
  if (intermediateTasks && intermediateTasks.length > 0) {
    const completedHours = intermediateTasks
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + (t.expected_hours || 0), 0);

    return `${formatTime(completedHours)} • ${formatDate(
      task.last_logged_date || task.created_at,
    )}`;
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

  // If there are intermediate tasks, show completion hours
  if (intermediateTasks && intermediateTasks.length > 0) {
    const totalHours = intermediateTasks.reduce((sum, t) => sum + (t.expected_hours || 0), 0);
    const completedHours = intermediateTasks
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + (t.expected_hours || 0), 0);

    return `Progress: ${completedHours} / ${totalHours} hrs (${progressPercentage}%)`;
  }

  // Otherwise, show logged hours
  return `Progress: ${task.logged_hours || 0} / ${
    task.suggested_total_hours
  } hrs (${progressPercentage}%)`;
};
