import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Container, Alert, Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faBell,
  faEye,
  faGraduationCap,
  faExclamationTriangle,
  faTimes,
  faCalendarAlt,
  faPercent,
  faAward,
} from '@fortawesome/free-solid-svg-icons';

import styles from './EvaluationResults.module.css';
import SideBar from '../SideBar/SideBar';
import { useSidebar } from '../SidebarContext';
import EvaluationNotificationService from './evaluationNotificationService';
import { mockEvaluationData } from './mockData_new';

const EvaluationResults = ({ auth }) => {
  const { isMinimized } = useSidebar();
  const [evaluationData, setEvaluationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    task: null,
  });

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

  // Generate dynamic performance insights based on actual data
  const getPerformanceInsights = () => {
    const strongAreas = categories.filter(cat => cat.percentage >= 80);
    const improvementAreas = categories.filter(cat => cat.percentage < 70);

    const strongText =
      strongAreas.length > 0
        ? strongAreas
            .slice(0, 3)
            .map(cat => `${cat.name} (${Math.round(cat.percentage)}%)`)
            .join(', ')
        : 'various areas';

    const improvementText =
      improvementAreas.length > 0 && improvementAreas[0]
        ? `${improvementAreas[0].name} (${Math.round(improvementAreas[0].percentage)}%)`
        : 'certain areas';

    return { strongText, improvementText, hasImprovementAreas: improvementAreas.length > 0 };
  };

  const { strongText, improvementText, hasImprovementAreas } = getPerformanceInsights();

  // Calculate summary statistics dynamically
  const calculateSummaryStats = () => {
    const totalAssignments = tasks.length;
    const onTimeCount = tasks.filter(
      task => task.status === 'On time' || task.status === 'completed',
    ).length;
    const lateCount = tasks.filter(task => task.status?.toLowerCase().includes('late')).length;
    const averageScore = Math.round(
      tasks.reduce((sum, task) => sum + task.percentage, 0) / tasks.length,
    );

    return { totalAssignments, onTimeCount, lateCount, averageScore };
  };

  const { totalAssignments, onTimeCount, lateCount, averageScore } = calculateSummaryStats();

  const openFeedbackModal = task => {
    setFeedbackModal({ isOpen: true, task });
  };

  const closeFeedbackModal = () => {
    setFeedbackModal({ isOpen: false, task: null });
  };

  return (
    <>
      <SideBar />
      <div className={styles.evaluationResultsPage} data-sidebar-minimized={isMinimized}>
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
                You performed strongly in <strong>{strongText}</strong>.
                {hasImprovementAreas && (
                  <>
                    {' '}
                    You may improve your performance in <strong>{improvementText}</strong> -
                    consider reviewing preparation strategies.
                  </>
                )}
              </p>
              <div className={styles.actionButtons}>
                <button className={styles.actionButton}>Review Assignment Messages</button>
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
                        <button
                          className={styles.feedbackButton}
                          onClick={() => openFeedbackModal(task)}
                        >
                          <FontAwesomeIcon icon={faEye} className={styles.buttonIcon} />
                          View Feedback
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards (shown on small screens) */}
            <div className={styles.mobileAssignments}>
              {tasks.slice(0, 6).map(task => (
                <div className={styles.assignmentCard} key={task.id}>
                  <div className={styles.cardHeader}>
                    <div className={styles.assignmentName}>{task.name}</div>
                    <span
                      className={`${styles.statusBadge} ${styles[getStatusClass(task.status)]}`}
                    >
                      {task.status || 'On time'}
                    </span>
                  </div>
                  <div className={styles.cardMeta}>
                    <div className={styles.cardMetaItem}>
                      <strong>Weightage:</strong> {task.weightage || '8'}%
                    </div>
                    <div className={styles.cardMetaItem}>
                      <strong>Score:</strong> {task.earnedMarks}/{task.totalMarks}
                      <span className={getPerformanceColorClass(task.percentage)}>
                        {' '}
                        ({Math.round(task.percentage)}%)
                      </span>
                    </div>
                    <div className={styles.cardMetaItem}>
                      <strong>Submitted:</strong>{' '}
                      {new Date(task.submissionDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className={styles.cardActions}>
                    <button
                      className={styles.feedbackButton}
                      onClick={() => openFeedbackModal(task)}
                    >
                      <FontAwesomeIcon icon={faEye} className={styles.buttonIcon} />
                      View Feedback
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Teacher Feedback Section */}
          <div className={styles.teacherFeedbackSection}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>
                <FontAwesomeIcon icon={faGraduationCap} className={styles.sectionIcon} />
                Teacher Feedback - Structured feedback display with strengths and recommendations
              </h3>
              <div className={styles.teacherInfo}>
                <span className={styles.teacherName}>
                  {evaluationData.teacherFeedback.teacherName}
                </span>
                <span className={styles.teacherTitle}>
                  {evaluationData.teacherFeedback.teacherTitle}
                </span>
              </div>
            </div>

            <div className={styles.feedbackContent}>
              {/* Overall Feedback */}
              <div className={styles.overallFeedback}>
                <h4 className={styles.feedbackSubtitle}>Overall Assessment</h4>
                <p className={styles.feedbackText}>{evaluationData.teacherFeedback.overall}</p>
              </div>

              {/* Strengths and Improvements */}
              <div className={styles.feedbackColumns}>
                <div className={styles.strengthsSection}>
                  <h4 className={styles.feedbackSubtitle}>
                    <FontAwesomeIcon icon={faUser} className={styles.feedbackIcon} />
                    Strengths
                  </h4>
                  <ul className={styles.feedbackList}>
                    {evaluationData.teacherFeedback.strengths.map((strength, index) => (
                      <li key={index} className={styles.feedbackItem}>
                        <span className={styles.checkmark}>✓</span>
                        <span className={styles.feedbackTextItem}>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={styles.improvementsSection}>
                  <h4 className={styles.feedbackSubtitle}>
                    <FontAwesomeIcon icon={faExclamationTriangle} className={styles.feedbackIcon} />
                    Areas for Improvement
                  </h4>
                  <ul className={styles.feedbackList}>
                    {evaluationData.teacherFeedback.improvements.map((improvement, index) => (
                      <li key={index} className={styles.feedbackItem}>
                        <span className={styles.arrow}>→</span>
                        <span className={styles.feedbackTextItem}>{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className={styles.summaryCards}>
            <div className={styles.summaryCard}>
              <div className={`${styles.cardNumber} ${styles.total}`}>{totalAssignments}</div>
              <div className={styles.cardLabel}>Total Assignments</div>
            </div>
            <div className={styles.summaryCard}>
              <div className={`${styles.cardNumber} ${styles.onTime}`}>{onTimeCount}</div>
              <div className={styles.cardLabel}>On Time</div>
            </div>
            <div className={styles.summaryCard}>
              <div className={`${styles.cardNumber} ${styles.late}`}>{lateCount}</div>
              <div className={styles.cardLabel}>Late Submissions</div>
            </div>
            <div className={styles.summaryCard}>
              <div className={`${styles.cardNumber} ${styles.average}`}>{averageScore}%</div>
              <div className={styles.cardLabel}>Avg Score</div>
            </div>
          </div>
        </Container>

        {/* Feedback Detail Modal */}
        <Modal
          isOpen={feedbackModal.isOpen}
          toggle={closeFeedbackModal}
          size="lg"
          className={styles.feedbackModal}
          scrollable={true}
          centered={true}
        >
          <ModalHeader toggle={closeFeedbackModal} className={styles.modalHeader}>
            <FontAwesomeIcon icon={faAward} className={styles.modalIcon} />
            <span className={styles.modalTitle}>Assignment Feedback Details</span>
          </ModalHeader>
          <ModalBody className={styles.modalBody}>
            {feedbackModal.task && (
              <div className={styles.feedbackModalContent}>
                {/* Assignment Header */}
                <div className={styles.assignmentHeader}>
                  <h4 className={styles.assignmentTitle}>{feedbackModal.task.name}</h4>
                  <div className={styles.assignmentMeta}>
                    <span className={styles.assignmentType}>
                      <FontAwesomeIcon icon={faGraduationCap} />
                      {feedbackModal.task.type}
                    </span>
                    <span className={styles.assignmentDate}>
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      Due: {new Date(feedbackModal.task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Performance Summary */}
                <div className={styles.performanceSummary}>
                  <div className={styles.performanceItem}>
                    <div className={styles.performanceLabel}>Your Score</div>
                    <div
                      className={`${styles.performanceValue} ${getPerformanceColorClass(
                        feedbackModal.task.percentage,
                      )}`}
                    >
                      {feedbackModal.task.earnedMarks}/{feedbackModal.task.totalMarks}
                      <span className={styles.percentage}>({feedbackModal.task.percentage}%)</span>
                    </div>
                  </div>
                  <div className={styles.performanceItem}>
                    <div className={styles.performanceLabel}>Weightage</div>
                    <div className={styles.performanceValue}>
                      <FontAwesomeIcon icon={faPercent} />
                      {feedbackModal.task.weightage}%
                    </div>
                  </div>
                  <div className={styles.performanceItem}>
                    <div className={styles.performanceLabel}>Status</div>
                    <div
                      className={`${styles.statusValue} ${
                        styles[getStatusClass(feedbackModal.task.status)]
                      }`}
                    >
                      {feedbackModal.task.status}
                    </div>
                  </div>
                </div>

                {/* Teacher Feedback */}
                <div className={styles.teacherFeedbackDetail}>
                  <h5 className={styles.feedbackTitle}>
                    <FontAwesomeIcon icon={faUser} />
                    Teacher Feedback
                  </h5>
                  <div className={styles.feedbackText}>{feedbackModal.task.teacherFeedback}</div>
                </div>

                {/* Additional Details */}
                <div className={styles.additionalDetails}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Submission Date:</span>
                    <span className={styles.detailValue}>
                      {new Date(feedbackModal.task.submissionDate).toLocaleDateString()} at{' '}
                      {new Date(feedbackModal.task.submissionDate).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Grade Category:</span>
                    <span className={styles.detailValue}>{feedbackModal.task.category}</span>
                  </div>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter className={styles.modalFooter}>
            <Button color="primary" onClick={closeFeedbackModal}>
              <FontAwesomeIcon icon={faTimes} className="me-2" />
              Close
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </>
  );
};

const mapStateToProps = state => ({
  auth: state.auth,
});

export default connect(mapStateToProps)(EvaluationResults);
