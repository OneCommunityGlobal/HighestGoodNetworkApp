import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import TimeFilter from './TimeFilter';
import AgeChart from './AgeChart';
import fetchApplicantsData from './api';

function ApplicantsChart() {
  const [chartData, setChartData] = useState([]);
  const [compareLabel, setCompareLabel] = useState('last week');
  const [loading, setLoading] = useState(false);

  // Grab darkMode state from Redux
  const darkMode = useSelector(state => state.theme.darkMode);

  const handleFilterChange = async filter => {
    setLoading(true);
    const data = await fetchApplicantsData(filter);
    setChartData(data);

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
      <TimeFilter onFilterChange={handleFilterChange} darkMode={darkMode} />

      {loading ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
          }}
        >
          <p
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: darkMode ? '#fff' : '#000',
            }}
          >
            Loading...
          </p>
        </div>
      ) : (
        <AgeChart data={chartData} compareLabel={compareLabel} darkMode={darkMode} />
      )}
    </div>
  );
}

export default ApplicantsChart;
