import React, { useState, useEffect } from 'react';
import {
  DatePicker,
  Select,
  Radio,
  Card,
  Row,
  Col,
  Typography,
  Divider,
  ConfigProvider,
  theme,
} from 'antd';
import moment from 'moment';
import styles from './DemandOverTime.module.css';
import VillageDemandChart from './VillageDemandChart';
import PropertyDemandChart from './PropertyDemandChart';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const DemandOverTime = ({
  masterMetricCategory,
  masterMetric,
  compareType: initialCompareType,
  darkMode,
  chartLabel,
}) => {
  // Default to last 365 days
  const [dateRange, setDateRange] = useState([moment().subtract(365, 'days'), moment()]);

  // Use the prop for initial compareType if provided, otherwise default to villages
  const [compareType, setCompareType] = useState(initialCompareType || 'villages');

  // Default to All (both listing and bidding)
  const [listingType, setListingType] = useState('all');

  // Use the prop for initial metric if provided, otherwise default to pageVisits
  const [metric, setMetric] = useState(masterMetric || 'pageVisits');

  // Update metric when masterMetric changes
  useEffect(() => {
    if (masterMetric) {
      setMetric(masterMetric);
    }
  }, [masterMetric]);

  // Sample data - in a real app, this would come from an API
  const [data, setData] = useState([]);

  // Fetch data whenever filters change
  useEffect(() => {
    // In a real app, you would fetch data based on the filters
    // For now, we'll use dummy data
    fetchData();
  }, [dateRange, compareType, listingType, metric]);

  const fetchData = () => {
    // Simulate API call with dummy data
    // This would be replaced with a real API call
    setTimeout(() => {
      const dummyData = generateDummyData();
      setData(dummyData);
    }, 500);
  };

  const generateDummyData = () => {
    // Generate dummy data based on selected filters
    // In a real app, this would come from an API
    const items =
      compareType === 'villages'
        ? ['Village 1', 'Village 2', 'Village 3']
        : ['Property A', 'Property B', 'Property C', 'Property D'];

    const dates = [];
    let currentDate = moment(dateRange[0]);
    while (currentDate <= dateRange[1]) {
      dates.push(currentDate.format('YYYY-MM-DD'));
      currentDate = currentDate.add(30, 'days');
    }

    return items.map(item => ({
      name: item,
      data: dates.map(date => ({
        date,
        value: Math.floor(Math.random() * 100) + 20, // Random value between 20 and 120
      })),
    }));
  };

  const handleDateRangeChange = dates => {
    setDateRange(dates);
  };

  const handleCompareTypeChange = e => {
    setCompareType(e.target.value);
  };

  const handleListingTypeChange = value => {
    setListingType(value);
  };

  const handleMetricChange = value => {
    setMetric(value);
  };

  // Determine which metrics should be disabled based on listing type
  const isBidMetricDisabled = listingType === 'listing';

  return (
    <ConfigProvider
      theme={{
        algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <div className={`${styles.container} ${darkMode ? styles.darkContainer : ''}`}>
        <Card className={`${styles.filterCard} ${darkMode ? styles.darkFilterCard : ''}`}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <div className={styles.filterItem}>
                <Text strong className={darkMode ? styles.darkText : ''}>
                  Date Range:
                </Text>
                <RangePicker
                  value={dateRange}
                  onChange={handleDateRangeChange}
                  format="YYYY-MM-DD"
                  className={styles.datePicker}
                />
              </div>
            </Col>

            {!initialCompareType && (
              <Col xs={24} sm={12} md={6}>
                <div className={styles.filterItem}>
                  <Text strong className={darkMode ? styles.darkText : ''}>
                    Compare:
                  </Text>
                  <Radio.Group
                    value={compareType}
                    onChange={handleCompareTypeChange}
                    className={styles.radioGroup}
                  >
                    <Radio.Button value="villages">Villages</Radio.Button>
                    <Radio.Button value="properties">Properties</Radio.Button>
                  </Radio.Group>
                </div>
              </Col>
            )}

            <Col xs={24} sm={12} md={6}>
              <div className={styles.filterItem}>
                <Text strong className={darkMode ? styles.darkText : ''}>
                  Listing/Bidding:
                </Text>
                <Select
                  value={listingType}
                  onChange={handleListingTypeChange}
                  className={styles.select}
                >
                  <Option value="all">All</Option>
                  <Option value="listing">Listing</Option>
                  <Option value="bidding">Bidding</Option>
                </Select>
              </div>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <div className={styles.filterItem}>
                <Text strong className={darkMode ? styles.darkText : ''}>
                  Metric:
                </Text>
                <Select value={metric} onChange={handleMetricChange} className={styles.select}>
                  <Option value="pageVisits" disabled={false}>
                    <Text
                      className={`${styles.metricCategory} ${
                        darkMode ? styles.darkMetricCategory : ''
                      }`}
                    >
                      DEMAND:
                    </Text>{' '}
                    Page Visits
                  </Option>
                  <Option value="numberOfBids" disabled={isBidMetricDisabled}>
                    <Text
                      className={`${styles.metricCategory} ${
                        darkMode ? styles.darkMetricCategory : ''
                      }`}
                    >
                      DEMAND:
                    </Text>{' '}
                    Number of Bids
                  </Option>
                  {/* Add the same dark mode class to all other options */}
                  <Option value="averageRating" disabled={false}>
                    <Text
                      className={`${styles.metricCategory} ${
                        darkMode ? styles.darkMetricCategory : ''
                      }`}
                    >
                      DEMAND:
                    </Text>{' '}
                    Average Rating
                  </Option>
                  <Option value="averageBid" disabled={isBidMetricDisabled}>
                    <Text
                      className={`${styles.metricCategory} ${
                        darkMode ? styles.darkMetricCategory : ''
                      }`}
                    >
                      REVENUE:
                    </Text>{' '}
                    Average Bid
                  </Option>
                  <Option value="finalPrice" disabled={isBidMetricDisabled}>
                    <Text
                      className={`${styles.metricCategory} ${
                        darkMode ? styles.darkMetricCategory : ''
                      }`}
                    >
                      REVENUE:
                    </Text>{' '}
                    Final Price/Income
                  </Option>
                  <Option value="occupancyRate" disabled={false}>
                    <Text
                      className={`${styles.metricCategory} ${
                        darkMode ? styles.darkMetricCategory : ''
                      }`}
                    >
                      VACANCY:
                    </Text>{' '}
                    Occupancy Rate
                  </Option>
                  <Option value="averageDuration" disabled={false}>
                    <Text
                      className={`${styles.metricCategory} ${
                        darkMode ? styles.darkMetricCategory : ''
                      }`}
                    >
                      VACANCY:
                    </Text>{' '}
                    Average Duration of Stay
                  </Option>
                </Select>
              </div>
            </Col>
          </Row>
        </Card>

        <div className={styles.chartContainer}>
          {compareType === 'villages' ? (
            <VillageDemandChart
              data={data}
              metric={metric}
              dateRange={dateRange}
              darkMode={darkMode}
              chartLabel={chartLabel}
            />
          ) : (
            <PropertyDemandChart
              data={data}
              metric={metric}
              dateRange={dateRange}
              darkMode={darkMode}
              chartLabel={chartLabel}
            />
          )}
        </div>
      </div>
    </ConfigProvider>
  );
};

export default DemandOverTime;
