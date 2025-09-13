import React, { useState } from 'react';
import { Container } from 'reactstrap';
import { Card, Button, Dropdown, Menu, Row, Col, Typography, Collapse } from 'antd';
import { ArrowLeftOutlined, DownOutlined } from '@ant-design/icons';
import styles from './LBDashboard.module.css';
import DemandOverTime from './LbAnalytics/DemandOverTime/DemandOverTime';

const { Title } = Typography;
const { Panel } = Collapse;

export function LBDashboard() {
  // Master filter states
  const [masterMetricCategory, setMasterMetricCategory] = useState('demand');
  const [masterMetric, setMasterMetric] = useState('pageVisits');

  // Handle master metric category and metric change
  const handleMetricChange = (category, metric) => {
    setMasterMetricCategory(category);
    setMasterMetric(metric);
  };

  // Menu for demand metrics dropdown
  const demandMenu = (
    <Menu onClick={({ key }) => handleMetricChange('demand', key)}>
      <Menu.Item key="pageVisits">Number of Views</Menu.Item>
      <Menu.Item key="numberOfBids">Number of Bids</Menu.Item>
      <Menu.Item key="averageRating">Average Rating</Menu.Item>
    </Menu>
  );

  // Menu for revenue metrics dropdown
  const revenueMenu = (
    <Menu onClick={({ key }) => handleMetricChange('revenue', key)}>
      <Menu.Item key="averageBid">Average Bid</Menu.Item>
      <Menu.Item key="finalPrice">Final Price/Income</Menu.Item>
    </Menu>
  );

  // Menu for vacancy metrics dropdown
  const vacancyMenu = (
    <Menu onClick={({ key }) => handleMetricChange('vacancy', key)}>
      <Menu.Item key="occupancyRate">Occupancy Rate</Menu.Item>
      <Menu.Item key="averageDuration">Average Duration of Stay</Menu.Item>
    </Menu>
  );

  // Get display name for the selected metric
  const getMetricDisplayName = () => {
    switch (masterMetric) {
      case 'pageVisits':
        return 'Number of Views';
      case 'numberOfBids':
        return 'Number of Bids';
      case 'averageRating':
        return 'Average Rating';
      case 'averageBid':
        return 'Average Bid';
      case 'finalPrice':
        return 'Final Price/Income';
      case 'occupancyRate':
        return 'Occupancy Rate';
      case 'averageDuration':
        return 'Average Duration of Stay';
      default:
        return 'Select Metric';
    }
  };

  return (
    <Container fluid className={styles.dashboardContainer}>
      {/* Header */}
      <header className={styles.dashboardHeader}>
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          className={styles.backButton}
          onClick={() => window.history.back()}
        >
          Back to Listing and Bidding
        </Button>
        <Title level={2}>Listing and Bidding Platform Dashboard</Title>
      </header>

      {/* Updated Filter UI */}
      <div className={styles.filterContainer}>
        <span className={styles.filterLabel}>Choose Metric to view</span>

        <Dropdown overlay={demandMenu} trigger={['click']}>
          <Button
            className={`${styles.categoryButton} ${
              masterMetricCategory === 'demand' ? styles.activeButton : styles.inactiveButton
            }`}
          >
            Demand {masterMetricCategory === 'demand' && `(${getMetricDisplayName()})`}
            <DownOutlined />
          </Button>
        </Dropdown>

        <Dropdown overlay={vacancyMenu} trigger={['click']}>
          <Button
            className={`${styles.categoryButton} ${
              masterMetricCategory === 'vacancy' ? styles.activeButton : styles.inactiveButton
            }`}
          >
            Vacancy {masterMetricCategory === 'vacancy' && `(${getMetricDisplayName()})`}
            <DownOutlined />
          </Button>
        </Dropdown>

        <Dropdown overlay={revenueMenu} trigger={['click']}>
          <Button
            className={`${styles.categoryButton} ${
              masterMetricCategory === 'revenue' ? styles.activeButton : styles.inactiveButton
            }`}
          >
            Revenue {masterMetricCategory === 'revenue' && `(${getMetricDisplayName()})`}
            <DownOutlined />
          </Button>
        </Dropdown>
      </div>

      {/* Rest of the component remains the same */}
      <Collapse defaultActiveKey={['1']} className={styles.collapseContainer}>
        {/* By Village Section */}
        <Panel
          header={<Title level={3}>By Village</Title>}
          key="1"
          className={styles.collapsePanel}
        >
          <DemandOverTime
            masterMetricCategory={masterMetricCategory}
            masterMetric={masterMetric}
            compareType="villages"
          />
          <div className={styles.placeholderCharts}>
            {/* Placeholder for 2 more village charts */}
            <Card className={styles.placeholderCard}>
              <Title level={4}>Village Chart 2</Title>
            </Card>
            <Card className={styles.placeholderCard}>
              <Title level={4}>Village Chart 3</Title>
            </Card>
          </div>
        </Panel>

        {/* By Property Section */}
        <Panel
          header={<Title level={3}>By Property</Title>}
          key="2"
          className={styles.collapsePanel}
        >
          <DemandOverTime
            masterMetricCategory={masterMetricCategory}
            masterMetric={masterMetric}
            compareType="properties"
          />
          <div className={styles.placeholderCharts}>
            {/* Placeholder for 1 more property chart */}
            <Card className={styles.placeholderCard}>
              <Title level={4}>Property Chart 2</Title>
            </Card>
          </div>
        </Panel>

        {/* Insights from Reviews Section */}
        <Panel
          header={<Title level={3}>Insights from Reviews</Title>}
          key="3"
          className={styles.collapsePanel}
        >
          <div className={styles.placeholderCharts}>
            {/* Placeholders for 2 wordclouds */}
            <Card className={styles.placeholderCard}>
              <Title level={4}>Word Cloud 1</Title>
            </Card>
            <Card className={styles.placeholderCard}>
              <Title level={4}>Word Cloud 2</Title>
            </Card>
          </div>
        </Panel>
      </Collapse>
    </Container>
  );
}

export default LBDashboard;
