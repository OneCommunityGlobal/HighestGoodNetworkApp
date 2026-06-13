import React, { useEffect, useState, useCallback } from 'react';
import http from '../../services/httpService';
import WeeklyProgressChart from './WeeklyProgressChart';
import KpiTiles from './KpiTiles';
import Filters from './Filters';
import ProjectStatusBar from './ProjectStatusBar';
import styles from './WeeklyProgress.module.css';
import {
  getDefaultWeeklyRange,
  getLastNWeeksRange,
  validateRange,
  getWeeksBucketForRange,
} from '../../utils/weeklyRange';
import { ENDPOINTS } from '../../utils/URL';

// you can switch this to '/api' if your frontend dev server has a proxy;
// keeping the explicit 4500 here since that's what you were using.

const WeeklyProgressDashboard = () => {
  const [trends, setTrends] = useState([]);
  const [summary, setSummary] = useState(null);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [weeks, setWeeks] = useState(8);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rangeError, setRangeError] = useState('');

  const loadData = useCallback(async (start, end, weeksValue) => {
    try {
      setLoading(true);
      setError('');

      const params = {};
      if (start) params.start = start;
      if (end) params.end = end;
      if (weeksValue) params.weeks = weeksValue;

      // Axios will automatically attach Authorization (and any other defaults)
      // because httpService.setjwt(jwt) was already called elsewhere.
      const [trendsRes, summaryRes] = await Promise.all([
        http.get(ENDPOINTS.TASKS_TRENDS(), { params }),
        http.get(ENDPOINTS.TASKS_SUMMARY(), { params }),
      ]);

      console.log('WeeklyProgress responses:', {
        trendsStatus: trendsRes.status,
        summaryStatus: summaryRes.status,
      });

      setTrends(Array.isArray(trendsRes.data) ? trendsRes.data : []);
      setSummary(summaryRes.data || null);
    } catch (e) {
      // Axios-style error handling so we can see what the backend said
      if (e.response) {
        console.error('WeeklyProgressDashboard error response:', {
          status: e.response.status,
          data: e.response.data,
          url: e.response.config?.url,
        });

        if (e.response.status === 401) {
          setError('Unauthorized (401): your session may have expired. Please sign in again.');
        } else {
          setError('Failed to fetch Weekly Progress data.');
        }
      } else {
        console.error('WeeklyProgressDashboard request error:', e);
        setError('Unable to load Weekly Progress data. Please try again.');
      }

      setTrends([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const { start, end, weeks: defaultWeeks } = getDefaultWeeklyRange();
    setStartDate(start);
    setEndDate(end);
    setWeeks(defaultWeeks);
    loadData(start, end, defaultWeeks);
  }, [loadData]);

  const handlePresetRange = presetWeeks => {
    const { start, end, weeks: w } = getLastNWeeksRange(presetWeeks);
    setStartDate(start);
    setEndDate(end);
    setWeeks(w);
    setRangeError('');
    loadData(start, end, w);
  };

  const handleDateChange = ({ start, end }) => {
    const nextStart = start ?? startDate;
    const nextEnd = end ?? endDate;

    setStartDate(nextStart);
    setEndDate(nextEnd);

    if (!nextStart || !nextEnd) {
      setRangeError('');
      return;
    }

    const { valid, message } = validateRange(nextStart, nextEnd);
    if (!valid) {
      setRangeError(message);
      return;
    }

    setRangeError('');

    const bucketWeeks = getWeeksBucketForRange(nextStart, nextEnd);
    setWeeks(bucketWeeks);

    loadData(nextStart, nextEnd, bucketWeeks);
  };

  const subtitle =
    startDate && endDate
      ? `Showing data from ${startDate} to ${endDate} (${weeks} week window)`
      : '';

  return (
    <div className={styles.container}>
      <ProjectStatusBar />

      <div className={styles.header}>
        <h2 className={styles.title}>Weekly Progress</h2>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>

      <div className={styles.topRow}>
        <div className={styles.filtersWrap}>
          <Filters
            startDate={startDate}
            endDate={endDate}
            weeks={weeks}
            onDateChange={handleDateChange}
            onPresetRange={handlePresetRange}
            rangeError={rangeError}
          />
        </div>

        <div className={styles.kpiWrap}>
          <KpiTiles summary={summary} loading={loading} />
        </div>
      </div>

      <div className={styles.chartCard}>
        <WeeklyProgressChart
          data={trends}
          loading={loading}
          error={error}
          weeks={weeks}
          startDate={startDate}
          endDate={endDate}
        />
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}
    </div>
  );
};

export default WeeklyProgressDashboard;
