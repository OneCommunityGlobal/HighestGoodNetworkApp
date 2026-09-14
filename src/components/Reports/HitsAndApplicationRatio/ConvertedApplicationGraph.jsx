import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import JobAnalyticsBarChart from './JobAnalyticsBarChart';
import {
  aggregateJobsByTitle,
  sortJobsByMetric,
  getChartMaxValue,
} from './jobAnalyticsUtils';

function ConvertedApplicationGraph({
  data = [],
  usePercentage,
  isDark,
  dateRange,
}) {
  const metricKey = usePercentage
    ? 'conversionRate'
    : 'applications';

  const rows = useMemo(() => {
    const aggregated = aggregateJobsByTitle(data);

    return sortJobsByMetric(
      aggregated,
      metricKey,
      'descending',
    ).slice(0, 10);
  }, [data, metricKey]);

  const xDomain = useMemo(() => {
    if (usePercentage) {
      return [0, 100];
    }

    return [0, getChartMaxValue(rows, metricKey)];
  }, [rows, metricKey, usePercentage]);

  return (
    <JobAnalyticsBarChart
      rows={rows}
      usePercentage={usePercentage}
      isDark={isDark}
      dateRange={dateRange}
      barColor="#4CAF50"
      titlePrefix="Top 10 Job Postings by"
      xDomain={xDomain}
    />
  );
}

ConvertedApplicationGraph.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      hits: PropTypes.number,
      applications: PropTypes.number,
      conversionRate: PropTypes.number,
    }),
  ),
  usePercentage: PropTypes.bool.isRequired,
  isDark: PropTypes.bool.isRequired,
  dateRange: PropTypes.string.isRequired,
};

export default ConvertedApplicationGraph;