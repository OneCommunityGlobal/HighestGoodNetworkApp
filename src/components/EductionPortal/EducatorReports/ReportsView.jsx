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
import styles from './ReportsView.module.css';
import ReportChart from './ReportChart';
import {
  strengthsGapsData,
  performanceTrendData,
  teachingStrategiesData,
  lifeStrategiesData,
  subjects,
} from './mockdata';

const ReportsView = () => {
  const [loading, setLoading] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState('All Subjects');
  const [subjectDropdownOpen, setSubjectDropdownOpen] = useState(false);
  const [performanceDropdownOpen, setPerformanceDropdownOpen] = useState(false);

  const darkMode = useSelector(state => state.theme?.darkMode || false);
  const authUser = useSelector(state => state.auth.user);

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

  return (
    <div className={`${darkMode ? styles.darkMode : ''}`}>
      <div className={`${styles.dashboardContainer}`}>
        {/* Header */}
        <div className={`${styles.dashboardHeader}`}>
          <h1 className={`${styles.dashboardTitle}`}>Analytics: Actionable Visualizations</h1>
        </div>

        <Container fluid>
          {/* Strengths & Gaps by Subject */}
          <Row className={`${styles.sectionRow}`}>
            <Col>
              <Card className={`${styles.reportCard}`}>
                <CardBody>
                  <div className={`${styles.cardHeader}`}>
                    <h4 className={`${styles.cardTitle}`}>Strengths & Gaps by Subject</h4>
                    <Dropdown
                      isOpen={subjectDropdownOpen}
                      toggle={() => setSubjectDropdownOpen(!subjectDropdownOpen)}
                      className={`${styles.subjectDropdown}`}
                    >
                      <DropdownToggle caret className={`${styles.dropdownToggle}`}>
                        {subjectFilter}
                      </DropdownToggle>
                      <DropdownMenu className={`${styles.dropdownMenu}`}>
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

                  <div className={`${styles.tableContainer}`}>
                    <Table responsive className={`${styles.strengthsTable}`}>
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
                            <td className={`${styles.subjectCell}`}>{item.subject}</td>
                            <td className={`${styles.performanceCell}`}>
                              <div className={`${styles.performanceBar}`}>
                                <div
                                  className={`${styles.performanceFill}`}
                                  style={{
                                    width: `${item.performance}%`,
                                    backgroundColor: item.color,
                                  }}
                                />
                                <span className={`${styles.performanceText}`}>
                                  {item.performance}%
                                </span>
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
                            <td className={`${styles.visualCell}`}>
                              <span className={`${styles.visualIndicator}`}>
                                {getStatusIcon(item.performance)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>

                  {/* Actionable Insight 1 */}
                  <Alert
                    color="info"
                    className={`${styles.insightAlert} ${getInsightAlertVariantClass('info')}`}
                  >
                    <div className={`${styles.insightContent}`}>
                      <strong>Actionable Insight:</strong> You consistently excel in Mathematics and
                      English. Consider focusing extra effort on Arts/Trades and Values.
                    </div>
                    <div className={`${styles.insightActions}`}>
                      <button className={`${styles.actionButton}`}>Set Target Goals</button>
                      <button className={`${styles.actionButton}`}>Study Schedule Tips</button>
                    </div>
                  </Alert>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Performance Trend by Subject Over Time */}
          <Row className={`${styles.sectionRow}`}>
            <Col>
              <Card className={`${styles.reportCard}`}>
                <CardBody>
                  <div className={`${styles.cardHeader}`}>
                    <h4 className={`${styles.cardTitle}`}>
                      Performance Trend by Subject Over Time
                    </h4>
                    <Dropdown
                      isOpen={performanceDropdownOpen}
                      toggle={() => setPerformanceDropdownOpen(!performanceDropdownOpen)}
                      className={`${styles.subjectDropdown}`}
                    >
                      <DropdownToggle caret className={`${styles.dropdownToggle}`}>
                        {subjectFilter}
                      </DropdownToggle>
                      <DropdownMenu className={`${styles.dropdownMenu}`}>
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

                  <div className={`${styles.chartContainer}`}>
                    <ReportChart
                      type="line"
                      data={getFilteredPerformanceTrendData()}
                      height={400}
                      showLegend
                    />
                  </div>

                  <Alert
                    color="warning"
                    className={`${styles.insightAlert} ${getInsightAlertVariantClass('warning')}`}
                  >
                    <div className={`${styles.insightContent}`}>
                      <strong>Actionable Insight:</strong> Your performance in Mathematics shows a
                      consistent upward trend. Keep up the great work! Notice a dip in Art
                      activities during that period.
                    </div>
                    <div className={`${styles.insightActions}`}>
                      <button className={`${styles.actionButton}`}>
                        Review Notes lesson plans
                      </button>
                      <button className={`${styles.actionButton}`}>Get one goal for Art</button>
                    </div>
                  </Alert>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Teaching Strategies */}
          <Row className={`${styles.sectionRow}`}>
            <Col>
              <Card className={`${styles.reportCard}`}>
                <CardBody>
                  <h4 className={`${styles.cardTitle}`}>Effectiveness of Teaching Strategies</h4>

                  <div className={`${styles.chartContainer}`}>
                    <ReportChart
                      type="bar"
                      data={teachingStrategiesData}
                      height={350}
                      showLegend={false}
                      horizontal
                    />
                  </div>

                  <div className={`${styles.legend}`}>
                    <div className={`${styles.legendItem}`}>
                      <span className={`${styles.legendColor} ${styles.highlyEffective}`} />
                      <span>Highly Effective (85%)</span>
                    </div>
                    <div className={`${styles.legendItem}`}>
                      <span className={`${styles.legendColor} ${styles.effective}`} />
                      <span>Effective (70-84%)</span>
                    </div>
                    <div className={`${styles.legendItem}`}>
                      <span className={`${styles.legendColor} ${styles.needsAdaptation}`} />
                      <span>Needs Adaptation (&lt;70%)</span>
                    </div>
                  </div>

                  <Alert
                    color="success"
                    className={`${styles.insightAlert} ${getInsightAlertVariantClass('success')}`}
                  >
                    <div className={`${styles.insightContent}`}>
                      <strong>Actionable Insight:</strong> You found &apos;Game Genius&apos; and
                      &apos;Power Play&apos; particularly engaging. These strategies seem to align
                      with your learning style. Strategies like &apos;Curious Dropout&apos; might
                      require a different approach for you.
                    </div>
                    <div className={`${styles.insightActions}`}>
                      <button className={`${styles.actionButton}`}>
                        Ask teacher for more Game Genius lessons
                      </button>
                      <button className={`${styles.actionButton}`}>
                        Explore Power Play activities
                      </button>
                    </div>
                  </Alert>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Life Strategies */}
          <Row className={`${styles.sectionRow}`}>
            <Col>
              <Card className={`${styles.reportCard}`}>
                <CardBody>
                  <h4 className={`${styles.cardTitle}`}>Impact of Life Strategies</h4>

                  <div className={`${styles.chartContainer}`}>
                    <ReportChart
                      type="bar"
                      data={lifeStrategiesData}
                      height={300}
                      showLegend={false}
                      horizontal
                    />
                  </div>

                  <div className={`${styles.legend}`}>
                    <div className={`${styles.legendItem}`}>
                      <span className={`${styles.legendColor} ${styles.veryGood}`} />
                      <span>Very Good (85%+)</span>
                    </div>
                    <div className={`${styles.legendItem}`}>
                      <span className={`${styles.legendColor} ${styles.goodImpact}`} />
                      <span>Good Impact (70-84%)</span>
                    </div>
                    <div className={`${styles.legendItem}`}>
                      <span className={`${styles.legendColor} ${styles.moderateImpact}`} />
                      <span>Moderate Impact (50-69%)</span>
                    </div>
                    <div className={`${styles.legendItem}`}>
                      <span className={`${styles.legendColor} ${styles.lowImpact}`} />
                      <span>Low Impact (&lt;50%)</span>
                    </div>
                  </div>

                  <Alert
                    color="warning"
                    className={`${styles.insightAlert} ${getInsightAlertVariantClass('warning')}`}
                  >
                    <div className={`${styles.insightContent}`}>
                      <strong>Actionable Insight:</strong> Consistently applying &apos;Everything
                      you do should increase choices&apos; seems to correlate with positive learning
                      experiences for you. Consider focusing more on &apos;Practice improving your
                      emotional intelligence&apos; to enhance your overall well-being and learning.
                    </div>
                    <div className={`${styles.insightActions}`}>
                      <button className={`${styles.actionButton}`}>
                        Learn more about choice-making strategies
                      </button>
                      <button className={`${styles.actionButton}`}>
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
    </div>
  );
};

export default ReportsView;
