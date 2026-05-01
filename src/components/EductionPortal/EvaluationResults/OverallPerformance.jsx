import React from 'react';
import { Card, CardBody, CardHeader, Progress, Badge, Row, Col } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine,
  faTrophy,
  faBullseye,
  faArrowTrendUp,
  faUsers,
  faCalendar,
  faClock,
  faCheckCircle,
} from '@fortawesome/free-solid-svg-icons';
import styles from './OverallPerformance.module.css';

const OverallPerformance = ({ data, analytics, isLoading }) => {
  if (isLoading) {
    return (
      <Card className={styles.performanceCard}>
        <CardBody>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner} />
            <p className={styles.loadingText}>Loading performance data...</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (!data || !analytics) {
    return (
      <Card className={styles.performanceCard}>
        <CardBody>
          <div className={styles.noDataContainer}>
            <FontAwesomeIcon icon={faChartLine} className={styles.noDataIcon} />
            <p className={styles.noDataText}>No performance data available yet.</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  const getPerformanceLevel = score => {
    if (score >= 90) return { level: 'excellent', color: 'success', icon: faTrophy };
    if (score >= 80) return { level: 'good', color: 'primary', icon: faBullseye };
    if (score >= 70) return { level: 'fair', color: 'warning', icon: faArrowTrendUp };
    return { level: 'poor', color: 'danger', icon: faBullseye };
  };

  const performanceLevel = getPerformanceLevel(data.overallScore);
  const percentile = analytics.percentile;
  const improvementTrend = data.summary?.improvementTrend || '+0%';
  const isImproving = improvementTrend.startsWith('+');

  return (
    <Card className={styles.performanceCard}>
      <CardHeader className={styles.performanceHeader}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <FontAwesomeIcon icon={faChartLine} className={styles.headerIcon} />
            <div>
              <h4 className={styles.headerTitle}>Overall Performance</h4>
              <p className={styles.headerSubtitle}>Academic Progress Overview</p>
            </div>
          </div>
          <div className={styles.headerRight}>
            <Badge color={performanceLevel.color} className={styles.performanceBadge}>
              <FontAwesomeIcon icon={performanceLevel.icon} className={styles.badgeIcon} />
              {performanceLevel.level.toUpperCase()}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardBody className={styles.performanceBody}>
        {/* Main Performance Score */}
        <div className={styles.mainScoreSection}>
          <div className={styles.scoreDisplay}>
            <div className={styles.scoreCircle}>
              <div className={styles.scoreNumber}>{data.overallScore.toFixed(1)}</div>
              <div className={styles.scoreLabel}>Overall Score</div>
            </div>
            <div className={styles.scoreDetails}>
              <div className={styles.scoreMetric}>
                <span className={styles.metricLabel}>Class Rank</span>
                <span className={styles.metricValue}>
                  #{analytics.classRank} of {analytics.totalStudents}
                </span>
              </div>
              <div className={styles.scoreMetric}>
                <span className={styles.metricLabel}>Percentile</span>
                <span className={styles.metricValue}>{percentile}th</span>
              </div>
              <div className={styles.scoreMetric}>
                <span className={styles.metricLabel}>GPA</span>
                <span className={styles.metricValue}>{analytics.gpa}</span>
              </div>
              <div className={styles.scoreMetric}>
                <span className={styles.metricLabel}>Trend</span>
                <span
                  className={`${styles.metricValue} ${
                    isImproving ? styles.trendPositive : styles.trendNegative
                  }`}
                >
                  <FontAwesomeIcon
                    icon={faArrowTrendUp}
                    className={`${styles.trendIcon} ${
                      isImproving ? styles.trendUp : styles.trendDown
                    }`}
                  />
                  {improvementTrend}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics Grid */}
        <Row className={styles.metricsGrid}>
          <Col md={6} lg={3} className={styles.metricCol}>
            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <FontAwesomeIcon icon={faCheckCircle} className={styles.metricIcon} />
                <span className={styles.metricTitle}>Completion Rate</span>
              </div>
              <div className={styles.metricContent}>
                <div className={styles.metricNumber}>
                  {Math.round(
                    (data.summary.completedAssignments / data.summary.totalAssignments) * 100,
                  )}
                  %
                </div>
                <div className={styles.metricDescription}>
                  {data.summary.completedAssignments} of {data.summary.totalAssignments} assignments
                </div>
                <Progress
                  value={(data.summary.completedAssignments / data.summary.totalAssignments) * 100}
                  color="success"
                  className={styles.metricProgress}
                />
              </div>
            </div>
          </Col>

          <Col md={6} lg={3} className={styles.metricCol}>
            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <FontAwesomeIcon icon={faClock} className={styles.metricIcon} />
                <span className={styles.metricTitle}>On-Time Rate</span>
              </div>
              <div className={styles.metricContent}>
                <div className={styles.metricNumber}>
                  {Math.round(
                    (data.summary.onTimeSubmissions /
                      (data.summary.onTimeSubmissions +
                        data.summary.lateSubmissions +
                        data.summary.missingSubmissions)) *
                      100,
                  )}
                  %
                </div>
                <div className={styles.metricDescription}>
                  {data.summary.onTimeSubmissions} on-time submissions
                </div>
                <Progress
                  value={
                    (data.summary.onTimeSubmissions /
                      (data.summary.onTimeSubmissions +
                        data.summary.lateSubmissions +
                        data.summary.missingSubmissions)) *
                    100
                  }
                  color="info"
                  className={styles.metricProgress}
                />
              </div>
            </div>
          </Col>

          <Col md={6} lg={3} className={styles.metricCol}>
            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <FontAwesomeIcon icon={faUsers} className={styles.metricIcon} />
                <span className={styles.metricTitle}>Attendance</span>
              </div>
              <div className={styles.metricContent}>
                <div className={styles.metricNumber}>{analytics.attendanceRate}%</div>
                <div className={styles.metricDescription}>Class attendance rate</div>
                <Progress
                  value={analytics.attendanceRate}
                  color={
                    analytics.attendanceRate >= 90
                      ? 'success'
                      : analytics.attendanceRate >= 80
                      ? 'warning'
                      : 'danger'
                  }
                  className={styles.metricProgress}
                />
              </div>
            </div>
          </Col>

          <Col md={6} lg={3} className={styles.metricCol}>
            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <FontAwesomeIcon icon={faTarget} className={styles.metricIcon} />
                <span className={styles.metricTitle}>Participation</span>
              </div>
              <div className={styles.metricContent}>
                <div className={styles.metricNumber}>{analytics.participationScore}%</div>
                <div className={styles.metricDescription}>Class participation score</div>
                <Progress
                  value={analytics.participationScore}
                  color={
                    analytics.participationScore >= 90
                      ? 'success'
                      : analytics.participationScore >= 80
                      ? 'primary'
                      : 'warning'
                  }
                  className={styles.metricProgress}
                />
              </div>
            </div>
          </Col>
        </Row>

        {/* Performance Summary */}
        <div className={styles.summarySection}>
          <h5 className={styles.summaryTitle}>Performance Summary</h5>
          <Row>
            <Col md={6}>
              <div className={styles.summaryCard}>
                <h6 className={styles.summaryCardTitle}>Academic Achievements</h6>
                <div className={styles.achievementsList}>
                  <div className={styles.achievementItem}>
                    <FontAwesomeIcon icon={faTrophy} className={styles.achievementIcon} />
                    <span>Highest Score: {data.summary.highestScore}%</span>
                  </div>
                  <div className={styles.achievementItem}>
                    <FontAwesomeIcon icon={faTarget} className={styles.achievementIcon} />
                    <span>Average Score: {data.summary.averageScore}%</span>
                  </div>
                  <div className={styles.achievementItem}>
                    <FontAwesomeIcon icon={faCheckCircle} className={styles.achievementIcon} />
                    <span>
                      Time Management:{' '}
                      {data.summary.timeManagement?.excellent >
                      data.summary.timeManagement?.needsImprovement
                        ? 'Excellent'
                        : 'Needs Improvement'}
                    </span>
                  </div>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div className={styles.summaryCard}>
                <h6 className={styles.summaryCardTitle}>Key Insights</h6>
                <div className={styles.insightsList}>
                  {data.summary.strengths?.slice(0, 3).map((strength, index) => (
                    <div key={index} className={styles.insightItem}>
                      <div className={styles.insightBullet} />
                      <span className={styles.insightText}>{strength}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Last Updated */}
        <div className={styles.lastUpdated}>
          <FontAwesomeIcon icon={faCalendar} className={styles.updateIcon} />
          <span className={styles.updateText}>
            Last updated:{' '}
            {new Date(data.student.lastUpdated).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </CardBody>
    </Card>
  );
};

export default OverallPerformance;
