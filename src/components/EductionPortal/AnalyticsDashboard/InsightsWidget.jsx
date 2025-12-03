import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import styles from './InsightsWidget.module.css';

const FETCH_DELAY = 800;
const MIN_SCORE = 0;
const MAX_SCORE = 100;

const MOCK_ANALYTICS_DATA = {
  averageScore: 78.5,
  scoreChange: 5.2,
  completionRate: 87.3,
  completionChange: 3.1,
  totalStudents: 245,
  studentGrowth: 12,
  activeStudents: 198,
  activeChange: 8,
  topStudents: [
    { id: 1, name: 'Alex Johnson', score: 95.8, avatar: 'AJ', trend: 2.5 },
    { id: 2, name: 'Maria Garcia', score: 94.2, avatar: 'MG', trend: 1.8 },
    { id: 3, name: 'James Wilson', score: 92.5, avatar: 'JW', trend: -0.5 },
    { id: 4, name: 'Sarah Ahmed', score: 91.0, avatar: 'SA', trend: 3.2 },
    { id: 5, name: 'Michael Chen', score: 89.7, avatar: 'MC', trend: 1.1 },
  ],
  topSubjects: [
    { id: 'cs', name: 'Computer Science', averageScore: 91, color: '#3b82f6', students: 45 },
    { id: 'math', name: 'Mathematics', averageScore: 88, color: '#8b5cf6', students: 52 },
    { id: 'science', name: 'Science', averageScore: 85, color: '#06b6d4', students: 48 },
    { id: 'english', name: 'English Literature', averageScore: 82, color: '#10b981', students: 50 },
    { id: 'history', name: 'History', averageScore: 79, color: '#f59e0b', students: 42 },
  ],
};

const validateMetrics = data => {
  if (!data || typeof data !== 'object') return false;
  const required = ['averageScore', 'completionRate', 'totalStudents'];
  return required.every(key => key in data);
};

const validateScore = score => {
  return typeof score === 'number' && score >= MIN_SCORE && score <= MAX_SCORE;
};

