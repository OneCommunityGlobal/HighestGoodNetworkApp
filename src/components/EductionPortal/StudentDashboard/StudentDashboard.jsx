import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'reactstrap';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import styles from './StudentDashboard.module.css';
import TaskCardView from './TaskCardView';
import TaskListView from './TaskListView';
import NavigationBar from './NavigationBar';
import SummaryCards from './SummaryCards';
import { fetchStudentTasks, markStudentTaskAsDone } from '~/actions/studentTasks';

const StudentDashboard = () => {
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'list'
  const [summaryData, setSummaryData] = useState({
    totalTimeLogged: '0h 0min',
    thisWeek: '0h 0min',
    activeCourses: 0,
    logEntries: 0,
  });

  const dispatch = useDispatch();
  const authUser = useSelector(state => state.auth.user);
  const { taskItems: tasks, fetching: loading, error } = useSelector(state => state.studentTasks);

  // Fetch tasks from API
  useEffect(() => {
    dispatch(fetchStudentTasks());
  }, [dispatch]);

  // Calculate summary data when tasks change
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      calculateSummaryData(tasks);
    }
  }, [tasks]);

  // Calculate summary data from tasks
  const calculateSummaryData = tasksData => {
    const totalHours = tasksData.reduce((sum, task) => sum + (task.logged_hours || 0), 0);
    const thisWeekHours = tasksData.reduce((sum, task) => {
      // Check if task was logged this week (simplified logic)
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

  // Format time in hours and minutes
  const formatTime = hours => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}min`;
  };

  // Handle mark as done
  const handleMarkAsDone = async taskId => {
    dispatch(markStudentTaskAsDone(taskId));
  };

  // Toggle view mode
  const toggleViewMode = () => {
    setViewMode(prev => (prev === 'card' ? 'list' : 'card'));
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
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

  return (
    <div className={styles.dashboard}>
      <NavigationBar />

      <Container className={styles.mainContainer}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Student Dashboard</h1>
          <p className={styles.subtitle}>Track your learning progress and manage your logs</p>
        </div>

        {/* Summary Cards */}
        <SummaryCards data={summaryData} />

        {/* Recent Time Logs Section */}
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

          {/* Task Views */}
          {viewMode === 'card' ? (
            <TaskCardView tasks={tasks} onMarkAsDone={handleMarkAsDone} />
          ) : (
            <TaskListView tasks={tasks} onMarkAsDone={handleMarkAsDone} />
          )}
        </div>
      </Container>
    </div>
  );
};

export default StudentDashboard;
