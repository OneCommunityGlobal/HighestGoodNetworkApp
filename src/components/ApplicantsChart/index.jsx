import { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import TimeFilter from './TimeFilter';
import AgeChart from './AgeChart';
import fetchApplicantsData from './api';

function ApplicantsChart({ theme }) {
  const [chartData, setChartData] = useState([]);
  const [compareLabel, setCompareLabel] = useState('last week');
  const [loading, setLoading] = useState(false);

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

  // Support both object and string theme state
  const darkMode = theme?.darkMode ?? theme === 'dark';

  return (
    <div
      style={{
        background: darkMode ? '#1b2a41' : '#f8f9fa',
        minHeight: '100vh',
        padding: '40px 0',
        transition: 'background 0.3s',
      }}
    >
      <TimeFilter onFilterChange={handleFilterChange} darkMode={darkMode} />
      {loading ? (
        <p style={{ color: darkMode ? '#fff' : '#222', textAlign: 'center', marginTop: 40 }}>
          Loading...
        </p>
      ) : (
        <AgeChart data={chartData} compareLabel={compareLabel} darkMode={darkMode} />
      )}
    </div>
  );
}

const mapStateToProps = state => ({
  theme: state.theme,
});

export default connect(mapStateToProps)(ApplicantsChart);
