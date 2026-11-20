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
  faCalendarAlt,
  faAward,
} from '@fortawesome/free-solid-svg-icons';

import styles from './EvaluationResults.module.css';
import EvaluationApiService from './evaluationApiService';

const displayValue = value => value ?? '—';
const displayPercent = value => (Number.isFinite(value) ? `${value}%` : '—');
const displayDate = (value, includeTime = false) => {
  if (!value || Number.isNaN(new Date(value).getTime())) return '—';
  const date = new Date(value);
  return includeTime
    ? `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`
    : date.toLocaleDateString();
};

const mapResults = data => ({
  summary: data.summary || {},
  categories: (data.categories || []).map(category => ({
    ...category,
    id: category.evaluationId,
    name: category.category,
    earnedMarks: category.marks,
    totalMarks: category.maxMarks,
  })),
  tasks: (data.taskResults || []).map(task => ({
    ...task,
    id: task.taskId,
    name: task.taskName,
    earnedMarks: task.marks,
    totalMarks: task.maxMarks,
    teacherFeedback: task.feedback,
    status: { on_time: 'On time', late: 'Late', pending: 'Pending' }[task.submissionStatus] ?? '—',
  })),
  teacherFeedback: {
    ...data.teacherFeedback,
    strengths: data.teacherFeedback?.strengths || [],
    improvements: data.teacherFeedback?.improvements || [],
  },
});

