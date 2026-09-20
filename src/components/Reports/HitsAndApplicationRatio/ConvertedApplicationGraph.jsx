import React from 'react';
import PropTypes from 'prop-types';
import JobAnalyticsGraph from './JobAnalyticsGraph';

function ConvertedApplicationGraph({
  data,
  usePercentage,
  isDark,
  dateRange,
}) {
  return (
    <JobAnalyticsGraph
      data={data}
      usePercentage={usePercentage}
      isDark={isDark}
      dateRange={dateRange}
      sortDirection="descending"
      barColor="#4CAF50"
      titlePrefix="Top 10 Job Postings by"
    />
  );
}

ConvertedApplicationGraph.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  usePercentage: PropTypes.bool.isRequired,
  isDark: PropTypes.bool.isRequired,
  dateRange: PropTypes.string.isRequired,
};

ConvertedApplicationGraph.defaultProps = {
  data: [],
};

export default ConvertedApplicationGraph;