/**
 * Shared utility function to generate bar chart data for reports
 * @param {Array} groupedDate - Array of grouped data by time range
 * @param {boolean} isYear - Whether this is yearly data
 * @param {Date} startDate - Start date of the period
 * @param {Date} endDate - End date of the period
 * @param {string} dataProperty - Property name to access the data array (e.g., 'usersOfTime', 'projectsOfTime', 'teamsOfTime')
 * @returns {Array} Array of bar chart data objects with label and value
 */
export const generateBarData = (groupedDate, isYear, startDate, endDate, dataProperty) => {
  if (isYear) {
    const startMonth = startDate.getMonth();
    const endMonth = endDate.getMonth();
    const sumData = groupedDate.map(range => ({
      label: range.timeRange,
      value: range[dataProperty]?.length || 0,
      months: 12,
    }));
    if (sumData.length > 1) {
      sumData[0].months = 12 - startMonth;
      sumData[sumData.length - 1].months = endMonth + 1;
    }
    const filteredData = sumData.filter(data => data.value > 0);
    return filteredData;
  }
  return groupedDate.map(range => ({
    label: range.timeRange,
    value: range[dataProperty]?.length || 0,
  }));
};

