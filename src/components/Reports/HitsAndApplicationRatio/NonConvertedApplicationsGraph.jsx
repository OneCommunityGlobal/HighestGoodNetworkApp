import React from 'react';
import PropTypes from 'prop-types';
import JobAnalyticsGraph from './JobAnalyticsGraph';

function NonConvertedApplicationsGraph({
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
      sortDirection="ascending"
      barColor="#F44336"
      titlePrefix="Top 10 Job Postings with Lowest"
    />
  );
}

NonConvertedApplicationsGraph.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  usePercentage: PropTypes.bool.isRequired,
  isDark: PropTypes.bool.isRequired,
  dateRange: PropTypes.string.isRequired,
};

NonConvertedApplicationsGraph.defaultProps = {
  data: [],
};

export default NonConvertedApplicationsGraph;