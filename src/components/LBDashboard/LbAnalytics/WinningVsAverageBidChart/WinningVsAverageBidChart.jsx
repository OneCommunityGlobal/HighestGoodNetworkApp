import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip,
  Title as ChartTitle,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Container, Row, Col, Card, CardBody, FormGroup, Label, Button, Spinner } from 'reactstrap';
import Select from 'react-select';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ENDPOINTS } from '../../../../utils/URL';
import styles from './WinningVsAverageBidChart.module.css';

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip,
  ChartTitle,
  ChartDataLabels,
);

const LIMIT_OPTIONS = [
  { value: 5, label: '5' },
  { value: 10, label: '10' },
  { value: 20, label: '20' },
  { value: 50, label: '50' },
];

const CATEGORY_OPTIONS = [
  { value: 'property', label: 'By Property' },
  { value: 'village', label: 'By Village' },
];

const getDatePickerSlotProps = isDark => ({
  textField: {
    size: 'small',
    fullWidth: true,
    sx: isDark
      ? {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#2c2c2c',
            color: '#ffffff',
            '& fieldset': { borderColor: '#555555' },
            '&:hover fieldset': { borderColor: '#777777' },
            '&.Mui-focused fieldset': { borderColor: '#9370db' },
          },
          '& .MuiInputAdornment-root .MuiButtonBase-root': { color: '#ffffff' },
        }
      : {},
  },
  popper: {
    sx: isDark
      ? {
          '& .MuiPaper-root': { backgroundColor: '#2c2c2c', color: '#ffffff' },
          '& .MuiPickersDay-root': {
            color: '#ffffff',
            '&:hover': { backgroundColor: '#444444' },
            '&.Mui-selected': { backgroundColor: '#9370db' },
          },
          '& .MuiPickersCalendarHeader-label': { color: '#ffffff' },
          '& .MuiIconButton-root': { color: '#ffffff' },
          '& .MuiDayCalendar-weekDayLabel': { color: '#aaaaaa' },
        }
      : {},
  },
});

