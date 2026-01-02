import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Select from 'react-select';
import { Row, Col, Card, CardBody } from 'reactstrap';
import { VILLAGE_OPTIONS, PROPERTY_OPTIONS, getCustomSelectStyles } from '../constants';
import styles from './RatingDistribution.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function RatingDistribution({ darkMode }) {
  // Mock data - Replace with actual API data
  const mockReviewsData = [
    {
      id: 1,
      rating: 5,
      village: 'Eco Village',
      property: 'Mountain View',
      date: '2025-12-01',
    },
    {
      id: 2,
      rating: 5,
      village: 'Eco Village',
      property: 'Solar Haven',
      date: '2025-12-05',
    },
    {
      id: 3,
      rating: 4,
      village: 'Forest Retreat',
      property: 'Lakeside Cottage',
      date: '2025-12-10',
    },
    {
      id: 4,
      rating: 5,
      village: 'Desert Oasis',
      property: 'Tiny Home',
      date: '2025-12-12',
    },
    {
      id: 5,
      rating: 3,
      village: 'River Valley',
      property: 'Riverside Cabin',
      date: '2025-11-15',
    },
    {
      id: 6,
      rating: 4,
      village: 'City Sanctuary',
      property: 'Urban Garden Apartment',
      date: '2025-11-20',
    },
    {
      id: 7,
      rating: 5,
      village: 'Eco Village',
      property: 'Mountain View',
      date: '2025-11-25',
    },
    {
      id: 8,
      rating: 2,
      village: 'Forest Retreat',
      property: 'Woodland Cabin',
      date: '2025-10-05',
    },
    {
      id: 9,
      rating: 3,
      village: 'Desert Oasis',
      property: 'Earth Ship',
      date: '2025-10-10',
    },
    {
      id: 10,
      rating: 1,
      village: 'River Valley',
      property: 'Floating House',
      date: '2025-09-15',
    },
  ];

  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'last30', label: 'Last 30 Days' },
    { value: 'last60', label: 'Last 60 Days' },
    { value: 'last90', label: 'Last 90 Days' },
    { value: 'custom', label: 'Custom Range' },
  ];

  const categoryOptions = [
    { value: 'village', label: 'By Village' },
    { value: 'property', label: 'By Property' },
  ];

  const [selectedDateRange, setSelectedDateRange] = useState(dateRangeOptions[0]);
  const [selectedCategory, setSelectedCategory] = useState(categoryOptions[0]);
  const [selectedVillages, setSelectedVillages] = useState(VILLAGE_OPTIONS);
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [chartData, setChartData] = useState(null);

  const customSelectStyles = getCustomSelectStyles(darkMode);

  useEffect(() => {
    // Filter reviews based on selected filters
    let filteredReviews = [...mockReviewsData];

    // Apply date filter
    if (selectedDateRange.value !== 'all') {
      const today = new Date();
      let startDate;

      if (selectedDateRange.value === 'last30') {
        startDate = new Date(today.setDate(today.getDate() - 30));
      } else if (selectedDateRange.value === 'last60') {
        startDate = new Date(today.setDate(today.getDate() - 60));
      } else if (selectedDateRange.value === 'last90') {
        startDate = new Date(today.setDate(today.getDate() - 90));
      } else if (selectedDateRange.value === 'custom' && fromDate && toDate) {
        startDate = new Date(fromDate);
        const endDate = new Date(toDate);
        filteredReviews = filteredReviews.filter(review => {
          const reviewDate = new Date(review.date);
          return reviewDate >= startDate && reviewDate <= endDate;
        });
      }

      if (selectedDateRange.value !== 'custom') {
        filteredReviews = filteredReviews.filter(review => new Date(review.date) >= startDate);
      }
    }

    // Apply category filter
    if (selectedCategory.value === 'village' && selectedVillages.length > 0) {
      const villageValues = selectedVillages.map(v => v.value);
      filteredReviews = filteredReviews.filter(review => villageValues.includes(review.village));
    } else if (selectedCategory.value === 'property' && selectedProperties.length > 0) {
      const propertyValues = selectedProperties.map(p => p.value);
      filteredReviews = filteredReviews.filter(review => propertyValues.includes(review.property));
    }

    // Calculate rating distribution
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    filteredReviews.forEach(review => {
      ratingCounts[review.rating] = (ratingCounts[review.rating] || 0) + 1;
    });

    // Prepare chart data with gradient colors
    const data = {
      labels: ['1★', '2★', '3★', '4★', '5★'],
      datasets: [
        {
          label: 'Number of Reviews',
          data: [
            ratingCounts[1],
            ratingCounts[2],
            ratingCounts[3],
            ratingCounts[4],
            ratingCounts[5],
          ],
          backgroundColor: [
            'rgba(139, 92, 246, 0.3)', // 1 star - lightest purple
            'rgba(139, 92, 246, 0.45)', // 2 stars
            'rgba(139, 92, 246, 0.6)', // 3 stars
            'rgba(139, 92, 246, 0.75)', // 4 stars
            'rgba(139, 92, 246, 0.9)', // 5 stars - darkest purple
          ],
          borderColor: [
            'rgba(139, 92, 246, 0.6)',
            'rgba(139, 92, 246, 0.7)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(139, 92, 246, 0.9)',
            'rgba(139, 92, 246, 1)',
          ],
          borderWidth: 1,
          borderRadius: 8,
        },
      ],
    };

    setChartData(data);
  }, [selectedDateRange, selectedCategory, selectedVillages, selectedProperties, fromDate, toDate]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: darkMode ? '#1C2541' : '#fff',
        titleColor: darkMode ? '#fff' : '#333',
        bodyColor: darkMode ? '#fff' : '#333',
        borderColor: darkMode ? '#225163' : '#ccc',
        borderWidth: 1,
        callbacks: {
          label: context => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: darkMode ? '#fff' : '#333',
          font: {
            size: 14,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)',
          lineWidth: 1,
        },
        ticks: {
          color: darkMode ? '#fff' : '#333',
          font: {
            size: 12,
          },
          stepSize: 1,
        },
        title: {
          display: true,
          text: 'Number of Reviews',
          color: darkMode ? '#fff' : '#333',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
      },
    },
  };

  return (
    <Card className={`${styles.ratingCard} ${darkMode ? styles.darkCard : ''}`}>
      <CardBody>
        {/* Header with Title and Date Range */}
        <div className={styles.header}>
          <h3 className={`${styles.title} ${darkMode ? styles.darkText : ''}`}>
            Rating Distribution
          </h3>
          <div className={styles.dateRangeSelector}>
            <label
              htmlFor="dateRange"
              className={`${styles.label} ${darkMode ? styles.darkText : ''}`}
            >
              Date Range:
            </label>
            <Select
              inputId="dateRange"
              value={selectedDateRange}
              onChange={setSelectedDateRange}
              options={dateRangeOptions}
              styles={customSelectStyles}
              className={styles.selectInput}
              isSearchable={false}
            />
          </div>
        </div>

        {/* Custom Date Range Inputs */}
        {selectedDateRange.value === 'custom' && (
          <div className={styles.customDateRange}>
            <div className={styles.dateInputGroup}>
              <label
                htmlFor="fromDate"
                className={`${styles.label} ${darkMode ? styles.darkText : ''}`}
              >
                From:
              </label>
              <input
                id="fromDate"
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className={`${styles.dateInput} ${darkMode ? styles.darkInput : ''}`}
              />
            </div>
            <div className={styles.dateInputGroup}>
              <label
                htmlFor="toDate"
                className={`${styles.label} ${darkMode ? styles.darkText : ''}`}
              >
                To:
              </label>
              <input
                id="toDate"
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className={`${styles.dateInput} ${darkMode ? styles.darkInput : ''}`}
              />
            </div>
          </div>
        )}

        {/* Filters Section */}
        <div className={styles.filtersSection}>
          <Row className="g-3">
            <Col md={6}>
              <label
                htmlFor="category"
                className={`${styles.label} ${darkMode ? styles.darkText : ''}`}
              >
                Category:
              </label>
              <Select
                inputId="category"
                value={selectedCategory}
                onChange={option => {
                  setSelectedCategory(option);
                  // Reset selections when category changes
                  if (option.value === 'village') {
                    setSelectedVillages(VILLAGE_OPTIONS);
                    setSelectedProperties([]);
                  } else {
                    setSelectedVillages([]);
                    setSelectedProperties([]);
                  }
                }}
                options={categoryOptions}
                styles={customSelectStyles}
                isSearchable={false}
              />
            </Col>

            {selectedCategory.value === 'village' ? (
              <Col md={6}>
                <label
                  htmlFor="villages"
                  className={`${styles.label} ${darkMode ? styles.darkText : ''}`}
                >
                  Select Villages:
                </label>
                <Select
                  inputId="villages"
                  isMulti
                  value={selectedVillages}
                  onChange={setSelectedVillages}
                  options={VILLAGE_OPTIONS}
                  styles={customSelectStyles}
                  closeMenuOnSelect={false}
                  placeholder="Select villages..."
                />
              </Col>
            ) : (
              <Col md={6}>
                <label
                  htmlFor="properties"
                  className={`${styles.label} ${darkMode ? styles.darkText : ''}`}
                >
                  Select Properties:
                </label>
                <Select
                  inputId="properties"
                  isMulti
                  value={selectedProperties}
                  onChange={setSelectedProperties}
                  options={PROPERTY_OPTIONS}
                  styles={customSelectStyles}
                  closeMenuOnSelect={false}
                  placeholder="Select properties..."
                />
              </Col>
            )}
          </Row>
        </div>

        {/* Chart */}
        <div className={styles.chartContainer}>
          {chartData && <Bar data={chartData} options={chartOptions} />}
        </div>
      </CardBody>
    </Card>
  );
}

RatingDistribution.propTypes = {
  darkMode: PropTypes.bool,
};

export default RatingDistribution;
