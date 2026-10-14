import { useMemo } from 'react';
import {
  calculateProgressPercentage,
  canMarkTaskAsDone,
  getTaskStatusBadge,
  getMarkAsDoneTooltip,
  getFormattedTimeAndDate,
  getProgressText,
} from './taskUtils';

/**
 * Custom hook for task-related logic
 * @param {Object} task - The task object
 * @param {Object} styles - CSS module styles object
 * @param {Array} intermediateTasks - Array of intermediate tasks (optional)
 * @returns {Object} Task logic and computed values
 */
export const useTaskLogic = (task, styles, intermediateTasks = []) => {
  const progressPercentage = useMemo(() => calculateProgressPercentage(task, intermediateTasks), [
    task.logged_hours,
    task.suggested_total_hours,
    intermediateTasks,
  ]);

  const canMarkDone = useMemo(() => canMarkTaskAsDone(task, intermediateTasks), [
    task.is_completed,
    task.task_type,
    task.logged_hours,
    task.suggested_total_hours,
    intermediateTasks,
  ]);

  const statusBadge = useMemo(() => getTaskStatusBadge(task, styles, intermediateTasks), [
    task.status,
    task.has_upload,
    task.task_type,
    task.logged_hours,
    task.suggested_total_hours,
    task.has_comments,
    task.feedback,
    intermediateTasks,
  ]);

  const markAsDoneTooltip = useMemo(() => getMarkAsDoneTooltip(task, intermediateTasks), [
    task.is_completed,
    task.task_type,
    task.logged_hours,
    task.suggested_total_hours,
    intermediateTasks,
  ]);

  const formattedTimeAndDate = useMemo(() => getFormattedTimeAndDate(task, intermediateTasks), [
    task.logged_hours,
    task.last_logged_date,
    task.created_at,
    intermediateTasks,
  ]);

  const progressText = useMemo(() => getProgressText(task, intermediateTasks), [
    task.logged_hours,
    task.suggested_total_hours,
    intermediateTasks,
  ]);

  return {
    progressPercentage,
    canMarkDone,
    statusBadge,
    markAsDoneTooltip,
    formattedTimeAndDate,
    progressText,
  };
};
