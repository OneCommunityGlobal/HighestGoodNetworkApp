import React, { useState, useEffect } from 'react';
import { Row, Col, Card, CardBody, Table, Alert } from 'reactstrap';
import { useSelector } from 'react-redux';
import styles from './IndividualReportView.module.css';
import MetricCard from '../MetricCard/MetricCard';
import ReportChart from '../ReportChart/ReportChart';

const getStudentMockData = studentId => {
  const studentDataMap = {
    '1': {
      student: { id: '1', name: 'Alex Johnson', grade: '5A', avatar: null },
      metrics: {
        averageScore: 82,
        lessonsCompleted: 45,
        engagementRate: 78,
        timeSpent: '24h 30min',
      },
      changes: { averageScore: 5.2, lessonsCompleted: 12.5, engagementRate: -2.1, timeSpent: 8.3 },
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
    },
    '2': {
      student: { id: '2', name: 'Sarah Williams', grade: '5A', avatar: null },
      metrics: {
        averageScore: 91,
        lessonsCompleted: 52,
        engagementRate: 88,
        timeSpent: '32h 15min',
      },
      changes: { averageScore: 8.5, lessonsCompleted: 15.2, engagementRate: 5.3, timeSpent: 12.1 },
      subjectPerformance: [
        { subject: 'Actor Tasks', performance: '92%', status: 'excellent', visual: 'high' },
        { subject: 'English', performance: '95%', status: 'excellent', visual: 'high' },
        { subject: 'Health', performance: '78%', status: 'good', visual: 'medium' },
        { subject: 'Mathematics', performance: '88%', status: 'excellent', visual: 'high' },
        { subject: 'Science', performance: '85%', status: 'excellent', visual: 'high' },
        { subject: 'Social Studies', performance: '82%', status: 'excellent', visual: 'high' },
        { subject: 'Tech & Innovation', performance: '75%', status: 'good', visual: 'medium' },
        { subject: 'Values', performance: '98%', status: 'excellent', visual: 'high' },
      ],
      performanceTrend: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
          {
            label: 'Math',
            data: [80, 84, 87, 91],
            borderColor: '#4f46e5',
            backgroundColor: '#4f46e520',
          },
          {
            label: 'English',
            data: [85, 88, 92, 95],
            borderColor: '#10b981',
            backgroundColor: '#10b98120',
          },
          {
            label: 'Science',
            data: [78, 80, 83, 85],
            borderColor: '#f59e0b',
            backgroundColor: '#f59e0b20',
          },
        ],
      },
      insights: [
        {
          type: 'success',
          title: 'Top Performer',
          message: 'Sarah is performing in the top 10% of the class across all subjects.',
        },
        {
          type: 'info',
          title: 'Recommendation',
          message: 'Consider advanced placement or enrichment activities in English and Values.',
        },
      ],
    },
    '3': {
      student: { id: '3', name: 'Michael Brown', grade: '5A', avatar: null },
      metrics: {
        averageScore: 68,
        lessonsCompleted: 32,
        engagementRate: 62,
        timeSpent: '18h 45min',
      },
      changes: {
        averageScore: -3.2,
        lessonsCompleted: -5.1,
        engagementRate: -8.4,
        timeSpent: -4.2,
      },
      subjectPerformance: [
        { subject: 'Actor Tasks', performance: '72%', status: 'good', visual: 'medium' },
        { subject: 'English', performance: '65%', status: 'needs-improvement', visual: 'medium' },
        { subject: 'Health', performance: '58%', status: 'needs-improvement', visual: 'low' },
        { subject: 'Mathematics', performance: '75%', status: 'good', visual: 'medium' },
        { subject: 'Science', performance: '70%', status: 'good', visual: 'medium' },
        {
          subject: 'Social Studies',
          performance: '62%',
          status: 'needs-improvement',
          visual: 'medium',
        },
        { subject: 'Tech & Innovation', performance: '78%', status: 'good', visual: 'medium' },
        { subject: 'Values', performance: '68%', status: 'good', visual: 'medium' },
      ],
      performanceTrend: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
          {
            label: 'Math',
            data: [78, 76, 75, 72],
            borderColor: '#4f46e5',
            backgroundColor: '#4f46e520',
          },
          {
            label: 'English',
            data: [70, 68, 66, 62],
            borderColor: '#10b981',
            backgroundColor: '#10b98120',
          },
          {
            label: 'Science',
            data: [72, 71, 70, 68],
            borderColor: '#f59e0b',
            backgroundColor: '#f59e0b20',
          },
        ],
      },
      insights: [
        {
          type: 'warning',
          title: 'Needs Support',
          message: 'Michael is struggling in English and Health. Consider additional tutoring.',
        },
        {
          type: 'info',
          title: 'Strength Area',
          message:
            'Tech & Innovation shows promise. Use this as engagement opportunity for other subjects.',
        },
      ],
    },
    '4': {
      student: { id: '4', name: 'Emily Davis', grade: '5A', avatar: null },
      metrics: {
        averageScore: 76,
        lessonsCompleted: 41,
        engagementRate: 72,
        timeSpent: '21h 20min',
      },
      changes: { averageScore: 2.1, lessonsCompleted: 8.3, engagementRate: 1.2, timeSpent: 3.5 },
      subjectPerformance: [
        { subject: 'Actor Tasks', performance: '80%', status: 'good', visual: 'medium' },
        { subject: 'English', performance: '78%', status: 'good', visual: 'medium' },
        { subject: 'Health', performance: '72%', status: 'good', visual: 'medium' },
        {
          subject: 'Mathematics',
          performance: '68%',
          status: 'needs-improvement',
          visual: 'medium',
        },
        { subject: 'Science', performance: '82%', status: 'excellent', visual: 'high' },
        { subject: 'Social Studies', performance: '75%', status: 'good', visual: 'medium' },
        { subject: 'Tech & Innovation', performance: '85%', status: 'excellent', visual: 'high' },
        { subject: 'Values', performance: '80%', status: 'good', visual: 'medium' },
      ],
      performanceTrend: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
          {
            label: 'Math',
            data: [65, 66, 67, 68],
            borderColor: '#4f46e5',
            backgroundColor: '#4f46e520',
          },
          {
            label: 'English',
            data: [74, 76, 77, 78],
            borderColor: '#10b981',
            backgroundColor: '#10b98120',
          },
          {
            label: 'Science',
            data: [78, 80, 81, 82],
            borderColor: '#f59e0b',
            backgroundColor: '#f59e0b20',
          },
        ],
      },
      insights: [
        {
          type: 'success',
          title: 'Improving',
          message: 'Emily shows consistent improvement across most subjects.',
        },
        {
          type: 'info',
          title: 'Focus Area',
          message: 'Mathematics could benefit from additional practice. Excel in Science and Tech!',
        },
      ],
    },
  };
  return studentDataMap[studentId] || studentDataMap['1'];
};

