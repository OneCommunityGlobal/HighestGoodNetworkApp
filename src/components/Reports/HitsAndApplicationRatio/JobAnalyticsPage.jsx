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

  const textColor = isDark ? '#E5E7EB' : '#1F2937';
  const bgColor = isDark ? '#111827' : '#FFFFFF';
  const borderColor = isDark ? '#4B5563' : '#D1D5DB';

  return (
    <div
      style={{
        backgroundColor: bgColor,
        color: textColor,
        padding: '1.5rem',
        borderRadius: '0.75rem',
        transition: 'background-color 0.3s ease, color 0.3s ease',
      }}
    >
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span style={{ fontWeight: 600, color: textColor }}>Date Range:</span>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            style={{
              backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
              color: textColor,
              border: `1px solid ${borderColor}`,
              borderRadius: '0.25rem',
              padding: '0.25rem 0.5rem',
            }}
          >
            {dateOptions.map((option) => (
              <option
                key={option}
                value={option}
                style={{
                  backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                  color: textColor,
                }}
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
            style={{ color: textColor, cursor: 'pointer' }}
          >
            Show %
          </label>
        </div>
      </div>

      {loading ? (
        <p style={{ color: textColor }}>Loading analytics...</p>
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
