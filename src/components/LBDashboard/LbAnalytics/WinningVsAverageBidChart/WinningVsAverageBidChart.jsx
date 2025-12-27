import React, { useState, useEffect } from 'react';
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
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  FormGroup,
  Label,
  Input,
  Button,
  Spinner,
} from 'reactstrap';
import Select from 'react-select';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
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

const WinningVsAverageBidChart = ({ darkMode = false }) => {
  // Filter states
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [category, setCategory] = useState('property');
  const [selectedVillages, setSelectedVillages] = useState([]);
  const [selectedListings, setSelectedListings] = useState([]);
  const [limit, setLimit] = useState(10);

  // Data states
  const [chartData, setChartData] = useState(null);
  const [villages, setVillages] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize with mock data for villages and listings
  useEffect(() => {
    // Mock villages data (expanded to support up to 20 items)
    const mockVillages = [
      { value: '1', label: 'Eco Village' },
      { value: '2', label: 'Forest Retreat' },
      { value: '3', label: 'Desert Oasis' },
      { value: '4', label: 'River Valley' },
      { value: '5', label: 'City Sanctuary' },
      { value: '6', label: 'Mountain Haven' },
      { value: '7', label: 'Coastal Community' },
      { value: '8', label: 'Lake District' },
      { value: '9', label: 'Prairie Settlement' },
      { value: '10', label: 'Valley Springs' },
      { value: '11', label: 'Hillside Haven' },
      { value: '12', label: 'Meadow Village' },
      { value: '13', label: 'Ocean View' },
      { value: '14', label: 'Sunrise Community' },
      { value: '15', label: 'Green Valley' },
      { value: '16', label: 'Pine Ridge' },
      { value: '17', label: 'Crystal Bay' },
      { value: '18', label: 'Sunset Hills' },
      { value: '19', label: 'Garden Grove' },
      { value: '20', label: 'Riverside Commons' },
    ];

    // Mock listings data (expanded to support up to 50 items)
    const mockListings = [
      { value: 'l1', label: 'Mountain View Property', villageId: '1' },
      { value: 'l2', label: 'Solar Haven Cabin', villageId: '1' },
      { value: 'l3', label: 'Lakeside Cottage', villageId: '2' },
      { value: 'l4', label: 'Woodland Retreat', villageId: '2' },
      { value: 'l5', label: 'Desert Oasis Tiny Home', villageId: '3' },
      { value: 'l6', label: 'Earth Ship Residence', villageId: '3' },
      { value: 'l7', label: 'Riverside Cabin', villageId: '4' },
      { value: 'l8', label: 'Floating House', villageId: '4' },
      { value: 'l9', label: 'Urban Garden Apartment', villageId: '5' },
      { value: 'l10', label: 'Rooftop Terrace Unit', villageId: '5' },
      { value: 'l11', label: 'Alpine Lodge', villageId: '6' },
      { value: 'l12', label: 'Coastal Bungalow', villageId: '7' },
      { value: 'l13', label: 'Sunset Villa', villageId: '8' },
      { value: 'l14', label: 'Prairie Home', villageId: '9' },
      { value: 'l15', label: 'Valley View House', villageId: '10' },
      { value: 'l16', label: 'Hillside Cottage', villageId: '11' },
      { value: 'l17', label: 'Meadow House', villageId: '12' },
      { value: 'l18', label: 'Ocean Breeze Villa', villageId: '13' },
      { value: 'l19', label: 'Morning Light Cabin', villageId: '14' },
      { value: 'l20', label: 'Green Acres Property', villageId: '15' },
      { value: 'l21', label: 'Pine Forest Lodge', villageId: '16' },
      { value: 'l22', label: 'Bay View Apartment', villageId: '17' },
      { value: 'l23', label: 'Sunset Manor', villageId: '18' },
      { value: 'l24', label: 'Garden Terrace', villageId: '19' },
      { value: 'l25', label: 'Riverside Loft', villageId: '20' },
      { value: 'l26', label: 'Forest Edge Cabin', villageId: '1' },
      { value: 'l27', label: 'Lake House', villageId: '2' },
      { value: 'l28', label: 'Desert Star Home', villageId: '3' },
      { value: 'l29', label: 'River Rock Cottage', villageId: '4' },
      { value: 'l30', label: 'City Heights Unit', villageId: '5' },
      { value: 'l31', label: 'Mountain Peak Lodge', villageId: '6' },
      { value: 'l32', label: 'Coastal Haven', villageId: '7' },
      { value: 'l33', label: 'Lakeshore Retreat', villageId: '8' },
      { value: 'l34', label: 'Prairie Winds Home', villageId: '9' },
      { value: 'l35', label: 'Valley Meadows', villageId: '10' },
      { value: 'l36', label: 'Hillcrest Villa', villageId: '11' },
      { value: 'l37', label: 'Meadowbrook House', villageId: '12' },
      { value: 'l38', label: 'Oceanfront Property', villageId: '13' },
      { value: 'l39', label: 'Sunrise Estate', villageId: '14' },
      { value: 'l40', label: 'Green Hills Manor', villageId: '15' },
      { value: 'l41', label: 'Pine Valley Lodge', villageId: '16' },
      { value: 'l42', label: 'Crystal Waters Home', villageId: '17' },
      { value: 'l43', label: 'Sunset Ridge Villa', villageId: '18' },
      { value: 'l44', label: 'Garden Oasis', villageId: '19' },
      { value: 'l45', label: 'Riverside Manor', villageId: '20' },
      { value: 'l46', label: 'Mountain Vista', villageId: '1' },
      { value: 'l47', label: 'Forest Glen', villageId: '2' },
      { value: 'l48', label: 'Desert Bloom', villageId: '3' },
      { value: 'l49', label: 'River Bend House', villageId: '4' },
      { value: 'l50', label: 'Urban Skyline', villageId: '5' },
    ];

    setVillages(mockVillages);
    setListings(mockListings);
  }, []);

  // Generate mock data (similar to DemandOverTime component)
  const generateMockData = () => {
    const randomBid = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    let items = [];

    if (category === 'village') {
      // Use selected villages or all villages
      items =
        selectedVillages.length > 0
          ? selectedVillages.map(v => ({ id: v.value, identifier: v.label, type: 'village' }))
          : villages.slice(0, Math.min(limit, villages.length)).map(v => ({
              id: v.value,
              identifier: v.label,
              type: 'village',
            }));
    } else {
      // Use selected listings or all listings
      items =
        selectedListings.length > 0
          ? selectedListings.map(l => ({ id: l.value, identifier: l.label, type: 'property' }))
          : listings.slice(0, Math.min(limit, listings.length)).map(l => ({
              id: l.value,
              identifier: l.label,
              type: 'property',
            }));
    }

    // Generate random bid data for each item
    const mockData = items.map(item => {
      const winningBid = randomBid(150, 500);
      const averageBid = randomBid(100, winningBid - 20); // Average is always less than winning

      return {
        ...item,
        winningBid,
        averageBid,
        totalBids: randomBid(5, 25),
      };
    });

    // Sort by winning bid (descending)
    return mockData.sort((a, b) => b.winningBid - a.winningBid);
  };

  // Fetch chart data (using mock data for now)
  const fetchChartData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Generate and use mock data
      const mockData = generateMockData();

      if (mockData.length > 0) {
        prepareChartData(mockData);
      } else {
        setError('No data available for the selected filters.');
      }
    } catch (err) {
      console.error('Error generating chart data:', err);
      setError('Failed to load chart data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data for Chart.js
  const prepareChartData = data => {
    const labels = data.map((item, index) => {
      // Use listing number as identifier (1-indexed)
      return `Listing ${index + 1}`;
    });

    const winningBids = data.map(item => item.winningBid);
    const averageBids = data.map(item => item.averageBid);

    setChartData({
      labels,
      datasets: [
        {
          label: 'Average Bid',
          data: averageBids,
          backgroundColor: '#9370db',
          borderColor: '#9370db',
          borderWidth: 0,
          datalabels: {
            color: '#6b4fa0',
            font: { weight: 'bold', size: 12 },
            anchor: 'center',
            align: 'center',
          },
        },
        {
          label: 'Winning Bid',
          data: winningBids,
          backgroundColor: '#555555',
          borderColor: '#555555',
          borderWidth: 0,
          datalabels: {
            color: '#ffffff',
            font: { weight: 'bold', size: 12 },
            anchor: 'center',
            align: 'center',
          },
        },
      ],
    });
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      datalabels: {
        display: true,
        formatter: value => {
          return Math.round(value);
        },
      },
      legend: {
        position: 'top',
        labels: {
          color: '#000000',
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
        color: '#000000',
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
          text: 'Listing number/identifier',
          color: '#000000',
          font: {
            size: 12,
            weight: 'bold',
          },
          padding: 10,
        },
        ticks: {
          color: '#000000',
          font: {
            size: 11,
          },
        },
        grid: {
          display: true,
          color: 'rgba(200, 200, 200, 0.3)',
          drawBorder: true,
        },
      },
      y: {
        stacked: false,
        beginAtZero: true,
        title: {
          display: true,
          text: 'Bid Amount in USD',
          color: '#000000',
          font: {
            size: 12,
            weight: 'bold',
          },
          padding: 10,
        },
        ticks: {
          color: '#000000',
          font: {
            size: 11,
          },
          callback: function(value) {
            return '$' + value;
          },
        },
        grid: {
          display: true,
          color: 'rgba(200, 200, 200, 0.3)',
          drawBorder: true,
        },
      },
    },
  };

  // Fetch data on initial load
  useEffect(() => {
    if (villages.length > 0 && listings.length > 0) {
      fetchChartData();
    }
  }, [category, limit, selectedVillages, selectedListings, villages, listings]);

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
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused
        ? darkMode
          ? '#444444'
          : '#f0f0f0'
        : darkMode
        ? '#2c2c2c'
        : '#ffffff',
      color: darkMode ? '#ffffff' : '#000000',
    }),
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
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                        },
                      }}
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
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                        },
                      }}
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

            {loading ? (
              <div className={styles.loadingContainer}>
                <Spinner color="primary" />
                <p className={darkMode ? styles.darkText : ''}>Loading chart data...</p>
              </div>
            ) : chartData ? (
              <div className={styles.chartContainer}>
                <Bar
                  data={chartData}
                  options={chartOptions}
                  height={400}
                  plugins={[ChartDataLabels]}
                />
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p className={darkMode ? styles.darkText : ''}>
                  No data available. Please adjust your filters and try again.
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
