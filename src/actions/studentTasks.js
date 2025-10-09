/** *******************************************************************************
 * Action: Student Tasks
 * Author: Assistant - 2025
 ******************************************************************************* */
import axios from 'axios';
import { toast } from 'react-toastify';
import * as types from '../constants/studentTasks';
import { ENDPOINTS } from '~/utils/URL';
import { mockTasks } from '../components/EductionPortal/StudentDashboard/mockData';

/**
 * Set a flag that fetching Student Tasks
 */
export const setStudentTasksStart = () => {
  return {
    type: types.FETCH_STUDENT_TASKS_START,
  };
};

/**
 * Set Student Tasks in store
 * @param payload : Student Task []
 */
export const setStudentTasks = (taskItems) => {
  return {
    type: types.RECEIVE_STUDENT_TASKS,
    taskItems,
  };
};

/**
 * Error when fetching student tasks
 * @param payload : error status code
 */
export const setStudentTasksError = (err) => {
  return {
    type: types.FETCH_STUDENT_TASKS_ERROR,
    err,
  };
};

/**
 * Update a specific student task
 */
export const updateStudentTask = (taskId, updatedTask) => {
  return {
    type: types.UPDATE_STUDENT_TASK,
    taskId,
    updatedTask,
  };
};

/**
 * Fetch all student tasks for the logged-in user
 */
export const fetchStudentTasks = () => {
  return async (dispatch, getState) => {
    dispatch(setStudentTasksStart());
    try {
      const state = getState();
      const userId = state.auth.user.userid;

      try {
        // Try to use the student tasks endpoint
        const response = await axios.get(ENDPOINTS.STUDENT_TASKS());

        // Transform the data to match our student task format
        const studentTasks = response.data.map(task => ({
          id: task._id,
          course_name: task.taskName || task.course_name,
          subtitle: task.subtitle || task.description,
          task_type: task.task_type || 'read-only',
          logged_hours: task.hoursLogged || 0,
          suggested_total_hours: task.estimatedHours || task.suggested_total_hours || 0,
          last_logged_date: task.last_logged_date || task.created_at,
          created_at: task.created_at,
          is_completed: task.status === 'Complete' || task.is_completed || false,
          has_upload: task.has_upload || false,
          has_comments: task.has_comments || false,
          status: task.status || 'in_progress',
          _id: task._id, // Keep original ID for API calls
          mother: task.mother,
        }));

        dispatch(setStudentTasks(studentTasks));
      } catch (apiError) {
        // If API is not available, use mock data
        console.warn('Student tasks API not available, using mock data:', apiError.message);
        dispatch(setStudentTasks(mockTasks));
        toast.info('Using demo data. Student tasks API is not yet available.');
      }
    } catch (err) {
      console.error('Error fetching student tasks:', err);
      dispatch(setStudentTasksError(err.message || 'Failed to fetch student tasks'));
      toast.error('Failed to fetch student tasks. Please try again later.');
    }
  };
};

/**
 * Mark a student task as done
 */
export const markStudentTaskAsDone = (taskId) => {
  return async (dispatch, getState) => {
    try {
      const state = getState();
      const task = state.studentTasks.taskItems.find(t => t.id === taskId);

      if (!task) {
        throw new Error('Task not found');
      }

      // Update task status to Complete
      const updatedTask = {
        status: 'Complete',
        taskName: task.course_name,
        priority: task.priority || 'Medium',
        resources: task.resources || [],
        isAssigned: task.isAssigned || true,
        hoursBest: task.hoursBest || task.suggested_total_hours,
        hoursWorst: task.hoursWorst || task.suggested_total_hours,
        hoursMost: task.hoursMost || task.suggested_total_hours,
        estimatedHours: task.suggested_total_hours,
        startedDatetime: task.startedDatetime || task.created_at,
        dueDatetime: task.dueDatetime,
        links: task.links || [],
        whyInfo: task.whyInfo || '',
        intentInfo: task.intentInfo || '',
        endstateInfo: task.endstateInfo || '',
        classification: task.classification || 'Task',
      };

      try {
        // Try to use the student task mark done endpoint
        await axios.put(ENDPOINTS.STUDENT_TASK_MARK_DONE(taskId), {});
        toast.success('Task marked as completed successfully!');
      } catch (apiError) {
        // If API is not available, just update local state
        console.warn('Student task mark done API not available, updating local state only:', apiError.message);
        toast.info('Task marked as completed locally. API not yet available.');
      }

      // Update local state
      dispatch(updateStudentTask(taskId, {
        ...task,
        is_completed: true,
        status: 'completed'
      }));
    } catch (err) {
      console.error('Error marking task as done:', err);
      toast.error('Failed to mark task as done. Please try again.');
    }
  };
};
