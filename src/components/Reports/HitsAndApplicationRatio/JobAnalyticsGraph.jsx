import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import JobAnalyticsBarChart from './JobAnalyticsBarChart';
import {
  aggregateJobsByTitle,
  getChartMaxValue,
  sortJobsByMetric,
} from './jobAnalyticsUtils';

function JobAnalyticsGraph({
  data,
  usePercentage,
  isDark,
  dateRange,
  sortDirection,
  barColor,
  titlePrefix,
}) {
  const metricKey = usePercentage ? 'conversionRate' : 'applications';

  const rows = useMemo(() => {
    const aggregated = aggregateJobsByTitle(data);

    return sortJobsByMetric(
      aggregated,
      metricKey,
      sortDirection,
    ).slice(0, 10);
  }, [data, metricKey, sortDirection]);

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
      barColor={barColor}
      titlePrefix={titlePrefix}
      xDomain={xDomain}
    />
  );
}

JobAnalyticsGraph.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      hits: PropTypes.number,
      applications: PropTypes.number,
      conversionRate: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
      ]),
    }),
  ),
  usePercentage: PropTypes.bool.isRequired,
  isDark: PropTypes.bool.isRequired,
  dateRange: PropTypes.string.isRequired,
  sortDirection: PropTypes.oneOf(['ascending', 'descending']).isRequired,
  barColor: PropTypes.string.isRequired,
  titlePrefix: PropTypes.string.isRequired,
};

JobAnalyticsGraph.defaultProps = {
  data: [],
};

export default JobAnalyticsGraph;