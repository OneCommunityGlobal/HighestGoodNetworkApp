// ComparePieChart.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import { Card, CardBody, Row, Col, Button, ButtonGroup, Input, Label, FormGroup } from 'reactstrap';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import styles from '../LBDashboard.module.css';
import 'react-datepicker/dist/react-datepicker.css';

const COLORS = ['#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#FF6B35'];

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

// Sample data for different comparison types
const SAMPLE_VILLAGE_DATA = [
  { name: 'Earthbag', value: 10 },
  { name: 'Straw Bale', value: 50 },
  { name: 'Cob Village', value: 60 },
  { name: 'Tree House', value: 10 },
  { name: 'Recycle Materials', value: 70 },
];

const SAMPLE_PROPERTY_DATA = [
  { name: 'Residential Units', value: 45 },
  { name: 'Commercial Spaces', value: 25 },
  { name: 'Workshop Areas', value: 30 },
  { name: 'Common Areas', value: 15 },
  { name: 'Outdoor Spaces', value: 35 },
];

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
      style={{ fontSize: '20px', fontWeight: 'bold', textShadow: '0 0 3px rgba(0,0,0,0.3)' }}
    >
      {value}
    </text>
  );
};

// Custom label to show percentages and names OUTSIDE the pie with connecting lines
const OuterPercentLabel = ({ cx, cy, midAngle, outerRadius, percent, name }) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius * 1.25;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#555"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      style={{ fontSize: '12px', fontWeight: '500' }}
    >
      {name} {percent}%
    </text>
  );
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

