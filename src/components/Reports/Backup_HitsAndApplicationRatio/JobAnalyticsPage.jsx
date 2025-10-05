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

  useEffect(() => {
    const { startDate, endDate } = getDateRange(dateRange);
// eslint-disable-next-line no-console
console.log(`Fetching data for range: startDate=${startDate}, endDate=${endDate}`);
    const fetchData = async () => {
      setLoading(true);
      // eslint-disable-next-line no-console
      console.log('Fetching top converted URL:', ENDPOINTS.TOP_CONVERTED(10, startDate, endDate));
// eslint-disable-next-line no-console
console.log('Fetching least converted URL:', ENDPOINTS.LEAST_CONVERTED(10, startDate, endDate));

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
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Date Range:</span>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border rounded px-2 py-1"
          >
            {dateOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
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
          <label htmlFor="toggle-percentage" className="cursor-pointer">Show %</label>
        </div>
      </div>

      {loading ? (
        <p>Loading analytics...</p>
      ) : (
        <>
          <ConvertedApplicationGraph data={convertedData} usePercentage={usePercentage} />
          <NonConvertedApplicationsGraph data={nonConvertedData} usePercentage={usePercentage} />
        </>
      )}
    </div>
  );
}

export default JobAnalyticsPage;