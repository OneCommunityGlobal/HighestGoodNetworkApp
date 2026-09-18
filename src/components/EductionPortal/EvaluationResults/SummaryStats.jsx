import React from 'react';
import { Card, CardBody, CardHeader, Progress, Badge, Row, Col } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartBar,
  faTrophy,
  faCalendar,
  faCheckCircle,
  faClock,
  faExclamationTriangle,
  faArrowTrendUp,
  faBullseye,
  faUsers,
  faPercentage,
  faAward,
  faLightbulb,
} from '@fortawesome/free-solid-svg-icons';
import styles from './SummaryStats.module.css';

const SummaryStats = ({ summary, analytics, trends, isLoading }) => {
  if (isLoading) {
    return (
      <Card className={styles.summaryCard}>
        <CardBody>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner} />
            <p className={styles.loadingText}>Loading summary statistics...</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (!summary || !analytics) {
    return (
      <Card className={styles.summaryCard}>
        <CardBody>
          <div className={styles.noDataContainer}>
            <FontAwesomeIcon icon={faChartBar} className={styles.noDataIcon} />
            <p className={styles.noDataText}>No summary data available yet.</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  const improvementTrend = summary.improvementTrend || '+0%';
  const isImproving = improvementTrend.startsWith('+');

  const completionRate = Math.round(
    (summary.completedAssignments / summary.totalAssignments) * 100,
  );
  const onTimeRate = Math.round(
    (summary.onTimeSubmissions /
      (summary.onTimeSubmissions + summary.lateSubmissions + summary.missingSubmissions)) *
      100,
  );

  return (
    <Card className={styles.summaryCard}>
      <CardHeader className={styles.summaryHeader}>
        <div className={styles.headerContent}>
          <FontAwesomeIcon icon={faChartBar} className={styles.headerIcon} />
          <div>
            <h4 className={styles.headerTitle}>Summary Statistics</h4>
            <p className={styles.headerSubtitle}>Comprehensive performance overview</p>
          </div>
        </div>
      </CardHeader>

      <CardBody className={styles.summaryBody}>
        {/* Key Performance Indicators */}
        <div className={styles.kpiSection}>
          <h5 className={styles.sectionTitle}>Key Performance Indicators</h5>
          <Row className={styles.kpiGrid}>
            <Col md={6} lg={3}>
              <div className={styles.kpiCard}>
                <div className={styles.kpiIcon} style={{ backgroundColor: '#10b981' }}>
                  <FontAwesomeIcon icon={faPercentage} />
                </div>
                <div className={styles.kpiContent}>
                  <div className={styles.kpiValue}>{summary.averageScore}%</div>
                  <div className={styles.kpiLabel}>Average Score</div>
                  <div className={styles.kpiTrend}>
                    <FontAwesomeIcon
                      icon={faArrowTrendUp}
                      className={`${styles.trendIcon} ${
                        isImproving ? styles.trendUp : styles.trendDown
                      }`}
                    />
                    <span
                      className={`${styles.trendText} ${
                        isImproving ? styles.trendPositive : styles.trendNegative
                      }`}
                    >
                      {improvementTrend}
                    </span>
                  </div>
                </div>
              </div>
            </Col>

            <Col md={6} lg={3}>
              <div className={styles.kpiCard}>
                <div className={styles.kpiIcon} style={{ backgroundColor: '#3b82f6' }}>
                  <FontAwesomeIcon icon={faUsers} />
                </div>
                <div className={styles.kpiContent}>
                  <div className={styles.kpiValue}>#{analytics.classRank}</div>
                  <div className={styles.kpiLabel}>Class Rank</div>
                  <div className={styles.kpiSubtext}>
                    {analytics.percentile}th percentile of {analytics.totalStudents}
                  </div>
                </div>
              </div>
            </Col>

            <Col md={6} lg={3}>
              <div className={styles.kpiCard}>
                <div className={styles.kpiIcon} style={{ backgroundColor: '#f59e0b' }}>
                  <FontAwesomeIcon icon={faCheckCircle} />
                </div>
                <div className={styles.kpiContent}>
                  <div className={styles.kpiValue}>{completionRate}%</div>
                  <div className={styles.kpiLabel}>Completion Rate</div>
                  <div className={styles.kpiDetails}>
                    {summary.completedAssignments}/{summary.totalAssignments} completed
                  </div>
                </div>
              </div>
            </Col>

            <Col md={6} lg={3}>
              <div className={styles.kpiCard}>
                <div className={styles.kpiIcon} style={{ backgroundColor: '#8b5cf6' }}>
                  <FontAwesomeIcon icon={faClock} />
                </div>
                <div className={styles.kpiContent}>
                  <div className={styles.kpiValue}>{onTimeRate}%</div>
                  <div className={styles.kpiLabel}>On-Time Rate</div>
                  <div className={styles.kpiDetails}>
                    {summary.onTimeSubmissions} on-time submissions
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Performance Breakdown */}
        <div className={styles.breakdownSection}>
          <h5 className={styles.sectionTitle}>Performance Breakdown</h5>
          <Row>
            <Col md={6}>
              <div className={styles.chartCard}>
                <h6 className={styles.chartTitle}>Submission Status</h6>
                <div className={styles.submissionStats}>
                  <div className={styles.statItem}>
                    <div className={styles.statBar}>
                      <div className={styles.statLabel}>On Time</div>
                      <Progress
                        value={
                          (summary.onTimeSubmissions /
                            (summary.onTimeSubmissions +
                              summary.lateSubmissions +
                              summary.missingSubmissions)) *
                          100
                        }
                        color="success"
                        className={styles.statProgress}
                      />
                      <div className={styles.statValue}>{summary.onTimeSubmissions}</div>
                    </div>
                  </div>
                  <div className={styles.statItem}>
                    <div className={styles.statBar}>
                      <div className={styles.statLabel}>Late</div>
                      <Progress
                        value={
                          (summary.lateSubmissions /
                            (summary.onTimeSubmissions +
                              summary.lateSubmissions +
                              summary.missingSubmissions)) *
                          100
                        }
                        color="warning"
                        className={styles.statProgress}
                      />
                      <div className={styles.statValue}>{summary.lateSubmissions}</div>
                    </div>
                  </div>
                  <div className={styles.statItem}>
                    <div className={styles.statBar}>
                      <div className={styles.statLabel}>Missing</div>
                      <Progress
                        value={
                          (summary.missingSubmissions /
                            (summary.onTimeSubmissions +
                              summary.lateSubmissions +
                              summary.missingSubmissions)) *
                          100
                        }
                        color="danger"
                        className={styles.statProgress}
                      />
                      <div className={styles.statValue}>{summary.missingSubmissions}</div>
                    </div>
                  </div>
                </div>
              </div>
            </Col>

            <Col md={6}>
              <div className={styles.chartCard}>
                <h6 className={styles.chartTitle}>Score Distribution</h6>
                <div className={styles.scoreDistribution}>
                  <div className={styles.scoreItem}>
                    <FontAwesomeIcon
                      icon={faTrophy}
                      className={styles.scoreIcon}
                      style={{ color: '#10b981' }}
                    />
                    <span className={styles.scoreLabel}>Highest Score:</span>
                    <span className={styles.scoreValue}>{summary.highestScore}%</span>
                  </div>
                  <div className={styles.scoreItem}>
                    <FontAwesomeIcon
                      icon={faBullseye}
                      className={styles.scoreIcon}
                      style={{ color: '#3b82f6' }}
                    />
                    <span className={styles.scoreLabel}>Average Score:</span>
                    <span className={styles.scoreValue}>{summary.averageScore}%</span>
                  </div>
                  <div className={styles.scoreItem}>
                    <FontAwesomeIcon
                      icon={faExclamationTriangle}
                      className={styles.scoreIcon}
                      style={{ color: '#f59e0b' }}
                    />
                    <span className={styles.scoreLabel}>Lowest Score:</span>
                    <span className={styles.scoreValue}>{summary.lowestScore}%</span>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Academic Insights */}
        <div className={styles.insightsSection}>
          <h5 className={styles.sectionTitle}>Academic Insights</h5>
          <Row>
            <Col md={6}>
              <div className={styles.insightCard}>
                <div className={styles.insightHeader}>
                  <FontAwesomeIcon icon={faTrophy} className={styles.insightIcon} />
                  <h6 className={styles.insightTitle}>Strengths</h6>
                  <Badge color="success" className={styles.insightBadge}>
                    {summary.strengths?.length || 0}
                  </Badge>
                </div>
                <div className={styles.insightContent}>
                  {summary.strengths?.slice(0, 4).map((strength, index) => (
                    <div key={index} className={styles.insightItem}>
                      <div
                        className={styles.insightBullet}
                        style={{ backgroundColor: '#10b981' }}
                      />
                      <span className={styles.insightText}>{strength}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Col>

            <Col md={6}>
              <div className={styles.insightCard}>
                <div className={styles.insightHeader}>
                  <FontAwesomeIcon icon={faLightbulb} className={styles.insightIcon} />
                  <h6 className={styles.insightTitle}>Areas for Improvement</h6>
                  <Badge color="warning" className={styles.insightBadge}>
                    {summary.areasForImprovement?.length || 0}
                  </Badge>
                </div>
                <div className={styles.insightContent}>
                  {summary.areasForImprovement?.slice(0, 4).map((area, index) => (
                    <div key={index} className={styles.insightItem}>
                      <div
                        className={styles.insightBullet}
                        style={{ backgroundColor: '#f59e0b' }}
                      />
                      <span className={styles.insightText}>{area}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Performance Trends */}
        {trends && (
          <div className={styles.trendsSection}>
            <h5 className={styles.sectionTitle}>Performance Trends</h5>
            <div className={styles.trendsCard}>
              <div className={styles.trendsGrid}>
                {trends.monthly?.map((month, index) => (
                  <div key={month.month} className={styles.trendItem}>
                    <div className={styles.trendMonth}>{month.month}</div>
                    <div className={styles.trendScore}>{month.score}%</div>
                    <div className={styles.trendRank}>Rank #{month.rank}</div>
                    {index > 0 && (
                      <div className={styles.trendChange}>
                        <FontAwesomeIcon
                          icon={faTrendUp}
                          className={`${styles.trendChangeIcon} ${
                            month.score > trends.monthly[index - 1].score
                              ? styles.trendUp
                              : styles.trendDown
                          }`}
                        />
                        <span
                          className={`${styles.trendChangeText} ${
                            month.score > trends.monthly[index - 1].score
                              ? styles.trendPositive
                              : styles.trendNegative
                          }`}
                        >
                          {month.score > trends.monthly[index - 1].score ? '+' : ''}
                          {(month.score - trends.monthly[index - 1].score).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Additional Metrics */}
        <div className={styles.additionalMetrics}>
          <h5 className={styles.sectionTitle}>Additional Metrics</h5>
          <Row className={styles.metricsRow}>
            <Col md={3} sm={6}>
              <div className={styles.metricBox}>
                <FontAwesomeIcon icon={faUsers} className={styles.metricIcon} />
                <div className={styles.metricValue}>{analytics.attendanceRate}%</div>
                <div className={styles.metricLabel}>Attendance</div>
              </div>
            </Col>
            <Col md={3} sm={6}>
              <div className={styles.metricBox}>
                <FontAwesomeIcon icon={faAward} className={styles.metricIcon} />
                <div className={styles.metricValue}>{analytics.participationScore}%</div>
                <div className={styles.metricLabel}>Participation</div>
              </div>
            </Col>
            <Col md={3} sm={6}>
              <div className={styles.metricBox}>
                <FontAwesomeIcon icon={faTarget} className={styles.metricIcon} />
                <div className={styles.metricValue}>{analytics.gpa}</div>
                <div className={styles.metricLabel}>Current GPA</div>
              </div>
            </Col>
            <Col md={3} sm={6}>
              <div className={styles.metricBox}>
                <FontAwesomeIcon icon={faCalendar} className={styles.metricIcon} />
                <div className={styles.metricValue}>{analytics.creditHours}</div>
                <div className={styles.metricLabel}>Credit Hours</div>
              </div>
            </Col>
          </Row>
        </div>
      </CardBody>
    </Card>
  );
};

export default SummaryStats;
