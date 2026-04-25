import React, { useState, useEffect } from 'react';
import { Row, Col, Card, CardBody, Alert, Table } from 'reactstrap';
import { useSelector } from 'react-redux';
import styles from './ClassPerformanceView.module.css';
import MetricCard from '../MetricCard/MetricCard';
import ReportChart from '../ReportChart/ReportChart';
import { getStatusClass, getStatusIcon, getStatusText } from '../../utils/statusUtils';

const getClassMockData = classId => {
  const classDataMap = {
    '1': {
      class: { id: '1', name: 'Grade 5A - Mathematics', studentCount: 25, teacher: 'Ms. Johnson' },
      metrics: { classAverage: 78, completionRate: 85, engagementRate: 82, activeLearners: 23 },
      changes: { classAverage: 3.5, completionRate: 7.2, engagementRate: -1.8, activeLearners: 2 },
      subjectPerformance: [
        { subject: 'Arts/Trades', performance: 69, color: '#8b5cf6' },
        { subject: 'Mathematics', performance: 83, color: '#4f46e5' },
        { subject: 'English', performance: 74, color: '#10b981' },
        { subject: 'Science', performance: 68, color: '#f59e0b' },
        { subject: 'Health', performance: 62, color: '#ef4444' },
        { subject: 'Social Studies', performance: 71, color: '#06b6d4' },
        { subject: 'Tech & Innovation', performance: 79, color: '#06b6d4' },
        { subject: 'Values', performance: 87, color: '#84cc16' },
      ],
      teachingStrategies: {
        labels: [
          'Game Lesson',
          'Power Play',
          'Book Smart Exploration',
          'Core Creative Centered Composition',
          'Exercised Smart Generation',
          'Curious Dropout',
        ],
        datasets: [
          {
            label: 'Effectiveness',
            data: [92, 85, 85, 67, 78, 65],
            backgroundColor: ['#10b981', '#10b981', '#10b981', '#3b82f6', '#3b82f6', '#ef4444'],
          },
        ],
      },
      lifeStrategies: {
        labels: [
          'Everything you do Should Increase Choices',
          'Ask "what would Jesus do?"',
          'Choose to trust with observation',
          'Practice nurturing your emotional intelligence',
        ],
        datasets: [
          {
            label: 'Impact',
            data: [91, 89, 82, 78],
            backgroundColor: ['#10b981', '#10b981', '#fbbf24', '#fbbf24'],
          },
        ],
      },
      insights: [
        {
          type: 'success',
          title: 'Game Lesson Strategy',
          message:
            'The Game Lesson Strategy has been effective. Students respond well to interactive gameplay.',
          action: 'Analyze Micro Lesson Strategies',
        },
        {
          type: 'warning',
          title: 'Conversation Practice',
          message:
            'Conversing practice showed room for improvement. Consider focusing more on practical applications.',
          action: 'Learn about application strategies',
        },
      ],
    },
    '2': {
      class: { id: '2', name: 'Grade 6B - Science', studentCount: 28, teacher: 'Mr. Smith' },
      metrics: { classAverage: 85, completionRate: 92, engagementRate: 88, activeLearners: 26 },
      changes: { classAverage: 5.2, completionRate: 8.5, engagementRate: 3.1, activeLearners: 4 },
      subjectPerformance: [
        { subject: 'Arts/Trades', performance: 77, color: '#8b5cf6' },
        { subject: 'Science', performance: 89, color: '#f59e0b' },
        { subject: 'Mathematics', performance: 82, color: '#4f46e5' },
        { subject: 'English', performance: 76, color: '#10b981' },
        { subject: 'Tech & Innovation', performance: 85, color: '#06b6d4' },
        { subject: 'Social Studies', performance: 71, color: '#8b5cf6' },
        { subject: 'Health', performance: 67, color: '#ef4444' },
        { subject: 'Values', performance: 84, color: '#84cc16' },
      ],
      teachingStrategies: {
        labels: [
          'Power Play',
          'Experiment Lab',
          'Nature Walk Discovery',
          'Tech Exploration',
          'Group Discussion',
          'Video Analysis',
        ],
        datasets: [
          {
            label: 'Effectiveness',
            data: [95, 90, 88, 82, 76, 70],
            backgroundColor: ['#10b981', '#10b981', '#10b981', '#10b981', '#3b82f6', '#3b82f6'],
          },
        ],
      },
      lifeStrategies: {
        labels: [
          'Everything you do Should Increase Choices',
          'Ask "what would Jesus do?"',
          'Practice observation skills',
          'Collaborative learning',
        ],
        datasets: [
          {
            label: 'Impact',
            data: [94, 91, 86, 82],
            backgroundColor: ['#10b981', '#10b981', '#10b981', '#fbbf24'],
          },
        ],
      },
      insights: [
        {
          type: 'success',
          title: 'Excellent Performance',
          message:
            'Grade 6B is performing above average. The Experiment Lab strategy is highly effective.',
          action: 'Review lesson plans',
        },
        {
          type: 'info',
          title: 'Growing Engagement',
          message: 'Video Analysis is improving. Continue integrating multimedia into lessons.',
          action: 'Explore more videos',
        },
      ],
    },
    '3': {
      class: { id: '3', name: 'Grade 4C - English', studentCount: 22, teacher: 'Mrs. Davis' },
      metrics: { classAverage: 72, completionRate: 78, engagementRate: 68, activeLearners: 18 },
      changes: {
        classAverage: -2.1,
        completionRate: 1.5,
        engagementRate: -5.3,
        activeLearners: -1,
      },
      subjectPerformance: [
        { subject: 'Arts/Trades', performance: 60, color: '#8b5cf6' },
        { subject: 'English', performance: 73, color: '#10b981' },
        { subject: 'Mathematics', performance: 66, color: '#4f46e5' },
        { subject: 'Science', performance: 61, color: '#f59e0b' },
        { subject: 'Social Studies', performance: 58, color: '#8b5cf6' },
        { subject: 'Health', performance: 54, color: '#ef4444' },
        { subject: 'Tech & Innovation', performance: 64, color: '#06b6d4' },
        { subject: 'Values', performance: 77, color: '#84cc16' },
      ],
      teachingStrategies: {
        labels: [
          'Story Time',
          'Reading Circle',
          'Creative Writing',
          'Peer Review',
          'Grammar Games',
          'Silent Reading',
        ],
        datasets: [
          {
            label: 'Effectiveness',
            data: [88, 85, 78, 72, 65, 58],
            backgroundColor: ['#10b981', '#10b981', '#3b82f6', '#3b82f6', '#f59e0b', '#ef4444'],
          },
        ],
      },
      lifeStrategies: {
        labels: [
          'Everything you do Should Increase Choices',
          'Ask "what would Jesus do?"',
          'Practice patience while reading',
          'Empathy in storytelling',
        ],
        datasets: [
          {
            label: 'Impact',
            data: [85, 80, 72, 68],
            backgroundColor: ['#10b981', '#10b981', '#fbbf24', '#ef4444'],
          },
        ],
      },
      insights: [
        {
          type: 'warning',
          title: 'Below Average Performance',
          message:
            'Grade 4C needs additional support in English. Consider differentiated instruction.',
          action: 'Review student assessments',
        },
        {
          type: 'info',
          title: 'Strength: Story Time',
          message:
            'Story Time is highly effective. Increase frequency of narrative-based activities.',
          action: 'Plan story sessions',
        },
      ],
    },
  };
  return classDataMap[classId] || classDataMap['1'];
};

