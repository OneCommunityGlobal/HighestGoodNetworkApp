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
 * @returns {Object} Task logic and computed values
 */
export const useTaskLogic = (task, styles) => {
  const progressPercentage = useMemo(() => calculateProgressPercentage(task), [
    task.logged_hours,
    task.suggested_total_hours,
  ]);

  const canMarkDone = useMemo(() => canMarkTaskAsDone(task), [
    task.is_completed,
    task.task_type,
    task.logged_hours,
    task.suggested_total_hours,
  ]);

  const statusBadge = useMemo(() => getTaskStatusBadge(task, styles), [
    task.status,
    task.has_upload,
    task.task_type,
    task.logged_hours,
    task.suggested_total_hours,
    task.has_comments,
    task.feedback,
  ]);

  const markAsDoneTooltip = useMemo(() => getMarkAsDoneTooltip(task), [
    task.is_completed,
    task.task_type,
    task.logged_hours,
    task.suggested_total_hours,
  ]);

  const formattedTimeAndDate = useMemo(() => getFormattedTimeAndDate(task), [
    task.logged_hours,
    task.last_logged_date,
    task.created_at,
  ]);

  const progressText = useMemo(() => getProgressText(task), [
    task.logged_hours,
    task.suggested_total_hours,
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
