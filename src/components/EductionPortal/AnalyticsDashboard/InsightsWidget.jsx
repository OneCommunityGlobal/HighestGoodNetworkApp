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
    { id: 'cs', name: 'Computer Science', averageScore: 91, color: '#10b981', students: 45 },
    { id: 'math', name: 'Mathematics', averageScore: 88, color: '#10b981', students: 52 },
    { id: 'science', name: 'Science', averageScore: 85, color: '#fbbf24', students: 48 },
    { id: 'english', name: 'English Literature', averageScore: 82, color: '#fbbf24', students: 50 },
    { id: 'history', name: 'History', averageScore: 79, color: '#ef4444', students: 42 },
  ],
  lifeStrategies: [
    {
      id: 1,
      strategy: 'Everything you do should increase choices',
      impact: 92,
      color: '#10b981',
      changeType: 'high',
    },
    {
      id: 2,
      strategy: 'Ask "what would Love do?"',
      impact: 88,
      color: '#10b981',
      changeType: 'good',
    },
    {
      id: 3,
      strategy: 'Choose to lead with observation',
      impact: 76,
      color: '#d1d5db',
      changeType: 'moderate',
    },
    {
      id: 4,
      strategy: 'Practice improving your emotional intelligence',
      impact: 79,
      color: '#fbbf24',
      changeType: 'moderate',
    },
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

      // eslint-disable-next-line no-console
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
          <h2 className={styles.title}>Key Insights</h2>
          <p className={styles.subtitle}>Automatically generated performance insights and trends</p>
        </div>
        <button
          className={styles.refreshButton}
          onClick={fetchAnalyticsOverview}
          title="Refresh data"
          aria-label="Refresh analytics data"
          type="button"
        >
          <span className={styles.refreshIcon}>↻</span>
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className={styles.summaryCards}>
        <SummaryCard
          title="Average Score"
          value={sortedMetrics.averageScore}
          change={sortedMetrics.scoreChange}
          unit="%"
          darkMode={darkMode}
        />
        <SummaryCard
          title="Completion Rate"
          value={sortedMetrics.completionRate}
          change={sortedMetrics.completionChange}
          unit="%"
          darkMode={darkMode}
        />
        <SummaryCard
          title="Total Students"
          value={sortedMetrics.totalStudents}
          change={sortedMetrics.studentGrowth}
          isCount
          darkMode={darkMode}
        />
        <SummaryCard
          title="Active Students"
          value={sortedMetrics.activeStudents}
          change={sortedMetrics.activeChange}
          isCount
          darkMode={darkMode}
        />
      </div>

      {/* Main Content Grid */}
      <div className={styles.contentGrid}>
        {/* Top Performers */}
        {sortedMetrics.topStudents && sortedMetrics.topStudents.length > 0 && (
          <div className={`${styles.insightPanel} ${darkMode ? styles.darkPanel : ''}`}>
            <h3 className={styles.panelTitle}>Top Performing Students</h3>
            <div className={styles.performersList}>
              {sortedMetrics.topStudents.map((student, index) => (
                <div key={student.id} className={styles.performerItem}>
                  <div className={styles.performerRank}>{index + 1}</div>
                  <div className={styles.performerInfo}>
                    <span className={styles.performerName}>{student.name}</span>
                    <div className={styles.performerMeta}>
                      <span className={styles.performerScore}>{student.score.toFixed(1)}%</span>
                      <span
                        className={student.trend > 0 ? styles.trendPositive : styles.trendNegative}
                      >
                        {student.trend > 0 ? '↑' : '↓'} {Math.abs(student.trend).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Life Strategies Impact */}
        {sortedMetrics.lifeStrategies && sortedMetrics.lifeStrategies.length > 0 && (
          <div className={`${styles.insightPanel} ${darkMode ? styles.darkPanel : ''}`}>
            <h3 className={styles.panelTitle}>Impact of Life Strategies</h3>
            <div className={styles.strategiesList}>
              {sortedMetrics.lifeStrategies.map(strategy => (
                <div key={strategy.id} className={styles.strategyItem}>
                  <div className={styles.strategyLabel}>{strategy.strategy}</div>
                  <div className={styles.strategyBar}>
                    <div
                      className={styles.strategyFill}
                      style={{
                        width: `${strategy.impact}%`,
                        backgroundColor: strategy.color,
                      }}
                    />
                  </div>
                  <div className={styles.strategyValue}>{strategy.impact}%</div>
                </div>
              ))}
            </div>
            <div className={styles.strategyLegend}>
              <span className={styles.legendItem}>
                <span className={styles.legendDot} style={{ backgroundColor: '#10b981' }} />
                High Impact (90+)
              </span>
              <span className={styles.legendItem}>
                <span className={styles.legendDot} style={{ backgroundColor: '#10b981' }} />
                Good Result (80-89)
              </span>
              <span className={styles.legendItem}>
                <span className={styles.legendDot} style={{ backgroundColor: '#fbbf24' }} />
                Moderate Impact (70-79)
              </span>
              <span className={styles.legendItem}>
                <span className={styles.legendDot} style={{ backgroundColor: '#ef4444' }} />
                Low Impact (&lt;70)
              </span>
            </div>
            <div className={styles.insightNote}>
              <strong>Actionable Insight:</strong> Consistently applying &ldquo;Everything you do
              should increase choices&rdquo; means up to 9x lift. Therefore, observing one&apos;s
              choices and remaining...
              <button className={styles.learnMoreButton}>
                Take the emotional intelligence course →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SummaryCard = ({ title, value, change, unit = '', isCount = false, darkMode = false }) => {
  if (!title || value === null || value === undefined) {
    return null;
  }

  const isPositive = change > 0;

  return (
    <div className={`${styles.summaryCard} ${darkMode ? styles.darkSummaryCard : ''}`}>
      <div className={styles.cardTitle}>{title}</div>
      <div className={styles.cardValue}>
        {isCount ? value.toLocaleString() : value.toFixed(1)}
        {unit && <span className={styles.cardUnit}>{unit}</span>}
      </div>
      <div
        className={`${styles.cardChange} ${
          isPositive ? styles.changePositive : styles.changeNegative
        }`}
      >
        <span className={styles.changeIcon}>{isPositive ? '↑' : '↓'}</span>
        <span className={styles.changeText}>
          {isPositive ? '+' : ''}
          {change.toFixed(1)}
          {isCount ? '' : unit} this month
        </span>
      </div>
    </div>
  );
};

export default InsightsWidget;
