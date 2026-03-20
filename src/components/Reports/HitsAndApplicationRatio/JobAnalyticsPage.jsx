// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import { ENDPOINTS } from '~/utils/URL';
import httpService from '~/services/httpService';
import { getDateRange, dateOptions } from './filters';
import ConvertedApplicationGraph from './ConvertedApplicationGraph';
import NonConvertedApplicationsGraph from './NonConvertedApplicationsGraph';

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
        <div className="w-full flex justify-center mt-6 mb-8">
          <div className="flex flex-wrap items-center justify-center gap-6">

            {/* Date Range */}
            <div className="flex items-center gap-2">
              <span className={isDark ? 'text-azure font-semibold' : 'font-semibold'}>
                Date Range:
              </span>

              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className={`rounded px-2 py-1 ${
                  isDark
                    ? 'bg-space-cadet text-light border border-yinmn-blue'
                    : 'bg-white text-gray-900 border border-gray-300'
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
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="toggle-percentage"
                checked={usePercentage}
                onChange={() => setUsePercentage(!usePercentage)}
              />
              <label
                htmlFor="toggle-percentage"
                className={isDark ? 'text-light cursor-pointer' : 'text-gray-900 cursor-pointer'}
              >
                Show %
              </label>
            </div>

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
              />

              <NonConvertedApplicationsGraph
                data={nonConvertedData}
                usePercentage={usePercentage}
                isDark={isDark}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default JobAnalyticsPage;

