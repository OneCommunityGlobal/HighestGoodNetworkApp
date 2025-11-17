import React, { useState, useEffect } from 'react';
import { Container, Button } from 'reactstrap';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import styles from './IntermediateTaskList.module.css';
import IntermediateTaskForm from './IntermediateTaskForm';
import {
  fetchIntermediateTasks,
  createIntermediateTask,
  updateIntermediateTask,
  deleteIntermediateTask,
  markIntermediateTaskAsDone,
} from '~/actions/intermediateTasks';
import { fetchStudentTasks } from '~/actions/studentTasks';

const IntermediateTaskList = () => {
  const dispatch = useDispatch();
  const authUser = useSelector(state => state.auth.user);
  const { taskItems: parentTasks } = useSelector(state => state.studentTasks);

  const [expandedTasks, setExpandedTasks] = useState({});
  const [intermediateTasks, setIntermediateTasks] = useState({});
  const [loadingTasks, setLoadingTasks] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedParentTaskId, setSelectedParentTaskId] = useState(null);
  const [isEducator, setIsEducator] = useState(false);

  // Check if user is educator (you may need to adjust this based on your role system)
  useEffect(() => {
    // Check user role - adjust based on your role system
    const userRole = authUser?.role;
    setIsEducator(userRole === 'Administrator' || userRole === 'Owner' || userRole === 'Manager');
  }, [authUser]);

  // Fetch parent tasks on mount
  useEffect(() => {
    dispatch(fetchStudentTasks());
  }, [dispatch]);

  // Toggle expand/collapse for a task
  const toggleTask = async taskId => {
    const isExpanded = expandedTasks[taskId];

    if (!isExpanded && !intermediateTasks[taskId]) {
      // Fetch intermediate tasks when expanding
      setLoadingTasks(prev => ({ ...prev, [taskId]: true }));
      try {
        const tasks = await dispatch(fetchIntermediateTasks(taskId));
        setIntermediateTasks(prev => ({ ...prev, [taskId]: tasks || [] }));
      } catch (error) {
        console.error('Error fetching intermediate tasks:', error);
      } finally {
        setLoadingTasks(prev => ({ ...prev, [taskId]: false }));
      }
    }

    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !isExpanded,
    }));
  };

  // Handle add intermediate task
  const handleAddTask = parentTaskId => {
    setSelectedParentTaskId(parentTaskId);
    setEditingTask(null);
    setShowForm(true);
  };

  // Handle edit intermediate task
  const handleEditTask = (task, parentTaskId) => {
    setSelectedParentTaskId(parentTaskId);
    // Ensure task has id field for consistency
    const taskWithId = { ...task, id: task.id || task._id };
    setEditingTask(taskWithId);
    setShowForm(true);
  };

  // Handle delete intermediate task
  const handleDeleteTask = async (task, parentTaskId) => {
    if (window.confirm('Are you sure you want to delete this sub-task?')) {
      try {
        const taskId = task.id || task._id;
        await dispatch(deleteIntermediateTask(taskId));
        // Refresh intermediate tasks for the parent
        const tasks = await dispatch(fetchIntermediateTasks(parentTaskId));
        setIntermediateTasks(prev => ({ ...prev, [parentTaskId]: tasks || [] }));
      } catch (error) {
        // Error is handled in the action
      }
    }
  };

  // Handle mark as done (for students)
  const handleMarkAsDone = async (task, parentTaskId) => {
    try {
      const taskId = task.id || task._id;
      await dispatch(markIntermediateTaskAsDone(taskId));
      // Refresh intermediate tasks for the parent
      const tasks = await dispatch(fetchIntermediateTasks(parentTaskId));
      setIntermediateTasks(prev => ({ ...prev, [parentTaskId]: tasks || [] }));
    } catch (error) {
      // Error is handled in the action
    }
  };

  // Handle form submit
  const handleFormSubmit = async formData => {
    try {
      if (editingTask) {
        const taskId = editingTask.id || editingTask._id;
        await dispatch(
          updateIntermediateTask(taskId, {
            ...formData,
            parentTaskId: selectedParentTaskId,
          }),
        );
      } else {
        await dispatch(
          createIntermediateTask({
            ...formData,
            parentTaskId: selectedParentTaskId,
          }),
        );
      }

      // Refresh intermediate tasks for the parent
      const tasks = await dispatch(fetchIntermediateTasks(selectedParentTaskId));
      setIntermediateTasks(prev => ({ ...prev, [selectedParentTaskId]: tasks || [] }));

      setShowForm(false);
      setEditingTask(null);
      setSelectedParentTaskId(null);
    } catch (error) {
      // Error is handled in the action
    }
  };

  // Calculate progress for a parent task based on intermediate tasks
  const calculateProgress = parentTaskId => {
    const tasks = intermediateTasks[parentTaskId] || [];
    if (tasks.length === 0) return 0;
    const completedCount = tasks.filter(t => t.status === 'completed').length;
    return Math.round((completedCount / tasks.length) * 100);
  };

  return (
    <div className={styles.dashboard}>
      <Container className={styles.mainContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>Intermediate Tasks</h1>
          <p className={styles.subtitle}>Manage sub-tasks for main tasks</p>
        </div>

        {showForm && (
          <IntermediateTaskForm
            task={editingTask}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingTask(null);
              setSelectedParentTaskId(null);
            }}
          />
        )}

        <div className={styles.tasksSection}>
          {!parentTasks || parentTasks.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No tasks found. Tasks will appear here once assigned.</p>
            </div>
          ) : (
            parentTasks.map(parentTask => {
              const isExpanded = expandedTasks[parentTask.id];
              const subTasks = intermediateTasks[parentTask.id] || [];
              const isLoading = loadingTasks[parentTask.id];
              const progress = calculateProgress(parentTask.id);

              return (
                <div key={parentTask.id} className={styles.taskCard}>
                  <div className={styles.taskHeader}>
                    <div className={styles.taskHeaderContent}>
                      <h3 className={styles.taskTitle}>
                        {parentTask.course_name || parentTask.title}
                      </h3>
                      {parentTask.subtitle && (
                        <p className={styles.taskSubtitle}>{parentTask.subtitle}</p>
                      )}
                      <div className={styles.taskMeta}>
                        <span className={styles.taskStatus}>
                          Status: {parentTask.status || 'assigned'}
                        </span>
                        {subTasks.length > 0 && (
                          <span className={styles.progressInfo}>
                            Progress: {progress}% (
                            {subTasks.filter(t => t.status === 'completed').length}/
                            {subTasks.length} completed)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={styles.taskActions}>
                      {isEducator && (
                        <Button
                          color="primary"
                          size="sm"
                          onClick={() => handleAddTask(parentTask.id)}
                          className={styles.addButton}
                        >
                          Add Intermediate Task
                        </Button>
                      )}
                      <button
                        className={`${styles.expandButton} ${isExpanded ? styles.expanded : ''}`}
                        onClick={() => toggleTask(parentTask.id)}
                        aria-label={isExpanded ? 'Collapse' : 'Expand'}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className={styles.subTasksContainer}>
                      {isLoading ? (
                        <div className={styles.loadingState}>
                          <div className={styles.spinner}></div>
                          <p>Loading sub-tasks...</p>
                        </div>
                      ) : subTasks.length === 0 ? (
                        <div className={styles.emptySubTasks}>
                          <p>
                            No sub-tasks found.{' '}
                            {isEducator && 'Click "Add Intermediate Task" to create one.'}
                          </p>
                        </div>
                      ) : (
                        <div className={styles.subTasksList}>
                          {subTasks.map(subTask => (
                            <div key={subTask.id || subTask._id} className={styles.subTaskItem}>
                              <div className={styles.subTaskContent}>
                                <h4 className={styles.subTaskTitle}>{subTask.title}</h4>
                                {subTask.description && (
                                  <p className={styles.subTaskDescription}>{subTask.description}</p>
                                )}
                                <div className={styles.subTaskMeta}>
                                  <span className={styles.subTaskHours}>
                                    Expected: {subTask.expected_hours || 0}h
                                  </span>
                                  {subTask.due_date && (
                                    <span className={styles.subTaskDueDate}>
                                      Due: {new Date(subTask.due_date).toLocaleDateString()}
                                    </span>
                                  )}
                                  <span
                                    className={`${styles.subTaskStatus} ${
                                      styles[`status${subTask.status}`]
                                    }`}
                                  >
                                    {subTask.status || 'pending'}
                                  </span>
                                </div>
                              </div>
                              <div className={styles.subTaskActions}>
                                {isEducator && (
                                  <>
                                    <button
                                      className={styles.editButton}
                                      onClick={() => handleEditTask(subTask, parentTask.id)}
                                      title="Edit"
                                    >
                                      <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                      >
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                      </svg>
                                    </button>
                                    <button
                                      className={styles.deleteButton}
                                      onClick={() => handleDeleteTask(subTask, parentTask.id)}
                                      title="Delete"
                                    >
                                      <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                      >
                                        <polyline points="3 6 5 6 21 6" />
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                      </svg>
                                    </button>
                                  </>
                                )}
                                {!isEducator && subTask.status !== 'completed' && (
                                  <button
                                    className={styles.markDoneButton}
                                    onClick={() => handleMarkAsDone(subTask, parentTask.id)}
                                    title="Mark as Done"
                                  >
                                    Mark as Done
                                  </button>
                                )}
                                {!isEducator && subTask.status === 'completed' && (
                                  <span className={styles.completedBadge}>Completed</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </Container>
    </div>
  );
};

export default IntermediateTaskList;
