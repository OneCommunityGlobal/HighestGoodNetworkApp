import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import styles from './DemandOverTime.module.css';
import VillageDemandChart from './VillageDemandChart';
import PropertyDemandChart from './PropertyDemandChart';

function randomInt(min, max) {
  const range = max - min + 1;
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    if (range <= 256) {
      const arr = new Uint8Array(1);
      const limit = 256 - (256 % range);
      let r;
      do {
        crypto.getRandomValues(arr);
        r = arr[0];
      } while (r >= limit);
      return min + (r % range);
    } else {
      const arr = new Uint32Array(1);
      const MAX = 0x100000000; // 2^32
      const limit = MAX - (MAX % range);
      let r;
      do {
        crypto.getRandomValues(arr);
        r = arr[0];
      } while (r >= limit);
      return min + (r % range);
    }
  }
  return 0;
}

const DemandOverTime = ({
  compareType = 'villages',
  metric = 'pageVisits',
  darkMode,
  chartLabel,
  dateRange,
}) => {
  const [data, setData] = useState([]);

  useEffect(() => {
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
          value: randomInt(20, 119),
        })),
      }));
    };

    setTimeout(() => setData(generateDummyData()), 300);
  }, [compareType, metric, dateRange]);

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

DemandOverTime.propTypes = {
  compareType: PropTypes.string,
  metric: PropTypes.string,
  darkMode: PropTypes.bool,
  chartLabel: PropTypes.string,
  dateRange: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default DemandOverTime;
