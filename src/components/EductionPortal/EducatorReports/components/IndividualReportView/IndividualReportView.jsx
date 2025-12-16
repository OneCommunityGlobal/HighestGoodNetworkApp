import React, { useState, useEffect } from 'react';
import { Row, Col, Card, CardBody, Table, Alert } from 'reactstrap';
import { useSelector } from 'react-redux';
import styles from './IndividualReportView.module.css';
import MetricCard from '../MetricCard/MetricCard';
import ReportChart from '../ReportChart/ReportChart';

const IndividualReportView = ({ filters }) => {
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  const darkMode = useSelector(state => state.theme?.darkMode || false);

  // Mock data - in a real app, this would come from API
  const mockStudentData = {
    student: {
      id: '1',
      name: 'Student Name',
      grade: '5A',
      avatar: null,
    },
    metrics: {
      averageScore: 82,
      lessonsCompleted: 45,
      engagementRate: 78,
      timeSpent: '24h 30min',
    },
    changes: {
      averageScore: 5.2,
      lessonsCompleted: 12.5,
      engagementRate: -2.1,
      timeSpent: 8.3,
    },
    subjectPerformance: [
      { subject: 'Actor Tasks', performance: '85%', status: 'excellent', visual: 'high' },
      { subject: 'English', performance: '88%', status: 'excellent', visual: 'high' },
      { subject: 'Health', performance: '65%', status: 'needs-improvement', visual: 'medium' },
      { subject: 'Mathematics', performance: '92%', status: 'excellent', visual: 'high' },
      { subject: 'Science', performance: '78%', status: 'good', visual: 'medium' },
      { subject: 'Social Studies', performance: '71%', status: 'good', visual: 'medium' },
      { subject: 'Tech & Innovation', performance: '89%', status: 'excellent', visual: 'high' },
      { subject: 'Values', performance: '95%', status: 'excellent', visual: 'high' },
    ],
    performanceTrend: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [
        {
          label: 'Math',
          data: [78, 82, 85, 88],
          borderColor: '#4f46e5',
          backgroundColor: '#4f46e520',
        },
        {
          label: 'English',
          data: [72, 75, 78, 82],
          borderColor: '#10b981',
          backgroundColor: '#10b98120',
        },
        {
          label: 'Science',
          data: [68, 70, 74, 78],
          borderColor: '#f59e0b',
          backgroundColor: '#f59e0b20',
        },
      ],
    },
    insights: [
      {
        type: 'success',
        title: 'Strong Performance',
        message: 'No concerns need to be addressed for this student.',
      },
      {
        type: 'info',
        title: 'Actionable Insight',
        message:
          'Student shows consistent improvement in Mathematics. Consider advancing to more challenging problems.',
      },
    ],
  };

  useEffect(() => {
    // Simulate API call
    const fetchStudentData = async () => {
      setLoading(true);
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStudentData(mockStudentData);
      setLoading(false);
    };

    if (filters.studentId) {
      fetchStudentData();
    } else {
      setStudentData(null);
      setLoading(false);
    }
  }, [filters.studentId, filters.subject, filters.dateRange]);

  const getStatusColor = status => {
    switch (status) {
      case 'excellent':
        return 'success';
      case 'good':
        return 'info';
      case 'needs-improvement':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const getVisualIndicator = visual => {
    switch (visual) {
      case 'high':
        return '🟢';
      case 'medium':
        return '🟡';
      case 'low':
        return '🔴';
      default:
        return '⚪';
    }
  };

  if (!filters.studentId) {
    return (
      <div className={`${styles.emptyState} ${darkMode ? styles.darkMode : ''}`}>
        <div className={styles.emptyContent}>
          <i className="fa fa-user-circle" aria-hidden="true" />
          <h3>Select a Student</h3>
          <p>Choose a student from the filter above to view their individual performance report.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.individualReport} ${darkMode ? styles.darkMode : ''}`}>
      {/* Key Metrics Row */}
      <Row className={styles.metricsRow}>
        <Col lg={3} md={6} className={styles.metricCol}>
          <MetricCard
            title="Average Score"
            value={loading ? '...' : studentData?.metrics.averageScore}
            unit="%"
            change={studentData?.changes.averageScore}
            changeType="positive"
            icon="fa-chart-line"
            color="primary"
            loading={loading}
          />
        </Col>
        <Col lg={3} md={6} className={styles.metricCol}>
          <MetricCard
            title="Lessons Completed"
            value={loading ? '...' : studentData?.metrics.lessonsCompleted}
            change={studentData?.changes.lessonsCompleted}
            changeType="positive"
            icon="fa-book"
            color="success"
            loading={loading}
          />
        </Col>
        <Col lg={3} md={6} className={styles.metricCol}>
          <MetricCard
            title="Engagement Rate"
            value={loading ? '...' : studentData?.metrics.engagementRate}
            unit="%"
            change={studentData?.changes.engagementRate}
            changeType="negative"
            icon="fa-heart"
            color="warning"
            loading={loading}
          />
        </Col>
        <Col lg={3} md={6} className={styles.metricCol}>
          <MetricCard
            title="Time Spent"
            value={loading ? '...' : studentData?.metrics.timeSpent}
            change={studentData?.changes.timeSpent}
            changeType="positive"
            icon="fa-clock"
            color="info"
            loading={loading}
          />
        </Col>
      </Row>

      <Row>
        {/* Strengths & Gaps Table */}
        <Col lg={7} className={styles.tableCol}>
          <Card className={`${styles.reportCard} ${darkMode ? styles.darkMode : ''}`}>
            <CardBody>
              <div className={styles.cardHeader}>
                <h4 className={styles.cardTitle}>Strengths & Gaps by Subject</h4>
                <div className={styles.headerActions}>
                  <span className={styles.subjectCount}>All Subjects</span>
                </div>
              </div>

              {loading ? (
                <div className={styles.loading}>
                  <i className="fa fa-spinner fa-spin" aria-hidden="true" />
                  <p>Loading student data...</p>
                </div>
              ) : (
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
                      {studentData?.subjectPerformance.map((item, index) => (
                        <tr key={index}>
                          <td className={styles.subjectCell}>{item.subject}</td>
                          <td className={styles.performanceCell}>
                            <strong>{item.performance}</strong>
                          </td>
                          <td>
                            <span className={`${styles.statusBadge} ${styles[item.status]}`}>
                              {item.status.replace('-', ' ')}
                            </span>
                          </td>
                          <td className={styles.visualCell}>
                            <span className={styles.visualIndicator}>
                              {getVisualIndicator(item.visual)}
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

        {/* Performance Trend Chart */}
        <Col lg={5} className={styles.chartCol}>
          <Card className={`${styles.reportCard} ${darkMode ? styles.darkMode : ''}`}>
            <CardBody>
              <h4 className={styles.cardTitle}>Performance Trend by Subject Over Time</h4>
              <div className={styles.chartContainer}>
                {loading ? (
                  <div className={styles.chartLoading}>
                    <i className="fa fa-spinner fa-spin" aria-hidden="true" />
                    <p>Loading chart data...</p>
                  </div>
                ) : (
                  <ReportChart
                    type="line"
                    data={studentData?.performanceTrend}
                    height={300}
                    showLegend
                  />
                )}
              </div>
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
                  studentData?.insights.map((insight, index) => (
                    <Alert
                      key={index}
                      color={getStatusColor(insight.type)}
                      className={styles.insightAlert}
                    >
                      <div className={styles.insightContent}>
                        <strong>{insight.title}:</strong> {insight.message}
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

export default IndividualReportView;
