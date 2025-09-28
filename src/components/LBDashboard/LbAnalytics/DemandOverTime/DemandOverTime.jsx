import React, { useEffect, useState } from 'react';
import moment from 'moment';
import styles from './DemandOverTime.module.css';
import VillageDemandChart from './VillageDemandChart';
import PropertyDemandChart from './PropertyDemandChart';

const DemandOverTime = ({
  compareType = 'villages',
  metric = 'pageVisits',
  darkMode,
  chartLabel,
  dateRange,
}) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    setTimeout(() => setData(generateDummyData()), 300);
  }, [compareType, metric, dateRange]);

  const generateDummyData = () => {
    const items =
      compareType === 'villages'
        ? ['Village 1', 'Village 2', 'Village 3']
        : ['Property A', 'Property B', 'Property C', 'Property D'];

    const months = [];
    let current = moment(dateRange[0]).startOf('month');
    const end = moment(dateRange[1]).endOf('month');
    while (current <= end) {
      months.push(current.format('MMM YYYY'));
      current = current.add(1, 'month');
    }

    return items.map(item => ({
      name: item,
      data: months.map(month => ({
        month,
        value: Math.floor(Math.random() * 100) + 20,
      })),
    }));
  };

  return (
    <div className={`${styles.container} ${darkMode ? styles.darkContainer : ''}`}>
      <div className={styles.chartContainer}>
        {compareType === 'villages' ? (
          <VillageDemandChart
            data={data}
            metric={metric}
            dateRange={dateRange}
            darkMode={darkMode}
            chartLabel={chartLabel}
          />
        ) : (
          <PropertyDemandChart
            data={data}
            metric={metric}
            dateRange={dateRange}
            darkMode={darkMode}
            chartLabel={chartLabel}
          />
        )}
      </div>
    </div>
  );
};

export default DemandOverTime;
