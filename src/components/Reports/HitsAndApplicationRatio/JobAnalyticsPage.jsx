import { useState, useEffect } from 'react';
import fetchJobAnalyticsData1 from './dataSample'; // Importing the sample data
import ConvertedApplicationsGraph from './ConvertedApplicationGraph';
import NonConvertedApplicationsGraph from './NonConvertedApplicationsGraph';

export default function JobAnalyticsPage() {
  const [viewMode, setViewMode] = useState('percentage'); // 'percentage' or 'actual'
  const [dateRange, setDateRange] = useState('all'); // 'weekly', 'monthly', 'yearly', 'all'
  const [jobAnalyticsData, setJobAnalyticsData] = useState([]);

  // Fetch the sample data and avoid infinite loop
  useEffect(() => {
    const initialData = fetchJobAnalyticsData1();
    setJobAnalyticsData(initialData);
  }, []); // Empty array means this effect runs only once when the component mounts

  // Handle the date range filter
  const filterDataByDateRange = (data) => {
    const today = new Date();
    return data.filter(item => {
      const itemDate = new Date(item.date);
      
      if (dateRange === 'weekly') {
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
        return itemDate >= startOfWeek && itemDate <= endOfWeek;
      }
      if (dateRange === 'monthly') {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return itemDate >= startOfMonth && itemDate <= endOfMonth;
      }
      if (dateRange === 'yearly') {
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const endOfYear = new Date(today.getFullYear(), 11, 31);
        return itemDate >= startOfYear && itemDate <= endOfYear;
      }
      return true;
    });
  };

  // Handle the date range change
  const handleDateChange = (e) => {
    setDateRange(e.target.value);
  };

  // Handle toggle between percentage and actual
  const handleToggleView = () => {
    setViewMode(viewMode === 'percentage' ? 'actual' : 'percentage');
  };

  // Only update filtered data if the dateRange changes
  const filteredData = filterDataByDateRange(jobAnalyticsData);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Job Posting Analytics</h1>

      <div className="flex gap-4 mb-6">
        <select
          value={dateRange}
          onChange={handleDateChange}
          className="border rounded p-2"
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
          <option value="all">All</option>
        </select>

        <button
          type="button"
          onClick={handleToggleView}
          className="bg-blue-500 text-white rounded px-4 py-2"
        >
          Toggle to {viewMode === 'percentage' ? 'Actual Numbers' : 'Percentage'}
        </button>
      </div>

      {/* Converted Applications Graph */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-2">Top 10 Job Postings by Conversion Rate</h2>
        <ConvertedApplicationsGraph
          data={filteredData}
          viewType={viewMode}
        />
      </div>

      {/* Non-Converted Applications Graph */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Top 10 Job Postings with Lowest Conversion Rate</h2>
        <NonConvertedApplicationsGraph
          data={filteredData}
          viewType={viewMode}
        />
      </div>
    </div>
  );
}
