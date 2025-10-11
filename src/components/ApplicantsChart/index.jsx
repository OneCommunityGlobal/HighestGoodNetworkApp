import { useState, useEffect } from 'react';
import TimeFilter from './TimeFilter';
import AgeChart from './AgeChart';
import fetchApplicantsData from './api';
import styles from './ApplicationChart.module.css';
import { useSelector } from 'react-redux';

function ApplicantsChart() {
  const [chartData, setChartData] = useState([]);
  const [compareLabel, setCompareLabel] = useState('last week');
  const [loading, setLoading] = useState(false);

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
    <div className={`${darkMode ? styles.darkMode : ''}`}>
      <div className={`${styles.ApplicantChart} `}>
        <TimeFilter onFilterChange={handleFilterChange} />
        {loading ? <p>Loading...</p> : <AgeChart data={chartData} compareLabel={compareLabel} />}
      </div>
    </div>
  );
}

export default ApplicantsChart;
