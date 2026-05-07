// ComparePieChart.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Card, CardBody, Input, Label, FormGroup } from 'reactstrap';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import styles from '../LBDashboard.module.css';
import 'react-datepicker/dist/react-datepicker.css';

const COLORS = ['#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#FF6B35'];

// FilterSection component to reduce cognitive complexity
const FilterSection = ({
  darkMode,
  fromDate,
  toDate,
  handleDateChange,
  comparisonType,
  setComparisonType,
  listingType,
  setListingType,
}) => (
  <div
    className={`${styles.filtersContainer} ${darkMode ? styles.darkFilters : ''}`}
    style={{ marginBottom: '16px', padding: '12px 16px' }}
  >
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '8px',
        fontSize: '13px',
      }}
    >
      {/* Date Range Filters */}
      <FormGroup style={{ marginBottom: 0 }}>
        <Label
          className={`${styles.filterLabel} ${darkMode ? styles.darkText : ''}`}
          htmlFor="fromDate"
          style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}
        >
          From Date
        </Label>
        <div className={styles.datePickerWrapper}>
          <DatePicker
            id="fromDate"
            selected={fromDate}
            onChange={date => handleDateChange(date, true)}
            selectsStart
            startDate={fromDate}
            endDate={toDate}
            maxDate={toDate}
            className={`form-control ${styles.datePickerInput} ${
              darkMode ? styles.darkDatePicker : ''
            }`}
            wrapperClassName={styles.datePickerInnerWrapper}
            calendarClassName={darkMode ? styles.datePickerCalendarDark : ''}
            dateFormat="MMM dd, yyyy"
            placeholderText="Select start date"
            aria-label="Select start date for data range"
          />
          <span
            className={`${styles.datePickerChevron} ${
              darkMode ? styles.datePickerChevronDark : ''
            }`}
          />
        </div>
      </FormGroup>

      <FormGroup style={{ marginBottom: 0 }}>
        <Label
          className={`${styles.filterLabel} ${darkMode ? styles.darkText : ''}`}
          htmlFor="toDate"
          style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}
        >
          To Date
        </Label>
        <div className={styles.datePickerWrapper}>
          <DatePicker
            id="toDate"
            selected={toDate}
            onChange={date => handleDateChange(date, false)}
            selectsEnd
            startDate={fromDate}
            endDate={toDate}
            minDate={fromDate}
            maxDate={new Date()}
            className={`form-control ${styles.datePickerInput} ${
              darkMode ? styles.darkDatePicker : ''
            }`}
            wrapperClassName={styles.datePickerInnerWrapper}
            calendarClassName={darkMode ? styles.datePickerCalendarDark : ''}
            dateFormat="MMM dd, yyyy"
            placeholderText="Select end date"
            aria-label="Select end date for data range"
          />
          <span
            className={`${styles.datePickerChevron} ${
              darkMode ? styles.datePickerChevronDark : ''
            }`}
          />
        </div>
      </FormGroup>

      {/* Compare Villages vs Properties Dropdown */}
      <FormGroup style={{ marginBottom: 0 }}>
        <Label
          className={`${styles.filterLabel} ${darkMode ? styles.darkText : ''}`}
          htmlFor="compareBy"
          style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}
        >
          Compare By
        </Label>
        <Input
          id="compareBy"
          type="select"
          value={comparisonType}
          onChange={e => setComparisonType(e.target.value)}
          className={`${darkMode ? styles.darkSelect : ''}`}
          style={{ width: '100%' }}
          aria-label="Choose comparison type"
        >
          <option value={COMPARISON_OPTIONS.VILLAGES}>Villages</option>
          <option value={COMPARISON_OPTIONS.PROPERTIES}>Properties</option>
        </Input>
      </FormGroup>

      {/* Listing/Bidding Filter */}
      <FormGroup style={{ marginBottom: 0 }}>
        <Label
          className={`${styles.filterLabel} ${darkMode ? styles.darkText : ''}`}
          htmlFor="listingType"
          style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}
        >
          Type
        </Label>
        <Input
          id="listingType"
          type="select"
          value={listingType}
          onChange={e => setListingType(e.target.value)}
          className={`${darkMode ? styles.darkSelect : ''}`}
          style={{ width: '100%' }}
          aria-label="Select listing type filter"
        >
          <option value={LISTING_OPTIONS.ALL}>All</option>
          <option value={LISTING_OPTIONS.LISTING}>Listing</option>
          <option value={LISTING_OPTIONS.BIDDING}>Bidding</option>
        </Input>
      </FormGroup>
    </div>
  </div>
);

