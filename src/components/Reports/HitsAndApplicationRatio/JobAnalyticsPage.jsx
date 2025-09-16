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

  // detect dark mode
  const [isDark, setIsDark] = useState(
    typeof document !== 'undefined' && document.querySelector('.dark-mode') !== null
  );

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const targetNode = document.body;
    const observer = new MutationObserver(() => {
      const darkActive = document.querySelector('.dark-mode') !== null;
      setIsDark(darkActive);
    });

    observer.observe(targetNode, { attributes: true, subtree: true, attributeFilter: ['class'] });

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
        // eslint-disable-next-line no-console
        console.error('Error fetching job analytics:', err);
        setConvertedData([]);
        setNonConvertedData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  return (
    <div
      className={`p-6 rounded-xl transition-colors duration-300 ${
        isDark
          ? 'bg-oxford-blue text-light boxStyleDark'
          : 'bg-white text-gray-900 boxStyle'
      }`}
    >
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className={isDark ? 'text-azure font-semibold' : 'font-semibold'}>
            Date Range:
          </span>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className={`rounded px-2 py-1 ${
              isDark ? 'bg-space-cadet text-light border border-yinmn-blue' : 'bg-white text-gray-900 border border-gray-300'
            }`}
          >
            {dateOptions.map((option) => (
              <option
                key={option}
                value={option}
                className={isDark ? 'bg-space-cadet text-light' : 'bg-white text-gray-900'}
              >
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="ml-auto flex items-center gap-2">
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

      {loading ? (
        <p className={isDark ? 'text-light' : 'text-gray-900'}>Loading analytics...</p>
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
  );
}

export default JobAnalyticsPage;
