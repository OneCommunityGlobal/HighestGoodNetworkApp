import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Container, Button } from 'reactstrap';
import { useSelector, useDispatch } from 'react-redux';
import styles from './StudentDashboard.module.css';
import TaskCardView from './TaskCardView';
import TaskListView from './TaskListView';
import NavigationBar from './NavigationBar';
import SummaryCards from './SummaryCards';
import { fetchStudentTasks, markStudentTaskAsDone } from '~/actions/studentTasks';
import { fetchIntermediateTasks, markIntermediateTaskAsDone } from '~/actions/intermediateTasks';

const ACTIVE_STATUSES = ['assigned', 'in_progress'];
const PENDING_STATUSES = ['pending_review', 'submitted'];
const COMPLETED_STATUSES = ['completed', 'graded'];

const FILTER_TABS = [
  { key: 'active', label: 'Active' },
  { key: 'pending', label: 'Pending Review' },
  { key: 'completed', label: 'Completed' },
];

const StudentDashboard = () => {
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'list'
  const [activeFilter, setActiveFilter] = useState('active');
  const [summaryData, setSummaryData] = useState({
    totalTimeLogged: '0h 0min',
    thisWeek: '0h 0min',
    activeCourses: 0,
    logEntries: 0,
  });
  const [intermediateTasks, setIntermediateTasks] = useState({});
  const [expandedTasks, setExpandedTasks] = useState({});

  const dispatch = useDispatch();
  const { taskItems: tasks, fetching: loading, error } = useSelector(state => state.studentTasks);
  const darkMode = useSelector(state => state.theme.darkMode);

  // Derived filtered task list — no unnecessary rendering of graded/completed tasks by default
  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    switch (activeFilter) {
      case 'active':
        return tasks.filter(t => ACTIVE_STATUSES.includes(t.status));
      case 'pending':
        return tasks.filter(t => PENDING_STATUSES.includes(t.status));
      case 'completed':
        return tasks.filter(t => COMPLETED_STATUSES.includes(t.status));
      default:
        return tasks;
    }
  }, [tasks, activeFilter]);

  // Tab counts for display
  const tabCounts = useMemo(() => {
    if (!tasks) return { active: 0, pending: 0, completed: 0 };
    return {
      active: tasks.filter(t => ACTIVE_STATUSES.includes(t.status)).length,
      pending: tasks.filter(t => PENDING_STATUSES.includes(t.status)).length,
      completed: tasks.filter(t => COMPLETED_STATUSES.includes(t.status)).length,
    };
  }, [tasks]);

  // Fetch tasks from API
  useEffect(() => {
    dispatch(fetchStudentTasks());
  }, [dispatch]);

  // Fetch intermediate tasks only for currently visible (filtered) tasks
  useEffect(() => {
    const fetchVisibleIntermediateTasks = async () => {
      if (!filteredTasks || filteredTasks.length === 0) return;

      const intermediateTasksData = { ...intermediateTasks };
      let changed = false;

      for (const task of filteredTasks) {
        if (intermediateTasksData[task.id] !== undefined) continue; // already fetched
        try {
          const subTasks = await dispatch(fetchIntermediateTasks(task.id));
          intermediateTasksData[task.id] = subTasks || [];
          changed = true;
        } catch (err) {
          intermediateTasksData[task.id] = [];
          changed = true;
        }
      }

      if (changed) setIntermediateTasks(intermediateTasksData);
    };

    fetchVisibleIntermediateTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredTasks, dispatch]);

  // Calculate summary data when tasks change (uses ALL tasks for accurate totals)
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      calculateSummaryData(tasks);
    }
  }, [tasks]);

  // Calculate summary data from tasks
  const calculateSummaryData = tasksData => {
    const formatTime = hrs => {
      const wholeHours = Math.floor(hrs);
      const minutes = Math.round((hrs - wholeHours) * 60);
      return `${wholeHours}h ${minutes}min`;
    };

    const totalHours = tasksData.reduce((sum, task) => sum + (task.logged_hours || 0), 0);
    const thisWeekHours = tasksData.reduce((sum, task) => {
      const taskDate = new Date(task.last_logged_date || task.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return taskDate >= weekAgo ? sum + (task.logged_hours || 0) : sum;
    }, 0);

    const activeCourses = new Set(tasksData.map(task => task.course_id || task.course_name)).size;
    const logEntries = tasksData.filter(task => task.logged_hours > 0).length;

    setSummaryData({
      totalTimeLogged: formatTime(totalHours),
      thisWeek: formatTime(thisWeekHours),
      activeCourses,
      logEntries,
    });
  };

  // Handle mark as done
  const handleMarkAsDone = useCallback(
    taskId => {
      dispatch(markStudentTaskAsDone(taskId));
    },
    [dispatch],
  );

  // Handle mark intermediate task as done
  const handleMarkIntermediateAsDone = useCallback(
    async (intermediateTaskId, parentTaskId) => {
      try {
        await dispatch(markIntermediateTaskAsDone(intermediateTaskId));
        const subTasks = await dispatch(fetchIntermediateTasks(parentTaskId));
        setIntermediateTasks(prev => ({ ...prev, [parentTaskId]: subTasks || [] }));
      } catch (_err) {
        // Error is handled in the action
      }
    },
    [dispatch],
  );

  // Toggle expand/collapse intermediate tasks
  const toggleIntermediateTasks = useCallback(taskId => {
    setExpandedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (error && error !== 'none') {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>{error}</p>
        <Button color="primary" onClick={() => dispatch(fetchStudentTasks())}>
          Retry
        </Button>
      </div>
    );
  }

  const emptyMessages = {
    active: 'No active tasks right now.',
    pending: 'No tasks pending review.',
    completed: 'No completed tasks yet.',
  };

  return (
    <div className={styles.dashboard}>
      <NavigationBar darkMode={darkMode} />

      <Container className={styles.mainContainer}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerText}>
              <h1 className={styles.title}>Student Dashboard</h1>
              <p className={styles.subtitle}>Track your learning progress and manage your logs</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <SummaryCards data={summaryData} darkMode={darkMode} />

        {/* Tasks Section */}
        <div className={styles.timeLogsSection}>
          {/* Section header row */}
          <div className={styles.sectionHeader}>
            {/* Filter tabs */}
            <div className={styles.filterTabs} role="tablist">
              {FILTER_TABS.map(tab => (
                <button
                  key={tab.key}
                  role="tab"
                  aria-selected={activeFilter === tab.key}
                  className={`${styles.filterTab} ${
                    activeFilter === tab.key ? styles.filterTabActive : ''
                  }`}
                  onClick={() => setActiveFilter(tab.key)}
                >
                  {tab.label}
                  <span className={styles.filterCount}>{tabCounts[tab.key]}</span>
                </button>
              ))}
            </div>

            {/* View toggle */}
            <div className={styles.viewToggle}>
              <button
                className={`${styles.toggleButton} ${viewMode === 'card' ? styles.active : ''}`}
                onClick={() => setViewMode('card')}
                aria-label="Card view"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              </button>
              <button
                className={`${styles.toggleButton} ${viewMode === 'list' ? styles.active : ''}`}
                onClick={() => setViewMode('list')}
                aria-label="List view"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Task Views */}
          {filteredTasks.length === 0 ? (
            <div className={styles.emptyState}>
              <p>{emptyMessages[activeFilter]}</p>
            </div>
          ) : viewMode === 'card' ? (
            <TaskCardView
              tasks={filteredTasks}
              onMarkAsDone={handleMarkAsDone}
              intermediateTasks={intermediateTasks}
              expandedTasks={expandedTasks}
              onToggleIntermediateTasks={toggleIntermediateTasks}
              onMarkIntermediateAsDone={handleMarkIntermediateAsDone}
              darkMode={darkMode}
            />
          ) : (
            <TaskListView
              tasks={filteredTasks}
              onMarkAsDone={handleMarkAsDone}
              intermediateTasks={intermediateTasks}
              expandedTasks={expandedTasks}
              onToggleIntermediateTasks={toggleIntermediateTasks}
              onMarkIntermediateAsDone={handleMarkIntermediateAsDone}
              darkMode={darkMode}
            />
          )}
        </div>
      </Container>
    </div>
  );
};

export default StudentDashboard;
