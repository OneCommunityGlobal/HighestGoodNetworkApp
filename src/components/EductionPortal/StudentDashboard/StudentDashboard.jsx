import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'reactstrap';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import styles from './StudentDashboard.module.css';
import TaskCardView from './TaskCardView';
import TaskListView from './TaskListView';
import NavigationBar from './NavigationBar';
import SummaryCards from './SummaryCards';
import TaskTimer from './TaskTimer';
import { fetchStudentTasks, markStudentTaskAsDone } from '~/actions/studentTasks';
import { fetchIntermediateTasks, markIntermediateTaskAsDone } from '~/actions/intermediateTasks';

const StudentDashboard = () => {
  const [viewMode, setViewMode] = useState('card');
  const [summaryData, setSummaryData] = useState({
    totalTimeLogged: '0h 0min',
    thisWeek: '0h 0min',
    activeCourses: 0,
    logEntries: 0,
  });
  const [intermediateTasks, setIntermediateTasks] = useState({});
  const [expandedTasks, setExpandedTasks] = useState({});

  const dispatch = useDispatch();
  const authUser = useSelector(state => state.auth.user);
  const { taskItems: tasks, fetching: loading, error } = useSelector(state => state.studentTasks);
  const darkMode = useSelector(state => state.theme.darkMode);

  useEffect(() => {
    dispatch(fetchStudentTasks());
  }, [dispatch]);

  useEffect(() => {
    const fetchAllIntermediateTasks = async () => {
      if (tasks && tasks.length > 0) {
        const intermediateTasksData = {};

        for (const task of tasks) {
          try {
            const subTasks = await dispatch(fetchIntermediateTasks(task.id));
            if (subTasks && subTasks.length > 0) {
              intermediateTasksData[task.id] = subTasks;
            }
          } catch (error) {}
        }

        setIntermediateTasks(intermediateTasksData);
      }
    };

    fetchAllIntermediateTasks();
  }, [tasks, dispatch]);

  useEffect(() => {
    if (tasks && tasks.length > 0) {
      calculateSummaryData(tasks);
    }
  }, [tasks]);

  const calculateSummaryData = tasksData => {
    const totalHours = tasksData.reduce((sum, task) => sum + (task.logged_hours || 0), 0);
    const thisWeekHours = tasksData.reduce((sum, task) => {
      const taskDate = new Date(task.last_logged_date || task.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      if (taskDate >= weekAgo) {
        return sum + (task.logged_hours || 0);
      }
      return sum;
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

  const formatTime = hours => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}min`;
  };

  const handleMarkAsDone = async taskId => {
    dispatch(markStudentTaskAsDone(taskId));
  };

  const handleMarkIntermediateAsDone = async (intermediateTaskId, parentTaskId) => {
    try {
      await dispatch(markIntermediateTaskAsDone(intermediateTaskId));
      const updatedTasks = await dispatch(fetchIntermediateTasks(parentTaskId));
      setIntermediateTasks(prev => ({
        ...prev,
        [parentTaskId]: updatedTasks || [],
      }));
    } catch (error) {}
  };

  const toggleIntermediateTasks = async taskId => {
    const isExpanded = expandedTasks[taskId];
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !isExpanded,
    }));
  };

  if (loading) {
    return (
      <div className={`${styles.loadingContainer} ${darkMode ? styles.dark : ''}`}>
        <div className={styles.spinner}></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (error && error !== 'none') {
    return (
      <div className={`${styles.errorContainer} ${darkMode ? styles.dark : ''}`}>
        <p className={styles.errorMessage}>{error}</p>
        <Button color="primary" onClick={() => dispatch(fetchStudentTasks())}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className={`${styles.dashboard} ${darkMode ? styles.dark : ''}`}>
      <NavigationBar darkMode={darkMode} />

      <Container className={styles.mainContainer}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>Student Dashboard</h1>
            <p className={styles.subtitle}>Track your learning progress and manage your logs</p>
          </div>
          <div className={styles.headerRight}>
            <TaskTimer userid={authUser?.userid} />
          </div>
        </div>

        <SummaryCards data={summaryData} darkMode={darkMode} />

        <div className={styles.timeLogsSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Time Logs</h2>
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

          {viewMode === 'card' ? (
            <TaskCardView
              tasks={tasks}
              onMarkAsDone={handleMarkAsDone}
              intermediateTasks={intermediateTasks}
              expandedTasks={expandedTasks}
              onToggleIntermediateTasks={toggleIntermediateTasks}
              onMarkIntermediateAsDone={handleMarkIntermediateAsDone}
              darkMode={darkMode}
            />
          ) : (
            <TaskListView
              tasks={tasks}
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
