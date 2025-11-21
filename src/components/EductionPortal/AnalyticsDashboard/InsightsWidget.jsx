import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styles from './InsightsWidget.module.css';

// Constants
const FETCH_DELAY = 800;
const MIN_SCORE = 0;
const MAX_SCORE = 100;

// Mock data with better structure
const MOCK_ANALYTICS_DATA = {
  averageScore: 78.5,
  scoreChange: 5.2,
  completionRate: 87.3,
  completionChange: 3.1,
  totalStudents: 245,
  studentGrowth: 12,
  topStudents: [
    { id: 1, name: 'Alex Johnson', score: 95.8 },
    { id: 2, name: 'Maria Garcia', score: 94.2 },
    { id: 3, name: 'James Wilson', score: 92.5 },
    { id: 4, name: 'Sarah Ahmed', score: 91.0 },
    { id: 5, name: 'Michael Chen', score: 89.7 },
  ],
  topSubjects: [
    { id: 'math', name: 'Mathematics', averageScore: 88 },
    { id: 'english', name: 'English Literature', averageScore: 82 },
    { id: 'science', name: 'Science', averageScore: 85 },
    { id: 'history', name: 'History', averageScore: 79 },
    { id: 'cs', name: 'Computer Science', averageScore: 91 },
  ],
};

// Validation utilities
const validateMetrics = data => {
  if (!data || typeof data !== 'object') return false;
  const required = ['averageScore', 'completionRate', 'totalStudents'];
  return required.every(key => key in data);
};

const validateScore = score => {
  return typeof score === 'number' && score >= MIN_SCORE && score <= MAX_SCORE;
};

const InsightsWidget = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const fetchAnalyticsOverview = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      await new Promise(resolve => setTimeout(resolve, FETCH_DELAY));

      const mockData = { ...MOCK_ANALYTICS_DATA };

      if (!validateMetrics(mockData)) {
        throw new Error('Invalid metrics data structure');
      }

      if (!validateScore(mockData.averageScore) || !validateScore(mockData.completionRate)) {
        throw new Error('Invalid score values');
      }

      setMetrics(mockData);
      setRetryCount(0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching analytics:', err);

      // Auto-retry logic
      if (retryCount < MAX_RETRIES) {
        setTimeout(() => setRetryCount(prev => prev + 1), 2000);
      }
    } finally {
      setLoading(false);
    }
  }, [retryCount]);

  useEffect(() => {
    fetchAnalyticsOverview();
  }, [fetchAnalyticsOverview]);

  const sortedMetrics = useMemo(() => {
    if (!metrics) return null;
    return {
      ...metrics,
      topStudents: [...metrics.topStudents].sort((a, b) => b.score - a.score),
      topSubjects: [...metrics.topSubjects].sort((a, b) => b.averageScore - a.averageScore),
    };
  }, [metrics]);

  if (loading) {
    return <div className={styles.loading}>Loading insights...</div>;
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>Error: {error}</p>
        {retryCount < MAX_RETRIES && (
          <p className={styles.retryInfo}>
            Retry attempt {retryCount} of {MAX_RETRIES}
          </p>
        )}
        <button
          className={styles.retryButton}
          onClick={() => {
            setRetryCount(0);
            fetchAnalyticsOverview();
          }}
          aria-label="Retry loading analytics"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!sortedMetrics) return null;

  return (
    <div className={styles.insightsContainer}>
      <h2 className={styles.title}>Key Insights</h2>

      <div className={styles.metricsGrid}>
        <MetricCard
          label="Average Score"
          value={sortedMetrics.averageScore}
          trend={sortedMetrics.scoreChange}
          unit="%"
        />
        <MetricCard
          label="Completion Rate"
          value={sortedMetrics.completionRate}
          trend={sortedMetrics.completionChange}
          unit="%"
        />
        <MetricCard
          label="Total Students"
          value={sortedMetrics.totalStudents}
          trend={sortedMetrics.studentGrowth}
          isCount
        />
      </div>

      {sortedMetrics.topStudents && sortedMetrics.topStudents.length > 0 && (
        <TopPerformersSection students={sortedMetrics.topStudents} />
      )}

      {sortedMetrics.topSubjects && sortedMetrics.topSubjects.length > 0 && (
        <TopSubjectsSection subjects={sortedMetrics.topSubjects} />
      )}
    </div>
  );
};

const MetricCard = ({ label, value, trend, unit = '', isCount = false }) => {
  if (!label || value === null || value === undefined) {
    return null;
  }

  const isTrendPositive = trend > 0;
  const trendClass = isTrendPositive ? styles.positive : styles.negative;

  return (
    <div className={styles.metricCard} role="region" aria-label={label}>
      <div className={styles.metricLabel}>{label}</div>
      <div className={styles.metricValue}>
        {isCount ? value : value.toFixed(2)}
        {unit && <span className={styles.unit}>{unit}</span>}
      </div>
      <div className={`${styles.metricTrend} ${trendClass}`}>
        <span className={styles.trendIcon} aria-hidden="true">
          {isTrendPositive ? '↑' : '↓'}
        </span>
        <span className={styles.trendValue}>
          {Math.abs(trend).toFixed(2)}
          {unit}
        </span>
        <span className={styles.trendLabel}>vs last month</span>
      </div>
    </div>
  );
};

const TopPerformersSection = ({ students }) => (
  <div className={styles.topPerformersSection} role="region" aria-label="Top performing students">
    <h3 className={styles.sectionTitle}>Top Performing Students</h3>
    <ul className={styles.performersList}>
      {students.map(student => (
        <li key={student.id} className={styles.performerItem}>
          <span className={styles.name}>{student.name}</span>
          <span className={styles.score}>{student.score.toFixed(2)}</span>
        </li>
      ))}
    </ul>
  </div>
);

const TopSubjectsSection = ({ subjects }) => (
  <div className={styles.topSubjectsSection} role="region" aria-label="Top performing subjects">
    <h3 className={styles.sectionTitle}>Top Subjects</h3>
    <ul className={styles.subjectsList}>
      {subjects.map(subject => (
        <li key={subject.id} className={styles.subjectItem}>
          <span className={styles.subjectName}>{subject.name}</span>
          <div
            className={styles.progressBar}
            role="progressbar"
            aria-valuenow={subject.averageScore}
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div
              className={styles.progressFill}
              style={{ width: `${Math.min(subject.averageScore, 100)}%` }}
            />
          </div>
          <span className={styles.percentage}>{subject.averageScore.toFixed(1)}%</span>
        </li>
      ))}
    </ul>
  </div>
);

export default InsightsWidget;