const CustomLegend = ({ payload }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '12px',
      marginTop: '24px',
      padding: '0 20px',
    }}
  >
    {payload.map((entry, index) => (
      <div
        key={`legend-${index}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
        }}
      >
        <div
          style={{
            width: '14px',
            height: '14px',
            backgroundColor: entry.color,
            borderRadius: '2px',
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: '13px', color: '#333' }}>
          {entry.value}
          <span style={{ color: '#999', marginLeft: '4px' }}>{entry.payload.percent}%</span>
        </span>
      </div>
    ))}
  </div>
);

CustomLegend.propTypes = {
  payload: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      color: PropTypes.string,
      payload: PropTypes.object,
    }),
  ),
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: 'white',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        <p style={{ margin: 0, fontWeight: 'bold' }}>{payload[0].name}</p>
        <p style={{ margin: '4px 0 0 0', color: '#666' }}>Value: {payload[0].value}</p>
        <p style={{ margin: '4px 0 0 0', color: '#666' }}>
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
      await new Promise(resolve => setTimeout(resolve, 800));

      // In real implementation, make API call here
      // const response = await fetch('/api/chart-data', {
      //   method: 'POST',
      //   body: JSON.stringify(filters)
      // });
      // const data = await response.json();

      // For now, return sample data based on filters
      const data =
        filters.comparisonType === COMPARISON_OPTIONS.VILLAGES
          ? SAMPLE_VILLAGE_DATA
          : SAMPLE_PROPERTY_DATA;

      setFetchedData(data);
    } catch (err) {
      setError('Failed to load chart data. Please try again.');
      // Error is handled by setting error state
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

  return (
    <div
      className={`${styles.comparingChart} ${darkMode ? styles.darkMode : ''}`}
      role="region"
      aria-label="Interactive pie chart with filters"
    >
      {/* Screen Reader Status Updates */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {isLoading && 'Loading chart data...'}
        {error && `Error loading data: ${error}`}
        {!isLoading &&
          !error &&
          `Chart updated. Showing ${getChartTitle()} for ${metricLabel ||
            'selected metric'} from ${formatDateForDisplay(fromDate)} to ${formatDateForDisplay(
            toDate,
          )}`}
      </div>

      {/* Filters Section - Displayed Above Chart */}
      {showFilters && (
        <div
          className={`${styles.filtersContainer} ${darkMode ? styles.darkFilters : ''}`}
          style={{ marginBottom: '16px', padding: '12px 16px' }}
        >
          <Row className="g-2 align-items-end" style={{ fontSize: '13px' }}>
            {/* Date Range Filters */}
            <Col xs={12} sm={6} md={3}>
              <FormGroup style={{ marginBottom: 0 }}>
                <Label
                  className={`${styles.filterLabel} ${darkMode ? styles.darkText : ''}`}
                  htmlFor="fromDate"
                  style={{ fontSize: '12px', marginBottom: '4px' }}
                >
                  From Date
                </Label>
                <DatePicker
                  id="fromDate"
                  selected={fromDate}
                  onChange={date => handleDateChange(date, true)}
                  selectsStart
                  startDate={fromDate}
                  endDate={toDate}
                  maxDate={toDate}
                  className={`form-control ${
                    darkMode ? 'bg-dark text-light border-secondary' : ''
                  }`}
                  dateFormat="MMM dd, yyyy"
                  placeholderText="Select start date"
                  aria-label="Select start date for data range"
                />
              </FormGroup>
            </Col>

            <Col xs={12} sm={6} md={3}>
              <FormGroup style={{ marginBottom: 0 }}>
                <Label
                  className={`${styles.filterLabel} ${darkMode ? styles.darkText : ''}`}
                  htmlFor="toDate"
                  style={{ fontSize: '12px', marginBottom: '4px' }}
                >
                  To Date
                </Label>
                <DatePicker
                  id="toDate"
                  selected={toDate}
                  onChange={date => handleDateChange(date, false)}
                  selectsEnd
                  startDate={fromDate}
                  endDate={toDate}
                  minDate={fromDate}
                  maxDate={new Date()}
                  className={`form-control ${
                    darkMode ? 'bg-dark text-light border-secondary' : ''
                  }`}
                  dateFormat="MMM dd, yyyy"
                  placeholderText="Select end date"
                  aria-label="Select end date for data range"
                />
              </FormGroup>
            </Col>

            {/* Compare Villages vs Properties Dropdown */}
            <Col xs={12} sm={6} md={3}>
              <FormGroup style={{ marginBottom: 0 }}>
                <Label
                  className={`${styles.filterLabel} ${darkMode ? styles.darkText : ''}`}
                  htmlFor="compareBy"
                  style={{ fontSize: '12px', marginBottom: '4px' }}
                >
                  Compare By
                </Label>
                <Input
                  id="compareBy"
                  type="select"
                  value={comparisonType}
                  onChange={e => setComparisonType(e.target.value)}
                  className={`${darkMode ? 'bg-dark text-light border-secondary' : ''}`}
                  aria-label="Choose comparison type"
                >
                  <option value={COMPARISON_OPTIONS.VILLAGES}>Villages</option>
                  <option value={COMPARISON_OPTIONS.PROPERTIES}>Properties</option>
                </Input>
              </FormGroup>
            </Col>

            {/* Listing/Bidding Filter */}
            <Col xs={12} sm={6} md={3}>
              <FormGroup style={{ marginBottom: 0 }}>
                <Label
                  className={`${styles.filterLabel} ${darkMode ? styles.darkText : ''}`}
                  htmlFor="listingType"
                  style={{ fontSize: '12px', marginBottom: '4px' }}
                >
                  Type
                </Label>
                <Input
                  id="listingType"
                  type="select"
                  value={listingType}
                  onChange={e => setListingType(e.target.value)}
                  className={`${darkMode ? 'bg-dark text-light border-secondary' : ''}`}
                  aria-label="Select listing type filter"
                >
                  <option value={LISTING_OPTIONS.ALL}>All</option>
                  <option value={LISTING_OPTIONS.LISTING}>Listing</option>
                  <option value={LISTING_OPTIONS.BIDDING}>Bidding</option>
                </Input>
              </FormGroup>
            </Col>
          </Row>
        </div>
      )}

      {/* Chart Section */}
      <Card className={`${styles.graphCard} ${darkMode ? styles.darkCard : ''}`}>
        <CardBody>
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

          {error ? (
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
          ) : isLoading ? (
            <div className={`${styles.loadingSkeleton} ${darkMode ? styles.darkSkeleton : ''}`}>
              <div className={styles.skeletonChart}></div>
              <div className={styles.skeletonLegend}>
                <div className={styles.skeletonLegendItem}></div>
                <div className={styles.skeletonLegendItem}></div>
                <div className={styles.skeletonLegendItem}></div>
              </div>
            </div>
          ) : (
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
                    innerRadius="45%"
                    outerRadius="68%"
                    paddingAngle={3}
                    dataKey="value"
                    label={OuterPercentLabel}
                    labelLine={{
                      stroke: '#999',
                      strokeWidth: 1,
                    }}
                  >
                    {processedChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Pie
                    data={processedChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius="45%"
                    outerRadius="68%"
                    paddingAngle={3}
                    dataKey="value"
                    label={CustomLabel}
                    labelLine={false}
                    isAnimationActive={false}
                  >
                    {processedChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <text
                    x="50%"
                    y="46%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ fontSize: '16px', fill: '#666', fontWeight: '600' }}
                  >
                    Total:
                  </text>
                  <text
                    x="50%"
                    y="54%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ fontSize: '36px', fill: '#333', fontWeight: 'bold' }}
                  >
                    {total}
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
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
