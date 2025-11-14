import React, { useState, useEffect } from 'react';
import styles from './InsightsWidget.module.css';

const InsightsWidget = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalyticsOverview();
  }, []);

  const fetchAnalyticsOverview = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));

      const mockData = {
        averageScore: 78.5,
        scoreChange: 5.2,
        completionRate: 87.3,
        completionChange: 3.1,
        totalStudents: 245,
        studentGrowth: 12,
        topStudents: [
          { name: 'Alex Johnson', score: 95.8 },
          { name: 'Maria Garcia', score: 94.2 },
          { name: 'James Wilson', score: 92.5 },
          { name: 'Sarah Ahmed', score: 91.0 },
          { name: 'Michael Chen', score: 89.7 },
        ],
        topSubjects: [
          { name: 'Mathematics', averageScore: 88 },
          { name: 'English Literature', averageScore: 82 },
          { name: 'Science', averageScore: 85 },
          { name: 'History', averageScore: 79 },
          { name: 'Computer Science', averageScore: 91 },
        ],
      };

      setMetrics(mockData);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading insights...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;
  if (!metrics) return null;

  return (
    <div className={styles.insightsContainer}>
      <h2 className={styles.title}>Key Insights</h2>

      <div className={styles.metricsGrid}>
        <MetricCard
          label="Average Score"
          value={metrics.averageScore}
          trend={metrics.scoreChange}
          unit="%"
        />

        <MetricCard
          label="Completion Rate"
          value={metrics.completionRate}
          trend={metrics.completionChange}
          unit="%"
        />

        <MetricCard
          label="Total Students"
          value={metrics.totalStudents}
          trend={metrics.studentGrowth}
          isCount
        />
      </div>

      {metrics.topStudents && metrics.topStudents.length > 0 && (
        <div className={styles.topPerformersSection}>
          <h3 className={styles.sectionTitle}>Top Performing Students</h3>
          <ul className={styles.performersList}>
            {metrics.topStudents.map((student, index) => (
              <li key={index} className={styles.performerItem}>
                <span className={styles.rank}>#{index + 1}</span>
                <span className={styles.name}>{student.name}</span>
                <span className={styles.score}>{student.score.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {metrics.topSubjects && metrics.topSubjects.length > 0 && (
        <div className={styles.topSubjectsSection}>
          <h3 className={styles.sectionTitle}>Top Subjects</h3>
          <ul className={styles.subjectsList}>
            {metrics.topSubjects.map((subject, index) => (
              <li key={index} className={styles.subjectItem}>
                <span className={styles.subjectName}>{subject.name}</span>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${subject.averageScore}%` }}
                  />
                </div>
                <span className={styles.percentage}>{subject.averageScore.toFixed(1)}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const MetricCard = ({ label, value, trend, unit = '', isCount = false }) => {
  const isTrendPositive = trend > 0;
  const trendClass = isTrendPositive ? styles.positive : styles.negative;

  return (
    <div className={styles.metricCard}>
      <div className={styles.metricLabel}>{label}</div>
      <div className={styles.metricValue}>
        {isCount ? value : value.toFixed(2)}
        {unit && <span className={styles.unit}>{unit}</span>}
      </div>
      <div className={`${styles.metricTrend} ${trendClass}`}>
        <span className={styles.trendIcon}>{isTrendPositive ? '↑' : '↓'}</span>
        <span className={styles.trendValue}>
          {Math.abs(trend).toFixed(2)}
          {unit}
        </span>
        <span className={styles.trendLabel}>vs last month</span>
      </div>
    </div>
  );
};

export default InsightsWidget;
