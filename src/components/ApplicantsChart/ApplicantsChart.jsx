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
        padding: '1rem',
        borderRadius: '8px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Filter always stays on top */}
      <div style={{ marginBottom: '1rem' }}>
        <TimeFilter onFilterChange={handleFilterChange} />
      </div>

      {/* Content (loading state OR chart) */}
      <div
        style={{
          flex: 1, // take remaining space
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
        }}
      >
        {loading ? (
          <div
            style={{
              fontSize: 'clamp(16px, 2vw, 20px)', // responsive text sizing
              fontWeight: 500,
              color: darkMode ? '#fff' : '#000',
              textAlign: 'center',
            }}
          >
            Loading...
          </div>
        ) : (
          <div style={{ width: '100%', maxWidth: '1200px' }}>
            <AgeChart data={chartData} compareLabel={compareLabel} darkMode={darkMode} />
          </div>
        )}
      </div>
    </div>
  );
}

export default ApplicantsChart;
