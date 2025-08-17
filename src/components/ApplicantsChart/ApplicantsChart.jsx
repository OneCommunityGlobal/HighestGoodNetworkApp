import { useState, useEffect } from 'react';
import TimeFilter from './TimeFilter';
import AgeChart from './AgeChart';
import fetchApplicantsData from './api';

function ApplicantsChart() {
  const [chartData, setChartData] = useState([]);
  const [compareLabel, setCompareLabel] = useState('last week');
  const [loading, setLoading] = useState(false);

  const handleFilterChange = async filter => {
    setLoading(true);
    const data = await fetchApplicantsData(filter);
    setChartData(data);

    // For weekly/monthly/yearly → show comparison text, for custom → no comparison
    setCompareLabel(
      filter.selectedOption === 'custom'
        ? null
        : `last ${filter.selectedOption.slice(0, -2)}`
    );
    setLoading(false);
  };

  useEffect(() => {
    handleFilterChange({ selectedOption: 'weekly' });
  }, []);

  return (
    <div>
      <TimeFilter onFilterChange={handleFilterChange} />
      {loading ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '400px',
            fontSize: '18px',
            fontWeight: 500,
          }}
        >
          Loading...
        </div>
      ) : (
        <AgeChart data={chartData} compareLabel={compareLabel} />
      )}
    </div>
  );
}

export default ApplicantsChart;