const WinningVsAverageBidChart = ({ darkMode = false }) => {
  // Filter states
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [category, setCategory] = useState('property');
  const [selectedVillages, setSelectedVillages] = useState([]);
  const [selectedListings, setSelectedListings] = useState([]);
  const [limit, setLimit] = useState(10);

  // Data states
  const [bidData, setBidData] = useState([]);
  const [villages, setVillages] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const latestRequestId = useRef(0);

  const fetchChartData = async () => {
    if (startDate && endDate && startDate.isAfter(endDate, 'day')) {
      setError('From Date must be on or before To Date.');
      return;
    }

    const selected = category === 'village' ? selectedVillages : selectedListings;
    const params = { category, limit };
    if (startDate) params.startDate = startDate.startOf('day').toISOString();
    if (endDate) params.endDate = endDate.endOf('day').toISOString();
    if (selected.length > 0) params.ids = selected.map(option => option.value).join(',');

    latestRequestId.current += 1;
    const requestId = latestRequestId.current;
    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.get(ENDPOINTS.LB_WINNING_VS_AVERAGE_BIDS, { params });
      if (requestId !== latestRequestId.current) return;

      setBidData(Array.isArray(data?.data) ? data.data : []);
      setVillages((data?.filters?.villages || []).map(v => ({ value: v.id, label: v.name })));
      setListings(
        (data?.filters?.listings || []).map(l => ({
          value: l.id,
          label: l.name,
          villageId: l.villageId,
        })),
      );
    } catch (err) {
      if (requestId !== latestRequestId.current) return;
      setBidData([]);
      setError(
        `Failed to load chart data: ${err.response?.data?.error || err.message || 'Unknown error'}`,
      );
    } finally {
      if (requestId === latestRequestId.current) setLoading(false);
    }
  };

  // Build Chart.js data from the backend stats
  const chartData = useMemo(() => {
    if (bidData.length === 0) return null;

    const labelColor = '#ffffff';
    const winningBidBarColor = darkMode ? '#888888' : '#555555';
    const datalabels = {
      color: labelColor,
      font: { weight: 'bold', size: 12 },
      anchor: 'center',
      align: 'center',
    };

    return {
      labels: bidData.map(item => item.name),
      datasets: [
        {
          label: 'Average Bid',
          data: bidData.map(item => item.averageBid),
          backgroundColor: '#9370db',
          borderColor: '#9370db',
          borderWidth: 0,
          datalabels,
        },
        {
          label: 'Winning Bid',
          data: bidData.map(item => item.winningBid),
          backgroundColor: winningBidBarColor,
          borderColor: winningBidBarColor,
          borderWidth: 0,
          datalabels,
        },
      ],
    };
  }, [bidData, darkMode]);

  // Chart options
  const textColor = darkMode ? '#ffffff' : '#000000';
  const gridColor = darkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(200, 200, 200, 0.3)';

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      datalabels: {
        display: true,
        formatter: value => (value === null || value === undefined ? '' : Math.round(value)),
      },
      legend: {
        position: 'top',
        labels: {
          color: textColor,
          font: {
            size: 13,
            weight: '500',
          },
          padding: 15,
          boxWidth: 15,
        },
      },
      title: {
        display: true,
        text: 'Winning Bid vs Average Bid',
        color: textColor,
        font: {
          size: 20,
          weight: 'bold',
        },
        padding: 20,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#999999',
        borderWidth: 1,
        padding: 10,
        displayColors: true,
        callbacks: {
          label: function(context) {
            if (context.parsed.y === null || context.parsed.y === undefined) {
              return `${context.dataset.label}: No confirmed winner yet`;
            }
            return `${context.dataset.label}: $${Math.round(context.parsed.y)}`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: false,
        title: {
          display: true,
          text: category === 'village' ? 'Village' : 'Listing',
          color: textColor,
          font: {
            size: 12,
            weight: 'bold',
          },
          padding: 10,
        },
        ticks: {
          color: textColor,
          font: {
            size: 11,
          },
        },
        grid: {
          display: true,
          color: gridColor,
          drawBorder: true,
        },
      },
      y: {
        stacked: false,
        beginAtZero: true,
        title: {
          display: true,
          text: 'Bid Amount in USD',
          color: textColor,
          font: {
            size: 12,
            weight: 'bold',
          },
          padding: 10,
        },
        ticks: {
          color: textColor,
          font: {
            size: 11,
          },
          callback: function(value) {
            return '$' + value;
          },
        },
        grid: {
          display: true,
          color: gridColor,
          drawBorder: true,
        },
      },
    },
  };

  // Fetch data on initial load; afterwards data refreshes only on Apply Filters
  useEffect(() => {
    fetchChartData();
  }, []);

  const handleApplyFilters = () => {
    fetchChartData();
  };

  const handleCategoryChange = selectedOption => {
    setCategory(selectedOption.value);
    // Reset selections when category changes
    setSelectedVillages([]);
    setSelectedListings([]);
  };

  const customSelectStyles = {
    control: provided => ({
      ...provided,
      backgroundColor: darkMode ? '#2c2c2c' : '#ffffff',
      borderColor: darkMode ? '#555555' : '#cccccc',
      color: darkMode ? '#ffffff' : '#000000',
    }),
    menu: provided => ({
      ...provided,
      backgroundColor: darkMode ? '#2c2c2c' : '#ffffff',
    }),
    option: (provided, state) => {
      let bgColor;
      if (state.isFocused) {
        bgColor = darkMode ? '#444444' : '#f0f0f0';
      } else {
        bgColor = darkMode ? '#2c2c2c' : '#ffffff';
      }
      return { ...provided, backgroundColor: bgColor, color: darkMode ? '#ffffff' : '#000000' };
    },
    singleValue: provided => ({
      ...provided,
      color: darkMode ? '#ffffff' : '#000000',
    }),
    multiValue: provided => ({
      ...provided,
      backgroundColor: darkMode ? '#444444' : '#e0e0e0',
    }),
    multiValueLabel: provided => ({
      ...provided,
      color: darkMode ? '#ffffff' : '#000000',
    }),
    input: provided => ({
      ...provided,
      color: darkMode ? '#ffffff' : '#000000',
    }),
  };

  return (
    <Container fluid className={`${styles.container} ${darkMode ? styles.darkContainer : ''}`}>
      <Card className={`${styles.card} ${darkMode ? styles.darkCard : ''}`}>
        <CardBody>
          {/* Filters Section */}
          <div className={styles.filtersSection}>
            <Row className="mb-2">
              {/* Date Range Filters */}
              <Col md={3}>
                <FormGroup className="mb-2">
                  <Label
                    className={darkMode ? styles.darkText : ''}
                    style={{ fontSize: '14px', marginBottom: '4px' }}
                  >
                    From Date
                  </Label>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      value={startDate}
                      onChange={setStartDate}
                      slotProps={getDatePickerSlotProps(darkMode)}
                    />
                  </LocalizationProvider>
                </FormGroup>
              </Col>

              <Col md={3}>
                <FormGroup className="mb-2">
                  <Label
                    className={darkMode ? styles.darkText : ''}
                    style={{ fontSize: '14px', marginBottom: '4px' }}
                  >
                    To Date
                  </Label>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      value={endDate}
                      onChange={setEndDate}
                      slotProps={getDatePickerSlotProps(darkMode)}
                    />
                  </LocalizationProvider>
                </FormGroup>
              </Col>

              {/* Category Filter */}
              <Col md={3}>
                <FormGroup className="mb-2">
                  <Label
                    className={darkMode ? styles.darkText : ''}
                    style={{ fontSize: '14px', marginBottom: '4px' }}
                  >
                    Category
                  </Label>
                  <Select
                    value={CATEGORY_OPTIONS.find(opt => opt.value === category)}
                    onChange={handleCategoryChange}
                    options={CATEGORY_OPTIONS}
                    styles={customSelectStyles}
                    placeholder="Select category..."
                  />
                </FormGroup>
              </Col>

              {/* Limit Filter */}
              <Col md={3}>
                <FormGroup className="mb-2">
                  <Label
                    className={darkMode ? styles.darkText : ''}
                    style={{ fontSize: '14px', marginBottom: '4px' }}
                  >
                    Number of Bids
                  </Label>
                  <Select
                    value={LIMIT_OPTIONS.find(opt => opt.value === limit)}
                    onChange={selectedOption => setLimit(selectedOption.value)}
                    options={LIMIT_OPTIONS}
                    styles={customSelectStyles}
                    placeholder="Select limit..."
                  />
                </FormGroup>
              </Col>
            </Row>

            <Row className="mb-2">
              {/* Village Multi-Select */}
              {category === 'village' && (
                <Col md={10}>
                  <FormGroup className="mb-0">
                    <Label
                      className={darkMode ? styles.darkText : ''}
                      style={{ fontSize: '14px', marginBottom: '4px' }}
                    >
                      Select Villages
                    </Label>
                    <Select
                      isMulti
                      value={selectedVillages}
                      onChange={setSelectedVillages}
                      options={villages}
                      styles={customSelectStyles}
                      placeholder="Select villages..."
                    />
                  </FormGroup>
                </Col>
              )}

              {/* Listing Multi-Select */}
              {category === 'property' && (
                <Col md={10}>
                  <FormGroup className="mb-0">
                    <Label
                      className={darkMode ? styles.darkText : ''}
                      style={{ fontSize: '14px', marginBottom: '4px' }}
                    >
                      Select Properties
                    </Label>
                    <Select
                      isMulti
                      value={selectedListings}
                      onChange={setSelectedListings}
                      options={listings}
                      styles={customSelectStyles}
                      placeholder="Select properties..."
                    />
                  </FormGroup>
                </Col>
              )}

              <Col md={2} className="d-flex align-items-end">
                <Button
                  color="primary"
                  onClick={handleApplyFilters}
                  disabled={loading}
                  className={styles.applyBtn}
                  style={{ marginBottom: '0' }}
                >
                  {loading ? <Spinner size="sm" /> : 'Apply Filters'}
                </Button>
              </Col>
            </Row>
          </div>

          {/* Chart Section */}
          <div className={styles.chartSection}>
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            {loading && (
              <div className={styles.loadingContainer}>
                <Spinner color="primary" />
                <p className={darkMode ? styles.darkText : ''}>Loading chart data...</p>
              </div>
            )}

            {!loading && chartData && (
              <div className={styles.chartContainer}>
                <Bar
                  data={chartData}
                  options={chartOptions}
                  height={400}
                  plugins={[ChartDataLabels]}
                />
              </div>
            )}

            {!loading && !chartData && (
              <div className={styles.emptyState}>
                <p className={darkMode ? styles.darkText : ''}>
                  {error
                    ? 'Unable to display the chart.'
                    : 'No bids found for the selected filters. Please adjust your filters and try again.'}
                </p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </Container>
  );
};

WinningVsAverageBidChart.propTypes = {
  darkMode: PropTypes.bool,
};

export default WinningVsAverageBidChart;
