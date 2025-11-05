import React, { useState, useEffect } from 'react';
import { Row, Col, Card, CardBody, Alert } from 'reactstrap';
import { useSelector } from 'react-redux';
import styles from './ClassPerformanceView.module.css';
import MetricCard from '../MetricCard/MetricCard';
import ReportChart from '../ReportChart/ReportChart';

const ClassPerformanceView = ({ filters }) => {
  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState(null);
  const darkMode = useSelector(state => state.theme?.darkMode || false);

  // Mock data based on the design
  const mockClassData = {
    class: {
      id: '1',
      name: 'Grade 5A - Mathematics',
      studentCount: 25,
      teacher: 'Ms. Johnson',
    },
    metrics: {
      classAverage: 78,
      completionRate: 85,
      engagementRate: 82,
      activeLearners: 23,
    },
    changes: {
      classAverage: 3.5,
      completionRate: 7.2,
      engagementRate: -1.8,
      activeLearners: 2,
    },
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
        'Practice nurturing your emotional intelligence to connect your current state during and nurturing',
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
          'The Game Lesson Strategy has been effective to align with your teaching style. Strategies that work align with your teaching style.',
        action: 'Analyze Micro Lesson Strategies',
      },
      {
        type: 'warning',
        title: 'Conversation practice',
        message:
          'Conversing practice and mindset practices showed relevant increase choice to remediate with practice learning experience for you. Consider focusing more on practical applications and make learning tangible.',
        action: 'Learn about application strategies',
      },
    ],
  };

  useEffect(() => {
    // Simulate API call
    const fetchClassData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setClassData(mockClassData);
      setLoading(false);
    };

    if (filters.classId) {
      fetchClassData();
    } else {
      setClassData(null);
      setLoading(false);
    }
  }, [filters.classId, filters.subject, filters.dateRange]);

  const getStrategyColor = (value, index) => {
    if (value >= 85) return '#10b981'; // Green - Highly Effective
    if (value >= 70) return '#3b82f6'; // Blue - Effective
    return '#ef4444'; // Red - Needs Improvement
  };

  const getStrategyLabel = value => {
    if (value >= 85) return 'Highly Effective (85%)';
    if (value >= 70) return 'Effective (70%)';
    return 'Needs Improvement (65%)';
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
        {/* Teaching Strategies Effectiveness */}
        <Col lg={6} className={styles.chartCol}>
          <Card className={`${styles.reportCard} ${darkMode ? styles.darkMode : ''}`}>
            <CardBody>
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
            <CardBody>
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
            <CardBody>
              <h4 className={styles.cardTitle}>Actionable Insight</h4>
              <div className={styles.insightsContainer}>
                {loading ? (
                  <div className={styles.loading}>
                    <i className="fa fa-spinner fa-spin" aria-hidden="true" />
                    <p>Generating insights...</p>
                  </div>
                ) : (
                  classData?.insights.map((insight, index) => (
                    <Alert
                      key={index}
                      color={insight.type === 'success' ? 'success' : 'warning'}
                      className={styles.insightAlert}
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