const InsightsWidget = () => {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [animateIn, setAnimateIn] = useState(false);
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
      setTimeout(() => setAnimateIn(true), 100);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching analytics:', err);

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
    return (
      <div className={`${styles.loading} ${darkMode ? styles.dark : ''}`}>
        <div className={styles.spinner}></div>
        <p>Loading insights...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.error} ${darkMode ? styles.darkError : ''}`}>
        <div className={styles.errorIcon}>⚠️</div>
        <p className={styles.errorMessage}>Error: {error}</p>
        {retryCount < MAX_RETRIES && (
          <p className={styles.retryInfo}>
            Retry attempt {retryCount} of {MAX_RETRIES}
          </p>
        )}
        <button
          className={`${styles.retryButton} ${darkMode ? styles.darkRetryButton : ''}`}
          onClick={() => {
            setRetryCount(0);
            fetchAnalyticsOverview();
          }}
          aria-label="Retry loading analytics"
        >
          <span className={styles.retryIcon}>↻</span>
          Retry
        </button>
      </div>
    );
  }

  if (!sortedMetrics) return null;

  return (
    <div
      className={`${styles.insightsContainer} ${darkMode ? styles.dark : ''} ${
        animateIn ? styles.fadeIn : ''
      }`}
    >
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>
            <span className={styles.titleIcon}>📊</span>
            Key Insights
          </h2>
          <p className={styles.subtitle}>Real-time analytics and performance metrics</p>
        </div>
        <button
          className={styles.refreshButton}
          onClick={fetchAnalyticsOverview}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fetchAnalyticsOverview();
            }
          }}
          title="Refresh data"
          aria-label="Refresh analytics data"
          type="button"
        >
          <span className={styles.refreshIcon}>↻</span>
        </button>
      </div>

      <div className={styles.metricsGrid}>
        <MetricCard
          label="Average Score"
          value={sortedMetrics.averageScore}
          trend={sortedMetrics.scoreChange}
          unit="%"
          icon="📈"
          color="#3b82f6"
          darkMode={darkMode}
        />
        <MetricCard
          label="Completion Rate"
          value={sortedMetrics.completionRate}
          trend={sortedMetrics.completionChange}
          unit="%"
          icon="✓"
          color="#10b981"
          darkMode={darkMode}
        />
        <MetricCard
          label="Total Students"
          value={sortedMetrics.totalStudents}
          trend={sortedMetrics.studentGrowth}
          icon="👥"
          color="#8b5cf6"
          isCount
          darkMode={darkMode}
        />
        <MetricCard
          label="Active Students"
          value={sortedMetrics.activeStudents}
          trend={sortedMetrics.activeChange}
          icon="🎯"
          color="#f59e0b"
          isCount
          darkMode={darkMode}
        />
      </div>

      <div className={styles.sectionsGrid}>
        {sortedMetrics.topStudents && sortedMetrics.topStudents.length > 0 && (
          <TopPerformersSection students={sortedMetrics.topStudents} darkMode={darkMode} />
        )}

        {sortedMetrics.topSubjects && sortedMetrics.topSubjects.length > 0 && (
          <TopSubjectsSection subjects={sortedMetrics.topSubjects} darkMode={darkMode} />
        )}
      </div>
    </div>
  );
};

const MetricCard = ({
  label,
  value,
  trend,
  unit = '',
  icon,
  color,
  isCount = false,
  darkMode = false,
}) => {
  if (!label || value === null || value === undefined) {
    return null;
  }

  const isTrendPositive = trend > 0;
  const trendClass = isTrendPositive ? styles.positive : styles.negative;

  return (
    <div
      className={`${styles.metricCard} ${darkMode ? styles.darkMetricCard : ''}`}
      role="region"
      aria-label={label}
      style={{ '--accent-color': color }}
    >
      <div className={styles.metricHeader}>
        <div className={styles.iconWrapper} style={{ background: `${color}15` }}>
          <span className={styles.metricIcon}>{icon}</span>
        </div>
        <div className={styles.metricLabel}>{label}</div>
      </div>
      <div className={styles.metricValue}>
        {isCount ? value.toLocaleString() : value.toFixed(1)}
        {unit && <span className={styles.unit}>{unit}</span>}
      </div>
      <div className={`${styles.metricTrend} ${trendClass}`}>
        <span className={styles.trendIcon} aria-hidden="true">
          {isTrendPositive ? '↑' : '↓'}
        </span>
        <span className={styles.trendValue}>
          {Math.abs(trend).toFixed(1)}
          {isCount ? '' : unit}
        </span>
        <span className={styles.trendLabel}>vs last month</span>
      </div>
    </div>
  );
};

const TopPerformersSection = ({ students, darkMode = false }) => (
  <div
    className={`${styles.topPerformersSection} ${darkMode ? styles.darkSection : ''}`}
    role="region"
    aria-label="Top performing students"
  >
    <h3 className={styles.sectionTitle}>
      <span className={styles.sectionIcon}>🏆</span>
      Top Performing Students
    </h3>
    <ul className={styles.performersList}>
      {students.map((student, index) => (
        <li
          key={student.id}
          className={`${styles.performerItem} ${darkMode ? styles.darkPerformerItem : ''}`}
          style={{ '--index': index }}
        >
          <div className={styles.performerRank}>
            <span className={`${styles.rankBadge} ${styles[`rank${index + 1}`]}`}>{index + 1}</span>
          </div>
          <div className={styles.performerAvatar}>{student.avatar}</div>
          <div className={styles.performerInfo}>
            <span className={styles.performerName}>{student.name}</span>
            <div className={styles.performerTrend}>
              <span className={student.trend > 0 ? styles.trendUp : styles.trendDown}>
                {student.trend > 0 ? '↑' : '↓'} {Math.abs(student.trend).toFixed(1)}%
              </span>
            </div>
          </div>
          <div className={styles.performerScore}>
            <span className={styles.scoreValue}>{student.score.toFixed(1)}</span>
            <span className={styles.scoreLabel}>Score</span>
          </div>
        </li>
      ))}
    </ul>
  </div>
);

const TopSubjectsSection = ({ subjects, darkMode = false }) => (
  <div
    className={`${styles.topSubjectsSection} ${darkMode ? styles.darkSection : ''}`}
    role="region"
    aria-label="Top performing subjects"
  >
    <h3 className={styles.sectionTitle}>
      <span className={styles.sectionIcon}>📚</span>
      Top Subjects by Performance
    </h3>
    <ul className={styles.subjectsList}>
      {subjects.map((subject, index) => (
        <li
          key={subject.id}
          className={`${styles.subjectItem} ${darkMode ? styles.darkSubjectItem : ''}`}
          style={{ '--index': index, '--subject-color': subject.color }}
        >
          <div className={styles.subjectHeader}>
            <span className={styles.subjectName}>{subject.name}</span>
            <span className={styles.subjectStudents}>{subject.students} students</span>
          </div>
          <div className={styles.progressBarContainer}>
            <div
              className={styles.progressBar}
              role="progressbar"
              aria-valuenow={subject.averageScore}
              aria-valuemin="0"
              aria-valuemax="100"
            >
              <div
                className={styles.progressFill}
                style={{
                  width: `${Math.min(subject.averageScore, 100)}%`,
                  background: subject.color,
                }}
              />
            </div>
            <span className={styles.percentage}>{subject.averageScore.toFixed(1)}%</span>
          </div>
        </li>
      ))}
    </ul>
  </div>
);

export default InsightsWidget;