FilterSection.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  fromDate: PropTypes.instanceOf(Date).isRequired,
  toDate: PropTypes.instanceOf(Date).isRequired,
  handleDateChange: PropTypes.func.isRequired,
  comparisonType: PropTypes.string.isRequired,
  setComparisonType: PropTypes.func.isRequired,
  listingType: PropTypes.string.isRequired,
  setListingType: PropTypes.func.isRequired,
};

// Constants for filters
const COMPARISON_OPTIONS = {
  VILLAGES: 'villages',
  PROPERTIES: 'properties',
};

const LISTING_OPTIONS = {
  ALL: 'all',
  LISTING: 'listing',
  BIDDING: 'bidding',
};

// Metrics that require bidding functionality
const BIDDING_ONLY_METRICS = ['numBids', 'avgBid', 'finalPrice'];

// Sample data indexed by [comparisonType][listingType]
const SAMPLE_DATA = {
  villages: {
    all: [
      { name: 'Earthbag', value: 10 },
      { name: 'Straw Bale', value: 50 },
      { name: 'Cob Village', value: 60 },
      { name: 'Tree House', value: 10 },
      { name: 'Recycle Materials', value: 70 },
    ],
    listing: [
      { name: 'Earthbag', value: 25 },
      { name: 'Straw Bale', value: 40 },
      { name: 'Cob Village', value: 15 },
      { name: 'Tree House', value: 55 },
      { name: 'Recycle Materials', value: 30 },
    ],
    bidding: [
      { name: 'Earthbag', value: 45 },
      { name: 'Straw Bale', value: 20 },
      { name: 'Cob Village', value: 70 },
      { name: 'Tree House', value: 10 },
      { name: 'Recycle Materials', value: 35 },
    ],
  },
  properties: {
    all: [
      { name: 'Residential Units', value: 45 },
      { name: 'Commercial Spaces', value: 25 },
      { name: 'Workshop Areas', value: 30 },
      { name: 'Common Areas', value: 15 },
      { name: 'Outdoor Spaces', value: 35 },
    ],
    listing: [
      { name: 'Residential Units', value: 20 },
      { name: 'Commercial Spaces', value: 50 },
      { name: 'Workshop Areas', value: 10 },
      { name: 'Common Areas', value: 40 },
      { name: 'Outdoor Spaces', value: 30 },
    ],
    bidding: [
      { name: 'Residential Units', value: 60 },
      { name: 'Commercial Spaces', value: 10 },
      { name: 'Workshop Areas', value: 45 },
      { name: 'Common Areas', value: 25 },
      { name: 'Outdoor Spaces', value: 10 },
    ],
  },
};

// Metric-based per-item multipliers (index matches item order above)
const METRIC_ITEM_MULTIPLIERS = {
  pageVisits: [1, 1, 1, 1, 1],
  numBids: [3, 0.4, 1.3, 4.5, 0.5],
  avgRating: [4.8, 4.2, 3.5, 5, 2.5],
  avgBid: [5.5, 1.5, 7, 3, 3],
  finalPrice: [2, 6.5, 2.5, 5.5, 3.5],
  occupancyRate: [4, 3, 1.5, 6.5, 5],
  avgStay: [6, 1, 4.5, 2, 6.5],
};

// Convenience fallbacks for code that still references these names
const SAMPLE_VILLAGE_DATA = SAMPLE_DATA.villages.all;
const SAMPLE_PROPERTY_DATA = SAMPLE_DATA.properties.all;

// Label showing absolute values ON the pie slices
// Label showing absolute values ON the pie slices
const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Only show label if value is significant enough
  if (value < 5) return null;

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      style={{ fontSize: '14px', fontWeight: 'bold', textShadow: '0 0 3px rgba(0,0,0,0.3)' }}
    >
      {value}
    </text>
  );
};

// Custom label to show percentages and names OUTSIDE the pie with connecting lines
const OuterPercentLabel = ({ cx, cy, midAngle, outerRadius, percent, name, fill = '#555' }) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius * 1.18;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill={fill}
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      style={{ fontSize: '11px', fontWeight: '500' }}
    >
      {name} {percent}%
    </text>
  );
};

OuterPercentLabel.propTypes = {
  cx: PropTypes.number,
  cy: PropTypes.number,
  midAngle: PropTypes.number,
  outerRadius: PropTypes.number,
  percent: PropTypes.number,
  name: PropTypes.string,
  fill: PropTypes.string,
};

CustomLabel.propTypes = {
  cx: PropTypes.number,
  cy: PropTypes.number,
  midAngle: PropTypes.number,
  innerRadius: PropTypes.number,
  outerRadius: PropTypes.number,
  percent: PropTypes.number,
  value: PropTypes.number,
};

