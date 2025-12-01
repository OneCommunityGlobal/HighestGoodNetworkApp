import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';
import httpService from '~/services/httpService';
import MetricCard from './MetricCard';
import ReportChart from './ReportChart';
import FilterPanel from './FilterPanel';
import { Clock, TrendingUp, Users, BookOpen } from 'lucide-react';
import styles from './AnalyticsDashboard.module.css';

const AnalyticsDashboard = () => {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overviewData, setOverviewData] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  });
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Fetch overview data
  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if token exists and ensure it's set in httpService
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please log in.');
        toast.error('Please log in to view analytics');
        setLoading(false);
        return;
      }

      // Ensure token is set in httpService (in case it wasn't initialized)
      httpService.setjwt(token);

      const params = {
        ...(selectedStudent && { studentId: selectedStudent }),
        ...(selectedClass && { classId: selectedClass }),
        ...(dateRange?.start && { startDate: dateRange.start }),
        ...(dateRange?.end && { endDate: dateRange.end }),
      };

      const url = ENDPOINTS.ANALYTICS_OVERVIEW;

      const response = await httpService.get(url, { params });

      setOverviewData(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        setError(
          'Authentication failed (401). Please ensure you are logged in and your session is valid. ' +
            'Try logging out and logging back in.',
        );
        toast.error('Authentication failed. Please log in again.');
      } else if (err.response?.status === 404) {
        const attemptedUrl = err.config?.url || url;
        setError(
          `Analytics endpoint not found (404). Attempted URL: ${attemptedUrl}. ` +
            `Please verify the backend endpoint path matches this URL, or update ` +
            `ANALYTICS_OVERVIEW in src/utils/URL.js if your backend uses a different path.`,
        );
        toast.error(`Endpoint not found: ${attemptedUrl}`);
      } else {
        setError(err.response?.data?.error || err.message || 'Failed to fetch analytics data');
        toast.error('Failed to load analytics data');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch student-specific data if student is selected
  const fetchStudentData = async () => {
    if (!selectedStudent) {
      setStudentData(null);
      return;
    }

    try {
      // Ensure token is set
      const token = localStorage.getItem('token');
      if (token) {
        httpService.setjwt(token);
      }

      const params = {
        ...(dateRange?.start && { startDate: dateRange.start }),
        ...(dateRange?.end && { endDate: dateRange.end }),
      };

      const url = ENDPOINTS.ANALYTICS_STUDENT(selectedStudent);

      const response = await httpService.get(url, { params });

      setStudentData(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error('Authentication failed. Please log in again.');
      } else if (err.response?.status === 404) {
        toast.warning('Student analytics endpoint not found.');
      } else {
        toast.error('Failed to load student analytics');
      }
    }
  };

  useEffect(() => {
    fetchOverviewData();
  }, [selectedStudent, selectedClass, dateRange]);

  useEffect(() => {
    fetchStudentData();
  }, [selectedStudent, dateRange]);

  // Extract students and classes from overview data
  useEffect(() => {
    if (overviewData?.students) {
      setStudents(overviewData.students);
    }
    if (overviewData?.classes) {
      setClasses(overviewData.classes);
    }
  }, [overviewData]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!overviewData?.timeSeriesData) return [];
    return overviewData.timeSeriesData.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      averageScore: item.averageScore || 0,
      timeSpent: item.timeSpent || 0,
      engagementRate: item.engagementRate || 0,
    }));
  }, [overviewData]);

  if (loading && !overviewData) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  if (error && !overviewData) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button className={styles.retryBtn} onClick={fetchOverviewData}>
          Retry
        </button>
      </div>
    );
  }

  const metrics = overviewData?.metrics || {};

  return (
    <div className={styles.dashboard}>
      <Container fluid>
        <div className={styles.header}>
          <h1 className={styles.title}>Analytics Overview</h1>
          <p className={styles.subtitle}>Monitor learning performance and engagement</p>
        </div>

        <FilterPanel
          selectedStudent={selectedStudent}
          setSelectedStudent={setSelectedStudent}
          selectedClass={selectedClass}
          setSelectedClass={setSelectedClass}
          dateRange={dateRange}
          setDateRange={setDateRange}
          students={students}
          classes={classes}
        />

        <Row className={styles.metricsRow}>
          <Col md={3} sm={6}>
            <MetricCard
              title="Average Score"
              value={metrics.averageScore ? `${metrics.averageScore.toFixed(1)}%` : 'N/A'}
              icon={TrendingUp}
              subtitle="Overall performance"
            />
          </Col>
          <Col md={3} sm={6}>
            <MetricCard
              title="Time Spent"
              value={
                metrics.totalTimeSpent
                  ? `${Math.floor(metrics.totalTimeSpent / 60)}h ${Math.floor(
                      metrics.totalTimeSpent % 60,
                    )}m`
                  : 'N/A'
              }
              icon={Clock}
              subtitle="Total learning time"
            />
          </Col>
          <Col md={3} sm={6}>
            <MetricCard
              title="Engagement Rate"
              value={metrics.engagementRate ? `${metrics.engagementRate.toFixed(1)}%` : 'N/A'}
              icon={Users}
              subtitle="Active participation"
            />
          </Col>
          <Col md={3} sm={6}>
            <MetricCard
              title="Total Students"
              value={metrics.totalStudents || 0}
              icon={BookOpen}
              subtitle="Enrolled learners"
            />
          </Col>
        </Row>

        <Row className={styles.chartsRow}>
          <Col md={6}>
            <ReportChart
              data={chartData}
              type="line"
              title="Average Scores Over Time"
              dataKey="averageScore"
            />
          </Col>
          <Col md={6}>
            <ReportChart
              data={chartData}
              type="line"
              title="Time Spent Over Time"
              dataKey="timeSpent"
            />
          </Col>
          <Col md={12}>
            <ReportChart
              data={chartData}
              type="bar"
              title="Engagement Rate Over Time"
              dataKey="engagementRate"
            />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AnalyticsDashboard;