const EvaluationResults = ({ auth }) => {
  const [evaluationData, setEvaluationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [loadedFor, setLoadedFor] = useState(null);
  const accountId = auth?.user?.userid;
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    task: null,
  });

  useEffect(() => {
    let active = true;
    setEvaluationData(null);
    setError(null);
    setFeedbackModal({ isOpen: false, task: null });
    setLoading(true);
    setLoadedFor(accountId);
    if (!accountId) {
      setError('Please sign in to view your evaluation results.');
      setLoading(false);
      return () => {
        active = false;
      };
    }
    EvaluationApiService.getEvaluationResults()
      .then(data => {
        if (active) setEvaluationData(mapResults(data));
      })
      .catch(requestError => {
        if (!active) return;
        const status = requestError.response?.status;
        const messages = {
          401: 'Please sign in to view your evaluation results.',
          403: 'You do not have permission to view evaluation results.',
          404: 'Your student profile was not found.',
        };
        setError(messages[status] || 'Unable to load evaluation results. Please try again.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    // Ignore responses from an old account, retry, or an unmounted page.
    return () => {
      active = false;
    };
  }, [accountId, attempt]);

  if (loading || loadedFor !== accountId) {
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

  if (error) {
    return (
      <Container className={styles.container}>
        <Alert color="danger" className={styles.noDataAlert}>
          {error}
          <Button color="primary" onClick={() => setAttempt(value => value + 1)}>
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!evaluationData || (!evaluationData.categories.length && !evaluationData.tasks.length)) {
    return (
      <Container className={styles.container}>
        <Alert color="warning" className={styles.noDataAlert}>
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          No evaluation results available at this time.
        </Alert>
      </Container>
    );
  }

  const { categories, tasks, summary } = evaluationData;
  // Scores and counts are authoritative backend values, including genuine zeroes.
  const totalEarnedPoints = summary.earnedMarks;
  const totalPossiblePoints = summary.maxMarks;
  const percentageScore = summary.overallScore;
  const totalAssignments = summary.totalTasks;
  const onTimeCount = summary.onTimeSubmissions;
  const lateCount = summary.lateSubmissions;
  const averageScore = summary.averageScore;

  // Helper functions
  const getPerformanceColor = percentage => {
    if (!Number.isFinite(percentage)) return '';
    if (percentage >= 80) return 'excellent';
    if (percentage >= 70) return 'good';
    if (percentage >= 60) return 'fair';
    return 'poor';
  };

  const getStatusClass = status => {
    if (status === 'On time' || status === 'completed') return 'onTime';
    if (status?.toLowerCase().includes('late')) return 'late';
    return '';
  };

  const getPerformanceColorClass = percentage => {
    if (!Number.isFinite(percentage)) return '';
    if (percentage >= 80) return styles.excellent;
    if (percentage >= 70) return styles.good;
    if (percentage >= 60) return styles.fair;
    return styles.poor;
  };

  // Generate dynamic performance insights based on actual data
  const getPerformanceInsights = () => {
    const strongAreas = categories.filter(
      cat => Number.isFinite(cat.percentage) && cat.percentage >= 80,
    );
    const improvementAreas = categories.filter(
      cat => Number.isFinite(cat.percentage) && cat.percentage < 70,
    );

    const strongText =
      strongAreas.length > 0
        ? strongAreas
            .slice(0, 3)
            .map(cat => `${cat.name} (${Math.round(cat.percentage)}%)`)
            .join(', ')
        : null;

    const improvementText =
      improvementAreas.length > 0 && improvementAreas[0]
        ? `${improvementAreas[0].name} (${Math.round(improvementAreas[0].percentage)}%)`
        : 'certain areas';

    return { strongText, improvementText, hasImprovementAreas: improvementAreas.length > 0 };
  };

  const { strongText, improvementText, hasImprovementAreas } = getPerformanceInsights();

  const openFeedbackModal = task => {
    setFeedbackModal({ isOpen: true, task });
  };

  const closeFeedbackModal = () => {
    setFeedbackModal({ isOpen: false, task: null });
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
              <span className={styles.scoreText}>{displayPercent(percentageScore)}</span>
              <span className={styles.scoreLabel}>Overall Grade</span>
            </div>
          </div>
          <div className={styles.progressSection}>
            <div
              className={styles.progressBar}
              role="progressbar"
              aria-label="Overall performance"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percentageScore ?? undefined}
            >
              <div
                className={styles.progressFill}
                style={{ width: `${displayPercent(percentageScore)}` }}
              ></div>
            </div>
            <div className={styles.scoreDetails}>
              <span>
                Total Score: {displayValue(totalEarnedPoints)}/{displayValue(totalPossiblePoints)}{' '}
                points
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
                    <td>{displayPercent(category.weightage)}</td>
                    <td>{displayValue(category.completedItems)}</td>
                    <td>{displayValue(category.totalMarks)}</td>
                    <td>{displayValue(category.earnedMarks)}</td>
                    <td>{displayPercent(category.percentage)}</td>
                    <td>
                      <div className={styles.performanceBar}>
                        <div
                          className={`${styles.performanceFill} ${
                            styles[getPerformanceColor(category.percentage)]
                          }`}
                          style={{ width: `${category.percentage ?? 0}%` }}
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
              {strongText ? (
                <>
                  You performed strongly in <strong>{strongText}</strong>.
                </>
              ) : (
                '—'
              )}
              {hasImprovementAreas && (
                <>
                  {' '}
                  You may improve your performance in <strong>{improvementText}</strong> - consider
                  reviewing preparation strategies.
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
                          Submitted: {displayDate(task.submissionDate)}
                        </div>
                      </div>
                    </td>
                    <td>{displayPercent(task.weightage)}</td>
                    <td>
                      {displayValue(task.earnedMarks)}/{displayValue(task.totalMarks)}
                    </td>
                    <td>
                      <span className={getPerformanceColorClass(task.percentage)}>
                        {displayPercent(task.percentage)}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${styles[getStatusClass(task.status)]}`}
                      >
                        {task.status}
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
                  <span className={`${styles.statusBadge} ${styles[getStatusClass(task.status)]}`}>
                    {task.status}
                  </span>
                </div>
                <div className={styles.cardMeta}>
                  <div className={styles.cardMetaItem}>
                    <strong>Weightage:</strong> {displayPercent(task.weightage)}
                  </div>
                  <div className={styles.cardMetaItem}>
                    <strong>Score:</strong> {displayValue(task.earnedMarks)}/
                    {displayValue(task.totalMarks)}
                    <span className={getPerformanceColorClass(task.percentage)}>
                      {' '}
                      ({displayPercent(task.percentage)})
                    </span>
                  </div>
                  <div className={styles.cardMetaItem}>
                    <strong>Submitted:</strong> {displayDate(task.submissionDate)}
                  </div>
                </div>
                <div className={styles.cardActions}>
                  <button className={styles.feedbackButton} onClick={() => openFeedbackModal(task)}>
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
                {displayValue(evaluationData.teacherFeedback.teacherName)}
              </span>
              <span className={styles.teacherTitle}>
                {displayValue(evaluationData.teacherFeedback.teacherTitle)}
              </span>
            </div>
          </div>

          <div className={styles.feedbackContent}>
            {/* Overall Feedback */}
            <div className={styles.overallFeedback}>
              <h4 className={styles.feedbackSubtitle}>Overall Assessment</h4>
              <p className={styles.feedbackText}>
                {displayValue(evaluationData.teacherFeedback.overall)}
              </p>
            </div>

            {/* Strengths and Improvements */}
            <div className={styles.feedbackColumns}>
              <div className={styles.strengthsSection}>
                <h4 className={styles.feedbackSubtitle}>
                  <FontAwesomeIcon icon={faUser} className={styles.feedbackIcon} />
                  Strengths
                </h4>
                <ul className={styles.feedbackList}>
                  {!evaluationData.teacherFeedback.strengths.length && <li>—</li>}
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
                  {!evaluationData.teacherFeedback.improvements.length && <li>—</li>}
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
            <div className={`${styles.cardNumber} ${styles.total}`}>
              {displayValue(totalAssignments)}
            </div>
            <div className={styles.cardLabel}>Total Assignments</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={`${styles.cardNumber} ${styles.onTime}`}>
              {displayValue(onTimeCount)}
            </div>
            <div className={styles.cardLabel}>On Time</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={`${styles.cardNumber} ${styles.late}`}>{displayValue(lateCount)}</div>
            <div className={styles.cardLabel}>Late Submissions</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={`${styles.cardNumber} ${styles.average}`}>
              {displayPercent(averageScore)}
            </div>
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
                    {displayValue(feedbackModal.task.type)}
                  </span>
                  <span className={styles.assignmentDate}>
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    Due: {displayDate(feedbackModal.task.dueDate)}
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
                    {displayValue(feedbackModal.task.earnedMarks)}/
                    {displayValue(feedbackModal.task.totalMarks)}
                    <span className={styles.percentage}>
                      ({displayPercent(feedbackModal.task.percentage)})
                    </span>
                  </div>
                </div>
                <div className={styles.performanceItem}>
                  <div className={styles.performanceLabel}>Weightage</div>
                  <div className={styles.performanceValue}>
                    {displayPercent(feedbackModal.task.weightage)}
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
                <div className={styles.feedbackText}>
                  {displayValue(feedbackModal.task.teacherFeedback)}
                </div>
              </div>

              {/* Additional Details */}
              <div className={styles.additionalDetails}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Submission Date:</span>
                  <span className={styles.detailValue}>
                    {displayDate(feedbackModal.task.submissionDate, true)}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Grade Category:</span>
                  <span className={styles.detailValue}>
                    {displayValue(feedbackModal.task.category)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter className={styles.modalFooter}>
          <Button color="primary" onClick={closeFeedbackModal}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

const mapStateToProps = state => ({
  auth: state.auth,
});

export default connect(mapStateToProps)(EvaluationResults);
