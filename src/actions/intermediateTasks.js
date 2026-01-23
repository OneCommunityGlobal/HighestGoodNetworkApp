import { toast } from 'react-toastify';
import * as types from '../constants/studentTasks';
import { ENDPOINTS } from '~/utils/URL';
import { mockTasks } from '../components/EductionPortal/StudentDashboard/mockData';
import httpService from '../services/httpService';

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
 * Transform a single task to flat format
 * @param {Object} task - The task object
 * @param {Object} subjectData - The subject data containing subject info
 * @param {string} subjectKey - The subject key
 * @returns {Object} Transformed task in flat format
 */
const transformTaskToFlatFormat = (task, subjectData, subjectKey) => {
  return {
    id: task._id,
    course_name: subjectData.subject?.name || subjectKey || 'Unknown Subject',
    subtitle: task.lessonPlan?.title || task.atom?.name || 'No Description',
    task_type: task.type || 'read',
    logged_hours: task.loggedHours || 0,
    suggested_total_hours: task.suggestedTotalHours || 0,
    last_logged_date: task.completedAt || task.assignedAt,
    created_at: task.assignedAt,
    is_completed: task.status === 'completed' || task.status === 'graded',
    has_upload: task.uploadUrls && task.uploadUrls.length > 0,
    has_comments: task.feedback && task.feedback.length > 0,
    status: task.status || 'assigned',
    _id: task._id,
    grade: task.grade,
    feedback: task.feedback,
    dueAt: task.dueAt,
    lessonPlan: task.lessonPlan,
    subject: task.subject,
    atom: task.atom,
    color_level: task.color_level,
    difficulty_level: task.difficulty_level,
    activity_group: task.activity_group,
  };
};

/**
 * Flatten grouped tasks structure to individual tasks array
 * @param {Object} groupedTasks - The grouped tasks from API response
 * @returns {Array} Array of flattened, deduplicated tasks
 */
const flattenGroupedTasks = (groupedTasks) => {
  const allTasks = Object.entries(groupedTasks).flatMap(([subjectKey, subjectData]) =>
    Object.values(subjectData.colorLevels).flatMap(colorLevel =>
      Object.values(colorLevel.activityGroups).flatMap(activityGroup =>
        activityGroup.tasks.map(task => transformTaskToFlatFormat(task, subjectData, subjectKey))
      )
    )
  );

  const taskMap = new Map();
  allTasks.forEach(task => {
    if (!taskMap.has(task._id)) {
      taskMap.set(task._id, task);
    }
  });

  return Array.from(taskMap.values());
};

/**
 * Fetch tasks from the primary API endpoint
 * @returns {Promise<Array>} Array of flattened tasks
 */
const fetchTasksFromPrimaryEndpoint = async () => {
  const response = await httpService.get(ENDPOINTS.STUDENT_TASKS());
  const groupedTasks = response.data.tasks;
  const uniqueTasks = flattenGroupedTasks(groupedTasks);
  return uniqueTasks;
};

/**
 * Handle API error and try fallback options
 * @param {Error} apiError - The API error
 * @param {Function} dispatch - Redux dispatch function
 * @returns {Promise<Array>} Array of tasks (from fallback or mock data)
 */
const handleApiError = async (apiError, dispatch) => {
  if (apiError.response?.status === 404) {
    try {
      const altResponse = await httpService.post(`${ENDPOINTS.APIEndpoint()}/student-tasks`);
      return altResponse.data.tasks || [];
    } catch (altError) {
      // Alternative endpoint failed
    }
  }

  toast.info('Using demo data. Student tasks API is not yet available.');
  return mockTasks;
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

      if (!userId) {
        dispatch(setStudentTasksError('User not authenticated'));
        return;
      }

      try {
        const tasks = await fetchTasksFromPrimaryEndpoint();
        dispatch(setStudentTasks(tasks));
      } catch (apiError) {
        const fallbackTasks = await handleApiError(apiError, dispatch);
        dispatch(setStudentTasks(fallbackTasks));
      }
    } catch (err) {
      dispatch(setStudentTasksError(err.message || 'Failed to fetch student tasks'));
      toast.error('Failed to fetch student tasks. Please try again later.');
    }
  };
};

/**
 * Validate if a task can be marked as completed
 * @param {Object} task - The task to validate
 * @returns {Object} Validation result with valid flag and optional error message
 */
const validateTaskCompletion = (task) => {
  if (task.is_completed) {
    return { valid: false, errorMessage: 'Task is already completed' };
  }

  if (task.task_type !== 'read') {
    return { valid: false, errorMessage: 'Only read tasks can be marked as complete manually' };
  }

  if (task.logged_hours < task.suggested_total_hours) {
    return {
      valid: false,
      errorMessage: `Insufficient hours logged. Required: ${task.suggested_total_hours}, Logged: ${task.logged_hours}`
    };
  }

  return { valid: true };
};

/**
 * Call the mark-complete API endpoint
 * @param {string} taskId - The task ID
 * @param {string} userId - The user ID
 * @returns {Promise<void>}
 */
const callMarkCompleteAPI = async (taskId, userId) => {
  await httpService.post(`${ENDPOINTS.APIEndpoint()}/education-tasks/student/mark-complete`, {
    taskId: taskId,
    studentId: userId,
    requestor: {
      requestorId: userId
    }
  });
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

      const validation = validateTaskCompletion(task);
      if (!validation.valid) {
        if (task.is_completed) {
          toast.warning(validation.errorMessage);
        } else {
          toast.error(validation.errorMessage);
        }
        return;
      }

      try {
        await callMarkCompleteAPI(taskId, state.auth.user.userid);

        dispatch(updateStudentTask(taskId, {
          ...task,
          is_completed: true,
          status: 'completed'
        }));

        toast.success('Task marked as completed successfully!');
      } catch (apiError) {
        const errorMessage = apiError.response?.data?.error || apiError.message || 'Failed to mark task as complete';
        toast.error(`Error: ${errorMessage}`);
      }
    } catch (err) {
      toast.error('Failed to mark task as done. Please try again.');
    }
  };
};
// Aliases for StudentDashboard compatibility
export { fetchStudentTasks as fetchIntermediateTasks };
export { markStudentTaskAsDone as markIntermediateTaskAsDone };
