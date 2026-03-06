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
  Nav,
  NavItem,
  NavLink,
} from 'reactstrap';
import { useSelector } from 'react-redux';
import styles from './ReportsView.module.css';
import ReportChart from './ReportChart';
import IndividualReportView from './components/IndividualReportView/IndividualReportView';
import ClassPerformanceView from './components/ClassPerformanceView/ClassPerformanceView';
import { getStatusClass, getStatusIcon, getStatusText } from './utils/statusUtils';
import {
  strengthsGapsData,
  performanceTrendData,
  teachingStrategiesData,
  lifeStrategiesData,
  subjects,
  students,
  classes,
} from './mockdata';

const ReportsView = () => {
  const [, setLoading] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState('All Subjects');
  const [subjectDropdownOpen, setSubjectDropdownOpen] = useState(false);
  const [performanceDropdownOpen, setPerformanceDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState({
    studentId: null,
    classId: null,
    subject: 'All Subjects',
    dateRange: null,
  });

  const darkMode = useSelector(state => state.theme?.darkMode || false);

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

  // Status helpers are shared via utils/statusUtils.js

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

        {/* Tab Navigation */}
        <div className={`${styles.tabNavigation}`}>
          <Nav tabs className={`${styles.navTabs}`}>
            <NavItem>
              <NavLink
                className={`${activeTab === 'overview' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={`${activeTab === 'individual' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('individual')}
              >
                Individual Student Report
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={`${activeTab === 'class' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('class')}
              >
                Class Performance
              </NavLink>
            </NavItem>
          </Nav>
        </div>

        {/* Filter Bar for Individual/Class Views */}
        {(activeTab === 'individual' || activeTab === 'class') && (
          <div className={`${styles.filterBar}`}>
            <Row>
              <Col md={6}>
                <label htmlFor="studentClassSelect">
                  {activeTab === 'individual' ? 'Select Student:' : 'Select Class:'}
                </label>
                <select
                  id="studentClassSelect"
                  className="form-control"
                  value={
                    activeTab === 'individual' ? filters.studentId || '' : filters.classId || ''
                  }
                  onChange={e => {
                    if (activeTab === 'individual') {
                      setFilters({ ...filters, studentId: e.target.value || null });
                    } else {
                      setFilters({ ...filters, classId: e.target.value || null });
                    }
                  }}
                >
                  <option value="">
                    {activeTab === 'individual' ? '-- Select a Student --' : '-- Select a Class --'}
                  </option>
                  {activeTab === 'individual'
                    ? students.map(student => (
                        <option key={student.id} value={student.id}>
                          {student.name}
                        </option>
                      ))
                    : classes.map(cls => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name}
                        </option>
                      ))}
                </select>
              </Col>
            </Row>
          </div>
        )}

        {/* Render Active Tab Content */}
        {activeTab === 'overview' && (
          <Container fluid>
            <Row className={`${styles.sectionRow}`}>
              <Col>
                <Card className={`${styles.reportCard}`}>
                  <CardBody className={styles.cardBody}>
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
                          {getFilteredStrengthsGapsData().map(item => (
                            <tr key={item.subject}>
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
                        <strong>Actionable Insight:</strong> You consistently excel in Mathematics
                        and English. Consider focusing extra effort on Arts/Trades and Values.
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
                  <CardBody className={styles.cardBody}>
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
                  <CardBody className={styles.cardBody}>
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
                  <CardBody className={styles.cardBody}>
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
                        you do should increase choices&apos; seems to correlate with positive
                        learning experiences for you. Consider focusing more on &apos;Practice
                        improving your emotional intelligence&apos; to enhance your overall
                        well-being and learning.
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
        )}

        {activeTab === 'individual' && <IndividualReportView filters={filters} />}

        {activeTab === 'class' && <ClassPerformanceView filters={filters} />}
      </div>
    </div>
  );
};

export default ReportsView;
