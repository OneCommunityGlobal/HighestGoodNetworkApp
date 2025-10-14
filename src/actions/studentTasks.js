import axios from 'axios';
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
 * Fetch all student tasks for the logged-in user
 */
export const fetchStudentTasks = () => {
  return async (dispatch, getState) => {
    dispatch(setStudentTasksStart());
    try {
      const state = getState();
      const userId = state.auth.user.userid;

      if (!userId) {
        console.error('No user ID found in auth state');
        dispatch(setStudentTasksError('User not authenticated'));
        return;
      }

      try {
        // Try to use the student tasks endpoint
        console.log('Making API call to:', ENDPOINTS.STUDENT_TASKS());

        const response = await httpService.get(ENDPOINTS.STUDENT_TASKS());

        console.log('API response:', response.data);

        // The API returns grouped tasks, we need to flatten them for our UI
        const groupedTasks = response.data.tasks;
        const taskMap = new Map(); // Use Map to deduplicate tasks by _id

        // Flatten the grouped structure to get individual tasks
        Object.entries(groupedTasks).forEach(([subjectKey, subjectData]) => {
          Object.values(subjectData.colorLevels).forEach(colorLevel => {
            Object.values(colorLevel.activityGroups).forEach(activityGroup => {
              activityGroup.tasks.forEach(task => {
                // Only add task if it hasn't been seen before (deduplication)
                if (!taskMap.has(task._id)) {
                  taskMap.set(task._id, {
                    id: task._id, // Use _id as the primary id for React keys
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
                  });
                }
              });
            });
          });
        });

        // Convert Map values to array and add final deduplication as safety measure
        const flattenedTasks = Array.from(taskMap.values());

        // Final deduplication by _id as a safety measure
        const uniqueTasks = flattenedTasks.filter((task, index, self) =>
          index === self.findIndex(t => t._id === task._id)
        );

        console.log(`Processed ${uniqueTasks.length} unique tasks from API response (${flattenedTasks.length} before final deduplication)`);
        dispatch(setStudentTasks(uniqueTasks));
      } catch (apiError) {
        // If API is not available, use mock data
        console.error('Student tasks API error:', apiError);
        console.error('Error response:', apiError.response?.data);
        console.error('Error status:', apiError.response?.status);
        console.error('Error config:', apiError.config);

        // Try alternative endpoint if the first one fails
        if (apiError.response?.status === 404) {
          console.log('Trying alternative endpoint...');
          try {
            const altResponse = await httpService.post(`${ENDPOINTS.APIEndpoint()}/student-tasks`);
            console.log('Alternative endpoint response:', altResponse.data);
            dispatch(setStudentTasks(altResponse.data.tasks || []));
            return;
          } catch (altError) {
            console.error('Alternative endpoint also failed:', altError);
          }
        }

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

      // Validate task can be marked as done
      if (task.is_completed) {
        toast.warning('Task is already completed');
        return;
      }

      // Only read tasks can be marked as complete manually
      if (task.task_type !== 'read') {
        toast.error('Only read tasks can be marked as complete manually');
        return;
      }

      // Check if logged hours meet the requirement
      if (task.logged_hours < task.suggested_total_hours) {
        toast.error(`Insufficient hours logged. Required: ${task.suggested_total_hours}, Logged: ${task.logged_hours}`);
        return;
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
        // Call the student mark-complete API endpoint
        await httpService.post(`${ENDPOINTS.APIEndpoint()}/education-tasks/student/mark-complete`, {
          taskId: taskId,
          studentId: state.auth.user.userid,
          requestor: {
            requestorId: state.auth.user.userid
          }
        });

        // Only update local state if API call succeeds
        dispatch(updateStudentTask(taskId, {
          ...task,
          is_completed: true,
          status: 'completed'
        }));

        toast.success('Task marked as completed successfully!');
      } catch (apiError) {
        // Show error toast if API fails
        console.error('Student task mark complete API error:', apiError);
        console.error('API Error:', apiError.response?.data || apiError.message);

        const errorMessage = apiError.response?.data?.error || apiError.message || 'Failed to mark task as complete';
        toast.error(`Error: ${errorMessage}`);
      }
    } catch (err) {
      console.error('Error marking task as done:', err);
      toast.error('Failed to mark task as done. Please try again.');
    }
  };
};