const CustomTooltip = ({ active, payload, darkMode }) => {
  if (active && payload?.length) {
    return (
      <div
        style={{
          backgroundColor: darkMode ? '#2C3E50' : 'white',
          padding: '10px',
          border: darkMode ? '1px solid #34495E' : '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        <p style={{ margin: 0, fontWeight: 'bold', color: darkMode ? '#fff' : '#000' }}>
          {payload[0].name}
        </p>
        <p style={{ margin: '4px 0 0 0', color: darkMode ? '#e1e1e1' : '#666' }}>
          Value: {payload[0].value}
        </p>
        <p style={{ margin: '4px 0 0 0', color: darkMode ? '#e1e1e1' : '#666' }}>
          Percentage: {payload[0].payload.percent}%
        </p>
      </div>
    );
  }
  return null;
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  darkMode: PropTypes.bool,
};

export function ComparePieChart({
  title: initialTitle,
  data: initialData,
  nameKey = 'name',
  valueKey = 'value',
  colors = COLORS,
  height = 400,
  darkMode = false,
  showMetricPill = false,
  metricLabel = '',
  selectedMetricKey = 'pageVisits',
  onMetricChange,
  availableMetrics = [],
  showFilters = true,
}) {
  // State for filters
  const [fromDate, setFromDate] = useState(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);
    return date;
  });

  const [toDate, setToDate] = useState(new Date());
  const [comparisonType, setComparisonType] = useState(COMPARISON_OPTIONS.VILLAGES);
  const [listingType, setListingType] = useState(LISTING_OPTIONS.ALL);

  // State for data loading and errors
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fetchedData, setFetchedData] = useState([]);

  // Simulate API call for data fetching
  const fetchChartData = async filters => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      // In real implementation, make API call here
      // const response = await fetch('/api/chart-data', {
      //   method: 'POST',
      //   body: JSON.stringify(filters)
      // });
      // const data = await response.json();

      const compKey =
        filters.comparisonType === COMPARISON_OPTIONS.VILLAGES ? 'villages' : 'properties';
      const listKey = filters.listingType || LISTING_OPTIONS.ALL;
      const metricKey = filters.selectedMetricKey || 'pageVisits';

      // Pick base dataset by comparisonType + listingType
      const baseData = SAMPLE_DATA[compKey][listKey] || SAMPLE_DATA[compKey].all;

      // Apply per-item metric multipliers so switching metric changes proportions
      const multipliers = METRIC_ITEM_MULTIPLIERS[metricKey] || METRIC_ITEM_MULTIPLIERS.pageVisits;
      const data = baseData.map((item, i) => ({
        ...item,
        value: Math.max(1, Math.round(item.value * (multipliers[i] ?? 1))),
      }));

      setFetchedData(data);
    } catch {
      setError('Failed to load chart data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get chart data based on filters or use provided data
  const getChartData = () => {
    if (initialData && initialData.length > 0) {
      return initialData;
    }

    if (fetchedData.length > 0) {
      return fetchedData;
    }

    // Fallback to sample data
    return comparisonType === COMPARISON_OPTIONS.VILLAGES
      ? SAMPLE_VILLAGE_DATA
      : SAMPLE_PROPERTY_DATA;
  };

  const getChartTitle = () => {
    if (initialTitle) return initialTitle;

    return comparisonType === COMPARISON_OPTIONS.VILLAGES
      ? 'Comparing Villages'
      : 'Comparing Properties';
  };

  const chartData = getChartData();
  const total = chartData.reduce((sum, item) => sum + item[valueKey], 0);

  const processedChartData = chartData.map(item => ({
    ...item,
    name: item[nameKey],
    value: item[valueKey],
    percent: ((item[valueKey] / total) * 100).toFixed(1),
  }));

  // Fetch data when filters change
  useEffect(() => {
    if (showFilters && !initialData) {
      const filters = {
        fromDate,
        toDate,
        comparisonType,
        listingType,
        selectedMetricKey,
      };
      fetchChartData(filters);
    }
  }, [fromDate, toDate, comparisonType, listingType, selectedMetricKey, showFilters, initialData]);

  const handleDateChange = (date, isFromDate) => {
    if (isFromDate) {
      setFromDate(date);
    } else {
      setToDate(date);
    }
    // In real implementation, trigger data refresh here
  };

  const formatDateForDisplay = date => {
    return moment(date).format('MMM DD, YYYY');
  };

  // Helper to generate status message for screen readers
  const getStatusMessage = () => {
    if (isLoading) return 'Loading chart data...';
    if (error) return `Error loading data: ${error}`;
    return `Chart updated. Showing ${getChartTitle()} for ${metricLabel ||
      'selected metric'} from ${formatDateForDisplay(fromDate)} to ${formatDateForDisplay(toDate)}`;
  };

  // Extract chart content rendering to reduce cognitive complexity and nested ternary
  const renderChartContent = () => {
    if (error) {
      return (
        <div className={`${styles.errorContainer} ${darkMode ? styles.darkError : ''}`}>
          <div className={styles.errorMessage}>
            <i className="fa fa-exclamation-circle" />
            <span>{error}</span>
          </div>
          <button
            className={`${styles.retryBtn} ${darkMode ? styles.darkRetryBtn : ''}`}
            onClick={() =>
              fetchChartData({
                fromDate,
                toDate,
                comparisonType,
                listingType,
                selectedMetricKey,
              })
            }
          >
            <i className="fa fa-refresh" /> Retry
          </button>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className={`${styles.loadingSkeleton} ${darkMode ? styles.darkSkeleton : ''}`}>
          <div className={styles.skeletonChart}></div>
          <div className={styles.skeletonLegend}>
            <div className={styles.skeletonLegendItem}></div>
            <div className={styles.skeletonLegendItem}></div>
            <div className={styles.skeletonLegendItem}></div>
          </div>
        </div>
      );
    }

    return (
      <div
        role="img"
        aria-label={`Pie chart showing ${getChartTitle()} data. Total value: ${total}. ${processedChartData
          .map(item => `${item.name}: ${item.value} (${item.percent}%)`)
          .join(', ')}`}
      >
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={processedChartData}
              cx="50%"
              cy="50%"
              innerRadius="38%"
              outerRadius="62%"
              paddingAngle={3}
              dataKey="value"
              label={CustomLabel}
              labelLine={false}
              isAnimationActive={false}
            >
              {processedChartData.map((entry, index) => (
                <Cell key={entry.name} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
            <text
              x="50%"
              y="45%"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{
                fontSize: '13px',
                fill: darkMode ? '#aaa' : '#666',
                fontWeight: '600',
              }}
            >
              Total:
            </text>
            <text
              x="50%"
              y="55%"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{
                fontSize: '26px',
                fill: darkMode ? '#fff' : '#333',
                fontWeight: 'bold',
              }}
            >
              {total}
            </text>
          </PieChart>
        </ResponsiveContainer>
        {/* DOM legend — immune to SVG clipping, works on any screen size */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '6px 12px',
            marginTop: '12px',
            padding: '0 4px',
          }}
        >
          {processedChartData.map((item, index) => (
            <div
              key={item.name}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
            >
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '2px',
                  backgroundColor: colors[index % colors.length],
                  flexShrink: 0,
                }}
              />
              <span style={{ color: darkMode ? '#e1e1e1' : '#333' }}>
                {item.name}
                <span style={{ color: darkMode ? '#aaa' : '#888', marginLeft: '3px' }}>
                  {item.percent}%
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section
      className={`${styles.comparingChart} ${darkMode ? styles.darkMode : ''}`}
      aria-label="Interactive pie chart with filters"
    >
      {/* Screen Reader Status Updates */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {getStatusMessage()}
      </div>

      {/* Filters Section - Displayed Above Chart */}
      {showFilters && (
        <FilterSection
          darkMode={darkMode}
          fromDate={fromDate}
          toDate={toDate}
          handleDateChange={handleDateChange}
          comparisonType={comparisonType}
          setComparisonType={setComparisonType}
          listingType={listingType}
          setListingType={setListingType}
        />
      )}

      {/* Chart Section */}
      <Card
        className={`${styles.graphCard} ${darkMode ? styles.darkCard : ''}`}
        style={{ overflow: 'visible' }}
      >
        <CardBody style={{ overflow: 'visible' }}>
          <div className={styles.graphTitle}>
            <span className={darkMode ? styles.darkText : ''}>{getChartTitle()}</span>
            {showMetricPill && metricLabel && (
              <span className={`${styles.metricPill} ${darkMode ? styles.darkMetricPill : ''}`}>
                {metricLabel}
              </span>
            )}
            {isLoading && (
              <span className={`${styles.loadingIndicator} ${darkMode ? styles.darkText : ''}`}>
                <i className="fa fa-spinner fa-spin" /> Loading...
              </span>
            )}
          </div>

          {renderChartContent()}
        </CardBody>
      </Card>
    </section>
  );
}

ComparePieChart.propTypes = {
  title: PropTypes.string,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      value: PropTypes.number,
    }),
  ),
  nameKey: PropTypes.string,
  valueKey: PropTypes.string,
  colors: PropTypes.arrayOf(PropTypes.string),
  height: PropTypes.number,
  darkMode: PropTypes.bool,
  showMetricPill: PropTypes.bool,
  metricLabel: PropTypes.string,
  selectedMetricKey: PropTypes.string,
  onMetricChange: PropTypes.func,
  availableMetrics: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ),
  showFilters: PropTypes.bool,
};
