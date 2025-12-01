import React from 'react';
import { Container, Row, Col } from 'reactstrap';
import styles from './AnalyticsDashboard.module.css';

const FilterPanel = ({
  selectedStudent,
  setSelectedStudent,
  selectedClass,
  setSelectedClass,
  dateRange,
  setDateRange,
  students = [],
  classes = [],
}) => {
  return (
    <div className={styles.filterPanel}>
      <Container fluid>
        <Row className={styles.filterRow}>
          <Col md={3} sm={6} className={styles.filterGroup}>
            <label htmlFor="student-filter" className={styles.filterLabel}>
              Student
            </label>
            <select
              id="student-filter"
              className={styles.filterSelect}
              value={selectedStudent || ''}
              onChange={e => setSelectedStudent(e.target.value || null)}
            >
              <option value="">All Students</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
          </Col>
          <Col md={3} sm={6} className={styles.filterGroup}>
            <label htmlFor="class-filter" className={styles.filterLabel}>
              Class
            </label>
            <select
              id="class-filter"
              className={styles.filterSelect}
              value={selectedClass || ''}
              onChange={e => setSelectedClass(e.target.value || null)}
            >
              <option value="">All Classes</option>
              {classes.map(classItem => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.name}
                </option>
              ))}
            </select>
          </Col>
          <Col md={3} sm={6} className={styles.filterGroup}>
            <label htmlFor="start-date-filter" className={styles.filterLabel}>
              Start Date
            </label>
            <input
              id="start-date-filter"
              type="date"
              className={styles.filterInput}
              value={dateRange?.start || ''}
              onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
            />
          </Col>
          <Col md={3} sm={6} className={styles.filterGroup}>
            <label htmlFor="end-date-filter" className={styles.filterLabel}>
              End Date
            </label>
            <input
              id="end-date-filter"
              type="date"
              className={styles.filterInput}
              value={dateRange?.end || ''}
              onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
            />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default FilterPanel;
