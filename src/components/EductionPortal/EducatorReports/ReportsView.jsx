import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Table,
  Alert,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import { useSelector } from 'react-redux';
import DashboardLayout from './DashboardLayout/DashboardLayout';
import styles from './ReportsView.module.css';
import ReportChart from './ReportChart';

const ReportsView = () => {
  const [loading, setLoading] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState('All Subjects');
  const [subjectDropdownOpen, setSubjectDropdownOpen] = useState(false);
  const [performanceDropdownOpen, setPerformanceDropdownOpen] = useState(false);

  const darkMode = useSelector(state => state.theme?.darkMode || false);
  const authUser = useSelector(state => state.auth.user);

  // Mock data matching the exact design
  const strengthsGapsData = [
    { subject: 'Arts/Trades', performance: 95, status: 'excellent', color: '#10b981' },
    { subject: 'English', performance: 90, status: 'excellent', color: '#10b981' },
    { subject: 'Health', performance: 48, status: 'needs-improvement', color: '#f59e0b' },
    { subject: 'Mathematics', performance: 67, status: 'good', color: '#fbbf24' },
    { subject: 'Science', performance: 83, status: 'good', color: '#f59e0b' },
    { subject: 'Social Studies', performance: 84, status: 'excellent', color: '#10b981' },
    {
      subject: 'Tech & Innovation',
      performance: 35,
      status: 'needs-improvement',
      color: '#ef4444',
    },
    { subject: 'Values', performance: 72, status: 'good', color: '#10b981' },
  ];

  const performanceTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Arts/Trades',
        data: [95, 94, 95, 96, 95, 95],
        borderColor: '#10b981',
        backgroundColor: 'transparent',
      },
      {
        label: 'English',
        data: [88, 89, 90, 91, 90, 90],
        borderColor: '#3b82f6',
        backgroundColor: 'transparent',
      },
      {
        label: 'Health',
        data: [45, 46, 47, 48, 48, 48],
        borderColor: '#f59e0b',
        backgroundColor: 'transparent',
      },
      {
        label: 'Mathematics',
        data: [65, 66, 67, 68, 67, 67],
        borderColor: '#fbbf24',
        backgroundColor: 'transparent',
      },
      {
        label: 'Science',
        data: [80, 81, 82, 83, 83, 83],
        borderColor: '#06b6d4',
        backgroundColor: 'transparent',
      },
      {
        label: 'Social Studies',
        data: [82, 83, 84, 85, 84, 84],
        borderColor: '#8b5cf6',
        backgroundColor: 'transparent',
      },
      {
        label: 'Tech & Innovation',
        data: [32, 33, 34, 35, 35, 35],
        borderColor: '#ef4444',
        backgroundColor: 'transparent',
      },
      {
        label: 'Values',
        data: [70, 71, 72, 73, 72, 72],
        borderColor: '#10b981',
        backgroundColor: 'transparent',
      },
    ],
  };

  const teachingStrategiesData = {
    labels: [
      'Game Genius',
      'Power Play',
      'Body Smart Exploration',
      'Crazy Creative Combo Competition',
      'Existential Smart Exploration',
      'Curious Dropout',
    ],
    datasets: [
      {
        label: 'Effectiveness',
        data: [92, 88, 85, 82, 78, 65],
        backgroundColor: ['#10b981', '#10b981', '#10b981', '#3b82f6', '#3b82f6', '#ef4444'],
      },
    ],
  };

  const lifeStrategiesData = {
    labels: [
      'Everything you do should increase choices',
      'Ask "what would Jesus do?"',
      'Choose to trust with observation',
      'Practice improving your emotional intelligence',
    ],
    datasets: [
      {
        label: 'Impact',
        data: [92, 85, 82, 76],
        backgroundColor: ['#10b981', '#10b981', '#fbbf24', '#fbbf24'],
      },
    ],
  };

  const subjects = [
    { name: 'All Subjects', color: '#333333' },
    { name: 'Arts/Trades', color: '#ff8c00' },
    { name: 'English', color: '#9c27b0' },
    { name: 'Health', color: '#4caf50' },
    { name: 'Mathematics', color: '#2196f3' },
    { name: 'Science', color: '#009688' },
    { name: 'Social Studies', color: '#ff9800' },
    { name: 'Tech & Innovation', color: '#607d8b' },
    { name: 'Values', color: '#f44336' },
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Filter functions
  const getFilteredStrengthsGapsData = () => {
    if (subjectFilter === 'All Subjects') {
      return strengthsGapsData;
    }
    return strengthsGapsData.filter(item => item.subject === subjectFilter);
  };

  const getFilteredPerformanceTrendData = () => {
    if (subjectFilter === 'All Subjects') {
      return performanceTrendData;
    }

    // Filter datasets to show only the selected subject
    const filteredDatasets = performanceTrendData.datasets.filter(
      dataset => dataset.label === subjectFilter,
    );

    return {
      ...performanceTrendData,
      datasets: filteredDatasets,
    };
  };

  const handleSubjectFilterChange = subjectName => {
    setSubjectFilter(subjectName);
    setSubjectDropdownOpen(false);
  };

  const getStatusIcon = performance => {
    if (performance >= 85) return '🟢';
    if (performance >= 70) return '🟡';
    if (performance >= 50) return '🟠';
    return '🔴';
  };

  const getStatusText = performance => {
    if (performance >= 85) return 'Excellent';
    if (performance >= 70) return 'Good';
    if (performance >= 50) return 'Needs Improvement';
    return 'Critical';
  };

  const getStatusClass = performance => {
    if (performance >= 85) return 'excellent';
    if (performance >= 70) return 'good';
    if (performance >= 50) return 'needsImprovement';
    return 'critical';
  };

  return (
    <DashboardLayout>
      <div className={`${styles.dashboardContainer} ${darkMode ? styles.darkMode : ''}`}>
        {/* Header */}
        <div className={styles.dashboardHeader}>
          <h1 className={styles.dashboardTitle}>Analytics: Actionable Visualizations</h1>
        </div>

        <Container fluid>
          {/* Strengths & Gaps by Subject */}
          <Row className={styles.sectionRow}>
            <Col>
              <Card className={`${styles.reportCard} ${darkMode ? styles.darkMode : ''}`}>
                <CardBody>
                  <div className={styles.cardHeader}>
                    <h4 className={styles.cardTitle}>Strengths & Gaps by Subject</h4>
                    <Dropdown
                      isOpen={subjectDropdownOpen}
                      toggle={() => setSubjectDropdownOpen(!subjectDropdownOpen)}
                      className={styles.subjectDropdown}
                    >
                      <DropdownToggle caret className={styles.dropdownToggle}>
                        {subjectFilter}
                      </DropdownToggle>
                      <DropdownMenu className={styles.dropdownMenu}>
                        {subjects.map(subject => (
                          <DropdownItem
                            key={subject.name}
                            onClick={() => handleSubjectFilterChange(subject.name)}
                            className={`${styles.dropdownItem} ${styles.coloredDropdownItem}`}
                            style={{ color: subject.color }}
                          >
                            {subject.name}
                          </DropdownItem>
                        ))}
                      </DropdownMenu>
                    </Dropdown>
                  </div>

                  <div className={styles.tableContainer}>
                    <Table responsive className={styles.strengthsTable}>
                      <thead>
                        <tr>
                          <th>Subject</th>
                          <th>Performance</th>
                          <th>Status</th>
                          <th>Visual Indicator</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getFilteredStrengthsGapsData().map((item, index) => (
                          <tr key={index}>
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

                  {/* Actionable Insight 1 */}
                  <Alert color="info" className={styles.insightAlert}>
                    <div className={styles.insightContent}>
                      <strong>Actionable Insight:</strong> You consistently excel in Mathematics and
                      English. Consider focusing extra effort on Arts/Trades and Values.
                    </div>
                    <div className={styles.insightActions}>
                      <button className={styles.actionButton}>Set Target Goals</button>
                      <button className={styles.actionButton}>Study Schedule Tips</button>
                    </div>
                  </Alert>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Performance Trend by Subject Over Time */}
          <Row className={styles.sectionRow}>
            <Col>
              <Card className={`${styles.reportCard} ${darkMode ? styles.darkMode : ''}`}>
                <CardBody>
                  <div className={styles.cardHeader}>
                    <h4 className={styles.cardTitle}>Performance Trend by Subject Over Time</h4>
                    <Dropdown
                      isOpen={performanceDropdownOpen}
                      toggle={() => setPerformanceDropdownOpen(!performanceDropdownOpen)}
                      className={styles.subjectDropdown}
                    >
                      <DropdownToggle caret className={styles.dropdownToggle}>
                        {subjectFilter}
                      </DropdownToggle>
                      <DropdownMenu className={styles.dropdownMenu}>
                        {subjects.map(subject => (
                          <DropdownItem
                            key={subject.name}
                            onClick={() => handleSubjectFilterChange(subject.name)}
                            className={`${styles.dropdownItem} ${styles.coloredDropdownItem}`}
                            style={{ color: subject.color }}
                          >
                            {subject.name}
                          </DropdownItem>
                        ))}
                      </DropdownMenu>
                    </Dropdown>
                  </div>

                  <div className={styles.chartContainer}>
                    <ReportChart
                      type="line"
                      data={getFilteredPerformanceTrendData()}
                      height={400}
                      showLegend
                    />
                  </div>

                  <Alert color="warning" className={styles.insightAlert}>
                    <div className={styles.insightContent}>
                      <strong>Actionable Insight:</strong> Your performance in Mathematics shows a
                      consistent upward trend. Keep up the great work! Notice a dip in Art
                      activities during that period.
                    </div>
                    <div className={styles.insightActions}>
                      <button className={styles.actionButton}>Review Notes lesson plans</button>
                      <button className={styles.actionButton}>Get one goal for Art</button>
                    </div>
                  </Alert>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Teaching Strategies */}
          <Row className={styles.sectionRow}>
            <Col>
              <Card className={`${styles.reportCard} ${darkMode ? styles.darkMode : ''}`}>
                <CardBody>
                  <h4 className={styles.cardTitle}>Effectiveness of Teaching Strategies</h4>

                  <div className={styles.chartContainer}>
                    <ReportChart
                      type="bar"
                      data={teachingStrategiesData}
                      height={350}
                      showLegend={false}
                      horizontal
                    />
                  </div>

                  <div className={styles.legend}>
                    <div className={styles.legendItem}>
                      <span className={`${styles.legendColor} ${styles.highlyEffective}`} />
                      <span>Highly Effective (85%)</span>
                    </div>
                    <div className={styles.legendItem}>
                      <span className={`${styles.legendColor} ${styles.effective}`} />
                      <span>Effective (70-84%)</span>
                    </div>
                    <div className={styles.legendItem}>
                      <span className={`${styles.legendColor} ${styles.needsAdaptation}`} />
                      <span>Needs Adaptation (&lt;70%)</span>
                    </div>
                  </div>

                  <Alert color="success" className={styles.insightAlert}>
                    <div className={styles.insightContent}>
                      <strong>Actionable Insight:</strong> You found &apos;Game Genius&apos; and
                      &apos;Power Play&apos; particularly engaging. These strategies seem to align
                      with your learning style. Strategies like &apos;Curious Dropout&apos; might
                      require a different approach for you.
                    </div>
                    <div className={styles.insightActions}>
                      <button className={styles.actionButton}>
                        Ask teacher for more Game Genius lessons
                      </button>
                      <button className={styles.actionButton}>Explore Power Play activities</button>
                    </div>
                  </Alert>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Life Strategies */}
          <Row className={styles.sectionRow}>
            <Col>
              <Card className={`${styles.reportCard} ${darkMode ? styles.darkMode : ''}`}>
                <CardBody>
                  <h4 className={styles.cardTitle}>Impact of Life Strategies</h4>

                  <div className={styles.chartContainer}>
                    <ReportChart
                      type="bar"
                      data={lifeStrategiesData}
                      height={300}
                      showLegend={false}
                      horizontal
                    />
                  </div>

                  <div className={styles.legend}>
                    <div className={styles.legendItem}>
                      <span className={`${styles.legendColor} ${styles.veryGood}`} />
                      <span>Very Good (85%+)</span>
                    </div>
                    <div className={styles.legendItem}>
                      <span className={`${styles.legendColor} ${styles.goodImpact}`} />
                      <span>Good Impact (70-84%)</span>
                    </div>
                    <div className={styles.legendItem}>
                      <span className={`${styles.legendColor} ${styles.moderateImpact}`} />
                      <span>Moderate Impact (50-69%)</span>
                    </div>
                    <div className={styles.legendItem}>
                      <span className={`${styles.legendColor} ${styles.lowImpact}`} />
                      <span>Low Impact (&lt;50%)</span>
                    </div>
                  </div>

                  <Alert color="warning" className={styles.insightAlert}>
                    <div className={styles.insightContent}>
                      <strong>Actionable Insight:</strong> Consistently applying &apos;Everything
                      you do should increase choices&apos; seems to correlate with positive learning
                      experiences for you. Consider focusing more on &apos;Practice improving your
                      emotional intelligence&apos; to enhance your overall well-being and learning.
                    </div>
                    <div className={styles.insightActions}>
                      <button className={styles.actionButton}>
                        Learn more about choice-making strategies
                      </button>
                      <button className={styles.actionButton}>
                        Tips for emotional intelligence
                      </button>
                    </div>
                  </Alert>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </DashboardLayout>
  );
};

export default ReportsView;