const IndividualReportView = ({ filters }) => {
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  const darkMode = useSelector(state => state.theme?.darkMode || false);

  useEffect(() => {
    const fetchStudentData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStudentData(getStudentMockData(filters.studentId));
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
    <div className={`${darkMode ? styles.darkMode : ''}`}>
      <div className={`${styles.individualReport}`}>
        {/* Key Metrics Row */}
        <Row className={`${styles.metricsRow}`}>
          <Col className={`${styles.metricCol}`}>
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
          <Col lg={3} md={6} className={`${styles.metricCol}`}>
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
          <Col className={`${styles.metricCol}`}>
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
          <Col className={`${styles.metricCol}`}>
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
          <Col className={`${styles.tableCol}`}>
            <Card className={`${styles.reportCard}`}>
              <CardBody className={`${styles.cardBody}`}>
                <div className={`${styles.cardHeader}`}>
                  <h4 className={`${styles.cardTitle}`}>Strengths & Gaps by Subject</h4>
                  <div className={`${styles.headerActions}`}>
                    <span className={`${styles.subjectCount}`}>All Subjects</span>
                  </div>
                </div>

                {loading ? (
                  <div className={`${styles.loading}`}>
                    <i aria-hidden="true" />
                    <p>Loading student data...</p>
                  </div>
                ) : (
                  <div className={`${styles.tableContainer}`}>
                    <Table responsive className={`${styles.performanceTable}`}>
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
                            <td className={`${styles.subjectCell}`}>{item.subject}</td>
                            <td className={`${styles.performanceCell}`}>
                              <strong>{item.performance}</strong>
                            </td>
                            <td>
                              <span className={`${styles.statusBadge} ${styles[item.status]}`}>
                                {item.status.replace('-', ' ')}
                              </span>
                            </td>
                            <td className={`${styles.visualCell}`}>
                              <span className={`${styles.visualIndicator}`}>
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
          <Col className={`${styles.chartCol}`}>
            <Card className={`${styles.reportCard}`}>
              <CardBody className={`${styles.cardBody}`}>
                <h4 className={`${styles.cardTitle}`}>Performance Trend by Subject Over Time</h4>
                <div className={`${styles.chartContainer}`}>
                  {loading ? (
                    <div className={`${styles.chartLoading}`}>
                      <i aria-hidden="true" />
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
            <Card className={`${styles.reportCard}`}>
              <CardBody className={`${styles.cardBody}`}>
                <h4 className={`${styles.cardTitle}`}>Actionable Insight</h4>
                <div className={`${styles.insightsContainer}`}>
                  {loading ? (
                    <div className={`${styles.loading}`}>
                      <i aria-hidden="true" />
                      <p>Generating insights...</p>
                    </div>
                  ) : (
                    studentData?.insights.map((insight, index) => (
                      <Alert
                        key={index}
                        color={getStatusColor(insight.type)}
                        className={`${styles.insightAlert} ${getInsightAlertVariantClass(
                          getStatusColor(insight.type),
                        )}`}
                      >
                        <div className={`${styles.insightContent}`}>
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
    </div>
  );
};

export default IndividualReportView;
