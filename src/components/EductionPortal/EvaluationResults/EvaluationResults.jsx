import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Container, Alert } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faBell,
  faEye,
  faGraduationCap,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';

import styles from './EvaluationResults.module.css';
import EvaluationNotificationService from './evaluationNotificationService';
import { mockEvaluationData } from './mockData_new';

const EvaluationResults = ({ auth }) => {
  const [evaluationData, setEvaluationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    // Load evaluation data immediately since we're using mock data
    const loadEvaluationData = () => {
      try {
        // Personalize the evaluation data with actual user name
        const userName = auth?.user?.firstName || 'Student';
        const userLastName = auth?.user?.lastName || '';
        const fullName = `${userName} ${userLastName}`.trim();
        const userEmail = auth?.user?.email || 'student@school.edu';

        const personalizedData = {
          ...mockEvaluationData,
          student: {
            ...mockEvaluationData.student,
            name: fullName,
            email: userEmail,
          },
          teacherFeedback: {
            ...mockEvaluationData.teacherFeedback,
            overall: mockEvaluationData.teacherFeedback.overall.replace('Alex', userName),
          },
          tasks: mockEvaluationData.tasks.map(task => ({
            ...task,
            teamMembers: task.teamMembers
              ? task.teamMembers.map(member => (member === 'Alex Johnson' ? fullName : member))
              : task.teamMembers,
          })),
        };

        setEvaluationData(personalizedData);

        // Trigger notification for new results (simulate this is new data)
        if (auth?.user?.userid && mockEvaluationData) {
          EvaluationNotificationService.showPerformanceNotification(
            mockEvaluationData.student.overallScore,
            auth.user.firstName || 'Student',
          );

          // Mark results as viewed when user opens the page
          EvaluationNotificationService.markResultsAsViewed(
            auth.user.userid,
            mockEvaluationData.student.id,
          );
        }
      } catch (error) {
        // Set fallback data to prevent infinite loading
        setEvaluationData(mockEvaluationData);
      } finally {
        // Ensure loading is always set to false
        setLoading(false);
      }
    };

    loadEvaluationData();
  }, [auth]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>
          <FontAwesomeIcon icon={faGraduationCap} className={styles.loadingIcon} />
          <h3>Loading Your Academic Performance...</h3>
          <div className={styles.loadingBar}>
            <div className={styles.loadingProgress}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!evaluationData) {
    return (
      <Container className={styles.container}>
        <Alert color="warning" className={styles.noDataAlert}>
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          No evaluation results available at this time.
        </Alert>
      </Container>
    );
  }

  const { student, overallScore, categories, tasks, summary } = evaluationData;

  // Calculate total score for new design (77/100 format)
  const totalEarnedPoints = categories.reduce((sum, cat) => sum + cat.earnedMarks, 0);
  const totalPossiblePoints = categories.reduce((sum, cat) => sum + cat.totalMarks, 0);
  const percentageScore = Math.round((totalEarnedPoints / totalPossiblePoints) * 100);

  // Helper functions
  const getPerformanceColor = percentage => {
    if (percentage >= 80) return 'excellent';
    if (percentage >= 70) return 'good';
    if (percentage >= 60) return 'fair';
    return 'poor';
  };

  const getStatusClass = status => {
    if (status === 'On time' || status === 'completed') return 'onTime';
    if (status?.toLowerCase().includes('late')) return 'late';
    return 'onTime';
  };

  const getPerformanceColorClass = percentage => {
    if (percentage >= 80) return styles.excellent;
    if (percentage >= 70) return styles.good;
    if (percentage >= 60) return styles.fair;
    return styles.poor;
  };

  return (
    <div className={styles.evaluationResultsPage}>
      {/* New Clean Header */}
      <div className={styles.headerSection}>
        <Container>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <h1 className={styles.pageTitle}>Evaluation Results</h1>
              <p className={styles.pageSubtitle}>
                Comprehensive overview of your grades, performance on assignments, and detailed
                feedback from teachers
              </p>
            </div>
            <div className={styles.headerRight}>
              <div className={styles.userWelcome}>
                <FontAwesomeIcon icon={faUser} className={styles.userIcon} />
                <span>Welcome, {auth?.user?.firstName || 'Student Name'}</span>
              </div>
              <FontAwesomeIcon icon={faBell} className={styles.notificationIcon} />
            </div>
          </div>
        </Container>
      </div>

      <Container className={styles.mainContent}>
        {/* Overall Performance Summary */}
        <div className={styles.overallSection}>
          <div className={styles.sectionHeader}>
            <h3>Overall Performance Summary</h3>
            <div className={styles.overallScore}>
              <span className={styles.scoreText}>{percentageScore}%</span>
              <span className={styles.scoreLabel}>Overall Grade</span>
            </div>
          </div>
          <div className={styles.progressSection}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${percentageScore}%` }}></div>
            </div>
            <div className={styles.scoreDetails}>
              <span>
                Total Score: {totalEarnedPoints}/{totalPossiblePoints} points
              </span>
            </div>
          </div>
        </div>

        {/* Category Performance Table */}
        <div className={styles.categorySection}>
          <h3 className={styles.sectionTitle}>Overall Performance Summary</h3>
          <div className={styles.tableContainer}>
            <table className={styles.performanceTable}>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Weightage</th>
                  <th>Items</th>
                  <th>Total Points</th>
                  <th>Your Score</th>
                  <th>Percentage</th>
                  <th>Performance</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(category => (
                  <tr key={category.id}>
                    <td className={styles.categoryName}>{category.name}</td>
                    <td>{category.weightage}%</td>
                    <td>{category.completedItems}</td>
                    <td>{category.totalMarks}</td>
                    <td>{category.earnedMarks}</td>
                    <td>{Math.round(category.percentage)}%</td>
                    <td>
                      <div className={styles.performanceBar}>
                        <div
                          className={`${styles.performanceFill} ${
                            styles[getPerformanceColor(category.percentage)]
                          }`}
                          style={{ width: `${category.percentage}%` }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Performance Insights */}
        <div className={styles.insightsSection}>
          <div className={styles.insightsBox}>
            <h4>Performance Insights</h4>
            <p>
              You performed strongly in <strong>Assignments (80%)</strong>,{' '}
              <strong>Exams (80%)</strong>, and <strong>Participation (80%)</strong>. You may
              improve your performance in <strong>Quizzes (60%)</strong> - consider reviewing quiz
              preparation strategies.
            </p>
            <div className={styles.actionButtons}>
              <button className={styles.actionButton}>Review Quiz Messages</button>
              <button className={styles.actionButton}>Study Schedule Tips</button>
            </div>
          </div>
        </div>

        {/* Individual Assignment & Task Results */}
        <div className={styles.assignmentSection}>
          <h3 className={styles.sectionTitle}>Individual Assignment & Task Results</h3>
          <div className={styles.tableContainer}>
            <table className={styles.assignmentTable}>
              <thead>
                <tr>
                  <th>Assignment Name</th>
                  <th>Weightage</th>
                  <th>Your Marks</th>
                  <th>Percentage</th>
                  <th>Status</th>
                  <th>Feedback</th>
                </tr>
              </thead>
              <tbody>
                {tasks.slice(0, 6).map(task => (
                  <tr key={task.id}>
                    <td>
                      <div className={styles.assignmentInfo}>
                        <div className={styles.assignmentName}>{task.name}</div>
                        <div className={styles.assignmentDate}>
                          Submitted: {new Date(task.submissionDate).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td>{task.weightage || '8'}%</td>
                    <td>
                      {task.earnedMarks}/{task.totalMarks}
                    </td>
                    <td>
                      <span className={getPerformanceColorClass(task.percentage)}>
                        {Math.round(task.percentage)}%
                      </span>
                    </td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${styles[getStatusClass(task.status)]}`}
                      >
                        {task.status || 'On time'}
                      </span>
                    </td>
                    <td>
                      <button className={styles.feedbackButton}>
                        <FontAwesomeIcon icon={faEye} className={styles.buttonIcon} />
                        View Feedback
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Cards */}
        <div className={styles.summaryCards}>
          <div className={styles.summaryCard}>
            <div className={`${styles.cardNumber} ${styles.total}`}>6</div>
            <div className={styles.cardLabel}>Total Assignments</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={`${styles.cardNumber} ${styles.onTime}`}>5</div>
            <div className={styles.cardLabel}>On Time</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={`${styles.cardNumber} ${styles.late}`}>1</div>
            <div className={styles.cardLabel}>Late Submissions</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={`${styles.cardNumber} ${styles.average}`}>72%</div>
            <div className={styles.cardLabel}>Avg Score</div>
          </div>
        </div>
      </Container>
    </div>
  );
};

const mapStateToProps = state => ({
  auth: state.auth,
});

export default connect(mapStateToProps)(EvaluationResults);
