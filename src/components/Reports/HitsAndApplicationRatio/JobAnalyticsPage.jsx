// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import { ENDPOINTS } from '~/utils/URL';
import httpService from '~/services/httpService';
import { getDateRange, dateOptions } from './filters';
import ConvertedApplicationGraph from './ConvertedApplicationGraph';
import NonConvertedApplicationsGraph from './NonConvertedApplicationsGraph';
import styles from '../JobAnalytics/jobanalyticspage.module.css';

function JobAnalyticsPage() {
  const [convertedData, setConvertedData] = useState([]);
  const [nonConvertedData, setNonConvertedData] = useState([]);
  const [usePercentage, setUsePercentage] = useState(true);
  const [dateRange, setDateRange] = useState('All');
  const [loading, setLoading] = useState(false);

  // detect global dark mode but override layout ourselves
  const [isDark, setIsDark] = useState(
    typeof document !== 'undefined' &&
      document.body.classList.contains('dark-mode')
  );

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const observer = new MutationObserver(() => {
      setIsDark(document.body.classList.contains('dark-mode'));
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const { startDate, endDate } = getDateRange(dateRange);

    const fetchData = async () => {
      setLoading(true);

      try {
        const [topRes, leastRes] = await Promise.all([
          httpService.get(ENDPOINTS.TOP_CONVERTED(10, startDate, endDate)),
          httpService.get(ENDPOINTS.LEAST_CONVERTED(10, startDate, endDate)),
        ]);

        setConvertedData(topRes.data);
        setNonConvertedData(leastRes.data);
      } catch (err) {
        setConvertedData([]);
        setNonConvertedData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  return (
    <>
      {/* INLINE OVERRIDE: prevents global dark-mode from affecting page background */}
      <style>{`
        /* Force the Job Analytics background back to normal */
        .job-analytics-wrapper {
          background-color: #ffffff !important;
        }
        .job-analytics-wrapper.dark {
          background-color: #0b1e39 !important;
        }
      `}</style>

      <div
        className={
          `job-analytics-wrapper w-full px-4 py-6 ` +
          (isDark ? 'dark text-light' : 'text-gray-900')
        }
      >
        {/* FILTERS */}
        <div className={styles.jobAnalyticsFilters}>
          {/* Date Range */}
          <div className={styles.filterGroup}>
            <label
              htmlFor="date-range"
              className={`${styles.filterText} ${isDark ? styles.darkFilterText : ''}`}
            >
              Date Range:
            </label>

            <select
              id="date-range"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className={`${styles.dateRangeSelect} ${
                isDark ? styles.darkSelect : styles.lightSelect
              }`}
            >
              {dateOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Show % */}
          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              id="toggle-percentage"
              checked={usePercentage}
              onChange={(e) => setUsePercentage(e.target.checked)}
              className={styles.percentageCheckbox}
            />

            <label
              htmlFor="toggle-percentage"
              className={`${styles.checkboxLabel} ${
                isDark ? styles.darkFilterText : ''
              }`}
            >
              Show %
            </label>
          </div>
        </div>

        {/* GRAPHS */}
        <div
          className={`rounded-xl p-6 ${
            isDark ? 'bg-oxford-blue text-light' : 'bg-white text-gray-900'
          }`}
        >
          {loading ? (
            <p>Loading analytics...</p>
          ) : (
            <>
              <ConvertedApplicationGraph
                data={convertedData}
                usePercentage={usePercentage}
                isDark={isDark}
                dateRange={dateRange}
              />

              <div className={`my-8 border-t ${isDark ? 'border-yinmn-blue' : 'border-gray-200'}`} />

              <NonConvertedApplicationsGraph
                data={nonConvertedData}
                usePercentage={usePercentage}
                isDark={isDark}
                dateRange={dateRange}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default JobAnalyticsPage;

