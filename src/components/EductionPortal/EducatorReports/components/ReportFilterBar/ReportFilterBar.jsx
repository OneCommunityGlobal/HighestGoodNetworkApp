import React from 'react';
import { Row, Col, Form, FormGroup, Label, Input } from 'reactstrap';
import { useSelector } from 'react-redux';
import styles from './ReportFilterBar.module.css';

const ReportFilterBar = ({ filters, onFilterChange, activeTab }) => {
  const darkMode = useSelector(state => state.theme?.darkMode || false);

  // Mock data - in a real app, these would come from API calls
  const students = [
    { id: '1', name: 'Alex Johnson' },
    { id: '2', name: 'Sarah Williams' },
    { id: '3', name: 'Michael Brown' },
    { id: '4', name: 'Emily Davis' },
  ];

  const classes = [
    { id: '1', name: 'Grade 5A - Mathematics' },
    { id: '2', name: 'Grade 6B - Science' },
    { id: '3', name: 'Grade 4C - English' },
  ];

  const subjects = [
    { value: 'all', label: 'All Subjects' },
    { value: 'mathematics', label: 'Mathematics' },
    { value: 'science', label: 'Science' },
    { value: 'english', label: 'English' },
    { value: 'history', label: 'History' },
    { value: 'art', label: 'Art' },
    { value: 'health', label: 'Health' },
    { value: 'social-studies', label: 'Social Studies' },
    { value: 'tech-innovation', label: 'Tech & Innovation' },
    { value: 'values', label: 'Values' },
  ];

  const dateRanges = [
    { value: 'lastWeek', label: 'Last Week' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'lastQuarter', label: 'Last Quarter' },
    { value: 'lastSemester', label: 'Last Semester' },
    { value: 'lastYear', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' },
  ];

  const handleInputChange = (field, value) => {
    onFilterChange({ [field]: value });
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    // eslint-disable-next-line no-alert
    alert('Export functionality coming soon!');
  };

  return (
    <div className={`${styles.filterBar} ${darkMode ? styles.darkMode : ''}`}>
      <Form>
        <Row className={styles.filterRow}>
          {/* Student/Class Selection */}
          <Col md={3} className={styles.filterCol}>
            <FormGroup>
              <Label for={`${activeTab}Select`} className={styles.filterLabel}>
                {activeTab === 'individual' ? 'Select Student' : 'Select Class'}
              </Label>
              <Input
                type="select"
                id={`${activeTab}Select`}
                value={activeTab === 'individual' ? filters.studentId : filters.classId}
                onChange={e =>
                  handleInputChange(
                    activeTab === 'individual' ? 'studentId' : 'classId',
                    e.target.value,
                  )
                }
                className={styles.filterSelect}
              >
                <option value="">
                  {activeTab === 'individual' ? 'Choose a student...' : 'Choose a class...'}
                </option>
                {(activeTab === 'individual' ? students : classes).map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </Input>
            </FormGroup>
          </Col>

          {/* Subject Filter */}
          <Col md={3} className={styles.filterCol}>
            <FormGroup>
              <Label for="subjectSelect" className={styles.filterLabel}>
                Subject
              </Label>
              <Input
                type="select"
                id="subjectSelect"
                value={filters.subject}
                onChange={e => handleInputChange('subject', e.target.value)}
                className={styles.filterSelect}
              >
                {subjects.map(subject => (
                  <option key={subject.value} value={subject.value}>
                    {subject.label}
                  </option>
                ))}
              </Input>
            </FormGroup>
          </Col>

          {/* Date Range Filter */}
          <Col md={3} className={styles.filterCol}>
            <FormGroup>
              <Label for="dateRangeSelect" className={styles.filterLabel}>
                Date Range
              </Label>
              <Input
                type="select"
                id="dateRangeSelect"
                value={filters.dateRange}
                onChange={e => handleInputChange('dateRange', e.target.value)}
                className={styles.filterSelect}
              >
                {dateRanges.map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </Input>
            </FormGroup>
          </Col>

          {/* Action Buttons */}
          <Col md={3} className={styles.filterCol}>
            <div className={styles.actionButtons}>
              <button
                type="button"
                className={`${styles.actionBtn} ${styles.refreshBtn}`}
                onClick={() => window.location.reload()}
                title="Refresh Data"
              >
                <i className="fa fa-refresh" aria-hidden="true" />
                Refresh
              </button>
              <button
                type="button"
                className={`${styles.actionBtn} ${styles.exportBtn}`}
                onClick={handleExport}
                title="Export Report"
              >
                <i className="fa fa-download" aria-hidden="true" />
                Export
              </button>
            </div>
          </Col>
        </Row>

        {/* Custom Date Range Inputs (shown when custom is selected) */}
        {filters.dateRange === 'custom' && (
          <Row className={styles.customDateRow}>
            <Col md={3}>
              <FormGroup>
                <Label for="startDate" className={styles.filterLabel}>
                  Start Date
                </Label>
                <Input
                  type="date"
                  id="startDate"
                  className={styles.filterSelect}
                  onChange={e => handleInputChange('startDate', e.target.value)}
                />
              </FormGroup>
            </Col>
            <Col md={3}>
              <FormGroup>
                <Label for="endDate" className={styles.filterLabel}>
                  End Date
                </Label>
                <Input
                  type="date"
                  id="endDate"
                  className={styles.filterSelect}
                  onChange={e => handleInputChange('endDate', e.target.value)}
                />
              </FormGroup>
            </Col>
          </Row>
        )}
      </Form>
    </div>
  );
};

export default ReportFilterBar;
