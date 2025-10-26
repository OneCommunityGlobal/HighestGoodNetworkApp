import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col, Card, CardBody, Badge, Alert } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine,
  faTrophy,
  faClipboardCheck,
  faExclamationTriangle,
  faClock,
  faCheckCircle,
  faTimesCircle,
  faStar,
  faGraduationCap,
} from '@fortawesome/free-solid-svg-icons';
import styles from './EvaluationResults.module.css';
import OverallPerformance from './OverallPerformance';
import CategoryBreakdown from './CategoryBreakdown';
import TaskDetailsList from './TaskDetailsList';
import SummaryStats from './SummaryStats';
import TeacherFeedback from './TeacherFeedback';
import EvaluationNotificationService from './evaluationNotificationService';
import { mockEvaluationData } from './mockData';

const EvaluationResults = ({ auth }) => {
  const [evaluationData, setEvaluationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    // Simulate API call with realistic loading time
    const loadEvaluationData = async () => {
      try {
        setLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));

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
        // Handle error silently for now
      } finally {
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

  const { student, overallScore, categories, tasks, summary, teacherFeedback } = evaluationData;

  return (
    <div className={styles.evaluationResultsPage}>
      {/* Header Section */}
      <div className={styles.headerSection}>
        <Container>
          <div className={styles.headerContent}>
            <div className={styles.studentInfo}>
              <FontAwesomeIcon icon={faGraduationCap} className={styles.headerIcon} />
              <div>
                <h1 className={styles.pageTitle}>Academic Performance Dashboard</h1>
                <p className={styles.studentName}>
                  Welcome back, {auth?.user?.firstName} {auth?.user?.lastName}
                </p>
                <small className={styles.lastUpdated}>
                  Last updated:{' '}
                  {new Date(student.lastUpdated).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </small>
              </div>
            </div>
            <div className={styles.overallScoreBadge}>
              <div className={styles.scoreCircle}>
                <span className={styles.scoreNumber}>{overallScore}%</span>
                <span className={styles.scoreLabel}>Overall</span>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <Container className={styles.mainContent}>
        {/* Teacher Feedback Section */}
        <TeacherFeedback feedback={teacherFeedback} />

        {/* Overall Performance Section */}
        <OverallPerformance score={overallScore} student={student} categories={categories} />

        {/* Summary Statistics */}
        <SummaryStats summary={summary} />

        {/* Category Filter */}
        <div className={styles.filterSection}>
          <h4 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faChartLine} className="me-2" />
            Performance Breakdown
          </h4>
          <div className={styles.categoryFilter}>
            {['all', ...categories.map(cat => cat.name.toLowerCase())].map(category => (
              <button
                key={category}
                className={`${styles.filterButton} ${
                  selectedCategory === category ? styles.active : ''
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category === 'all'
                  ? 'All Categories'
                  : category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Category Breakdown Table */}
        <CategoryBreakdown categories={categories} selectedCategory={selectedCategory} />

        {/* Detailed Tasks List */}
        <TaskDetailsList
          tasks={tasks}
          selectedCategory={selectedCategory}
          categories={categories}
        />
      </Container>
    </div>
  );
};

const mapStateToProps = state => ({
  auth: state.auth,
});

export default connect(mapStateToProps)(EvaluationResults);
