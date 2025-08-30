import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import TimeFilter from './TimeFilter';
import AgeChart from './AgeChart';
import fetchApplicantsData from './api';

function ApplicantsChart() {
  const [chartData, setChartData] = useState([]);
  const [compareLabel, setCompareLabel] = useState('last week');
  const [loading, setLoading] = useState(false);

  // Get darkMode flag from Redux
  const darkMode = useSelector(state => state.theme.darkMode);

  const handleFilterChange = async filter => {
    setLoading(true);
    const data = await fetchApplicantsData(filter);
    setChartData(data);

    // Weekly/monthly/yearly → show comparison text, custom → no comparison
    setCompareLabel(
      filter.selectedOption === 'custom' ? null : `last ${filter.selectedOption.slice(0, -2)}`,
    );

    setLoading(false);
  };

  useEffect(() => {
    handleFilterChange({ selectedOption: 'weekly' });
  }, []);

  return (
    <div
      className={darkMode ? 'bg-oxford-blue text-light' : 'bg-white text-black'}
      style={{
        padding: '20px',
        borderRadius: '8px',
        minHeight: '100vh',
      }}
    >
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
            color: darkMode ? '#fff' : '#000',
          }}
        >
          Loading...
        </div>
      ) : (
        <AgeChart data={chartData} compareLabel={compareLabel} darkMode={darkMode} />
      )}
    </div>
  );
}

export default ApplicantsChart;