const ClassPerformanceView = ({ filters }) => {
  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState(null);
  const darkMode = useSelector(state => state.theme?.darkMode || false);

  useEffect(() => {
    const fetchClassData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setClassData(getClassMockData(filters.classId));
      setLoading(false);
    };

    if (filters.classId) {
      fetchClassData();
    } else {
      setClassData(null);
      setLoading(false);
    }
  }, [filters.classId, filters.subject, filters.dateRange]);

  const getInsightAlertVariantClass = color => {
    switch (color) {
      case 'info':
        return styles.insightAlertInfo;
      case 'success':
        return styles.insightAlertSuccess;
      case 'warning':
        return styles.insightAlertWarning;
      case 'danger':
        return styles.insightAlertDanger;
      case 'primary':
        return styles.insightAlertPrimary;
      default:
        return '';
    }
  };

  if (!filters.classId) {
    return (
      <div className={`${styles.emptyState} ${darkMode ? styles.darkMode : ''}`}>
        <div className={styles.emptyContent}>
          <i className="fa fa-users" aria-hidden="true" />
          <h3>Select a Class</h3>
          <p>
            Choose a class from the filter above to view class performance analytics and insights.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.classPerformance} ${darkMode ? styles.darkMode : ''}`}>
      {/* Key Metrics Row */}
      <Row className={styles.metricsRow}>
        <Col lg={3} md={6} className={styles.metricCol}>
          <MetricCard
            title="Class Average"
            value={loading ? '...' : classData?.metrics.classAverage}
            unit="%"
            change={classData?.changes.classAverage}
            changeType="positive"
            icon="fa-chart-bar"
            color="primary"
            loading={loading}
          />
        </Col>
        <Col lg={3} md={6} className={styles.metricCol}>
          <MetricCard
            title="Completion Rate"
            value={loading ? '...' : classData?.metrics.completionRate}
            unit="%"
            change={classData?.changes.completionRate}
            changeType="positive"
            icon="fa-check-circle"
            color="success"
            loading={loading}
          />
        </Col>
        <Col lg={3} md={6} className={styles.metricCol}>
          <MetricCard
            title="Engagement Rate"
            value={loading ? '...' : classData?.metrics.engagementRate}
            unit="%"
            change={classData?.changes.engagementRate}
            changeType="negative"
            icon="fa-heart"
            color="warning"
            loading={loading}
          />
        </Col>
        <Col lg={3} md={6} className={styles.metricCol}>
          <MetricCard
            title="Active Learners"
            value={loading ? '...' : classData?.metrics.activeLearners}
            unit=" students"
            change={classData?.changes.activeLearners}
            changeType="positive"
            icon="fa-user-graduate"
            color="info"
            loading={loading}
          />
        </Col>
      </Row>

      <Row>
        {/* Strengths & Gaps by Subject */}
        <Col lg={12} className={styles.chartCol}>
          <Card className={`${styles.reportCard} ${darkMode ? styles.darkMode : ''}`}>
            <CardBody className={styles.cardBody}>
              <div className={styles.cardHeader}>
                <h4 className={styles.cardTitle}>Strengths & Gaps by Subject</h4>
              </div>

              {loading && (
                <div className={styles.loading}>
                  <i className="fa fa-spinner fa-spin" aria-hidden="true" />
                  <p>Loading subject performance...</p>
                </div>
              )}

              {!loading && (
                <div className={styles.tableContainer}>
                  <Table responsive className={styles.performanceTable}>
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Performance</th>
                        <th>Status</th>
                        <th>Visual Indicator</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classData?.subjectPerformance?.map(item => (
                        <tr key={item.subject}>
                          <td className={styles.subjectCell}>{item.subject}</td>
                          <td className={styles.performanceCell}>
                            <div className={styles.performanceBar}>
                              <div
                                className={styles.performanceFill}
                                style={{
                                  width: `${item.performance}%`,
                                  backgroundColor: item.color,
                                }}
                              />
                              <span className={styles.performanceText}>{item.performance}%</span>
                            </div>
                          </td>
                          <td>
                            <span
                              className={`${styles.statusBadge} ${
                                styles[getStatusClass(item.performance)]
                              }`}
                            >
                              {getStatusText(item.performance)}
                            </span>
                          </td>
                          <td className={styles.visualCell}>
                            <span className={styles.visualIndicator}>
                              {getStatusIcon(item.performance)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </CardBody>
          </Card>
        </Col>

        {/* Teaching Strategies Effectiveness */}
        <Col lg={6} className={styles.chartCol}>
          <Card className={`${styles.reportCard} ${darkMode ? styles.darkMode : ''}`}>
            <CardBody className={styles.cardBody}>
              <div className={styles.cardHeader}>
                <h4 className={styles.cardTitle}>Effectiveness of Teaching Strategies</h4>
              </div>

              {loading ? (
                <div className={styles.loading}>
                  <i className="fa fa-spinner fa-spin" aria-hidden="true" />
                  <p>Loading strategies data...</p>
                </div>
              ) : (
                <div className={styles.chartContainer}>
                  <ReportChart
                    type="bar"
                    data={classData?.teachingStrategies}
                    height={350}
                    showLegend={false}
                  />
                  <div className={styles.legend}>
                    <div className={styles.legendItem}>
                      <span className={`${styles.legendColor} ${styles.highlyEffective}`} />
                      <span>Highly Effective (85%)</span>
                    </div>
                    <div className={styles.legendItem}>
                      <span className={`${styles.legendColor} ${styles.effective}`} />
                      <span>Effective (70%)</span>
                    </div>
                    <div className={styles.legendItem}>
                      <span className={`${styles.legendColor} ${styles.needsImprovement}`} />
                      <span>Needs Improvement (65%)</span>
                    </div>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </Col>

        {/* Impact of Life Strategies */}
        <Col lg={6} className={styles.chartCol}>
          <Card className={`${styles.reportCard} ${darkMode ? styles.darkMode : ''}`}>
            <CardBody className={styles.cardBody}>
              <div className={styles.cardHeader}>
                <h4 className={styles.cardTitle}>Impact of Life Strategies</h4>
              </div>

              {loading ? (
                <div className={styles.loading}>
                  <i className="fa fa-spinner fa-spin" aria-hidden="true" />
                  <p>Loading impact data...</p>
                </div>
              ) : (
                <div className={styles.chartContainer}>
                  <ReportChart
                    type="bar"
                    data={classData?.lifeStrategies}
                    height={350}
                    showLegend={false}
                  />
                  <div className={styles.legend}>
                    <div className={styles.legendItem}>
                      <span className={`${styles.legendColor} ${styles.veryGood}`} />
                      <span>Very Good (89%)</span>
                    </div>
                    <div className={styles.legendItem}>
                      <span className={`${styles.legendColor} ${styles.good}`} />
                      <span>Good Impact (76%)</span>
                    </div>
                    <div className={styles.legendItem}>
                      <span className={`${styles.legendColor} ${styles.moderate}`} />
                      <span>Moderate Impact (76%)</span>
                    </div>
                    <div className={styles.legendItem}>
                      <span className={`${styles.legendColor} ${styles.low}`} />
                      <span>Low Impact (76%)</span>
                    </div>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Actionable Insights */}
      <Row>
        <Col>
          <Card className={`${styles.reportCard} ${darkMode ? styles.darkMode : ''}`}>
            <CardBody className={styles.cardBody}>
              <h4 className={styles.cardTitle}>Actionable Insight</h4>
              <div className={styles.insightsContainer}>
                {loading ? (
                  <div className={styles.loading}>
                    <i className="fa fa-spinner fa-spin" aria-hidden="true" />
                    <p>Generating insights...</p>
                  </div>
                ) : (
                  classData?.insights.map(insight => (
                    <Alert
                      key={insight.title}
                      color={insight.type || 'info'}
                      className={`${styles.insightAlert} ${getInsightAlertVariantClass(
                        insight.type,
                      )}`}
                    >
                      <div className={styles.insightContent}>
                        <div className={styles.insightHeader}>
                          <strong>{insight.title}:</strong>
                        </div>
                        <div className={styles.insightMessage}>{insight.message}</div>
                        {insight.action && (
                          <div className={styles.insightAction}>
                            <button className={styles.actionButton} type="button">
                              {insight.action}
                            </button>
                          </div>
                        )}
                      </div>
                    </Alert>
                  ))
                )}
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ClassPerformanceView;
