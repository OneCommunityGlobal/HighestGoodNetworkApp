import React, { useState } from 'react';
import { Container } from 'reactstrap';
import { Card, Button, Radio, Dropdown, Menu, Row, Col, Typography, Collapse } from 'antd';
import { ArrowLeftOutlined, DownOutlined } from '@ant-design/icons';
import styles from './LBDashboard.module.css';
import DemandOverTime from './LbAnalytics/DemandOverTime/DemandOverTime';

const { Title } = Typography;
const { Panel } = Collapse;

export function LBDashboard() {
  // Master filter states
  const [masterMetricCategory, setMasterMetricCategory] = useState('demand');
  const [masterMetric, setMasterMetric] = useState('pageVisits');

  // Handle master metric category change
  const handleMetricCategoryChange = e => {
    const category = e.target.value;
    setMasterMetricCategory(category);

    // Set default metric based on category
    switch (category) {
      case 'demand':
        setMasterMetric('pageVisits');
        break;
      case 'revenue':
        setMasterMetric('finalPrice');
        break;
      case 'vacancy':
        setMasterMetric('occupancyRate');
        break;
      default:
        setMasterMetric('pageVisits');
    }
  };

  // Menu for demand metrics dropdown
  const demandMenu = (
    <Menu onClick={({ key }) => setMasterMetric(key)}>
      <Menu.Item key="pageVisits">Page Visits</Menu.Item>
      <Menu.Item key="numberOfBids">Number of Bids</Menu.Item>
      <Menu.Item key="averageRating">Average Rating</Menu.Item>
    </Menu>
  );

  // Menu for revenue metrics dropdown
  const revenueMenu = (
    <Menu onClick={({ key }) => setMasterMetric(key)}>
      <Menu.Item key="averageBid">Average Bid</Menu.Item>
      <Menu.Item key="finalPrice">Final Price/Income</Menu.Item>
    </Menu>
  );

  // Menu for vacancy metrics dropdown
  const vacancyMenu = (
    <Menu onClick={({ key }) => setMasterMetric(key)}>
      <Menu.Item key="occupancyRate">Occupancy Rate</Menu.Item>
      <Menu.Item key="averageDuration">Average Duration of Stay</Menu.Item>
    </Menu>
  );

  // Get the appropriate menu based on selected category
  const getDropdownMenu = () => {
    switch (masterMetricCategory) {
      case 'demand':
        return demandMenu;
      case 'revenue':
        return revenueMenu;
      case 'vacancy':
        return vacancyMenu;
      default:
        return demandMenu;
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

      {/* Master Filters */}
      <Card className={styles.filterCard}>
        <Title level={4}>Preset Overview Filters</Title>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={16}>
            <Radio.Group
              value={masterMetricCategory}
              onChange={handleMetricCategoryChange}
              className={styles.masterRadioGroup}
            >
              <Radio.Button value="demand">DEMAND</Radio.Button>
              <Radio.Button value="revenue">REVENUE</Radio.Button>
              <Radio.Button value="vacancy">VACANCY</Radio.Button>
            </Radio.Group>
          </Col>
          <Col xs={24} md={8}>
            <Dropdown overlay={getDropdownMenu()} trigger={['click']}>
              <Button className={styles.dropdownButton}>
                {masterMetric === 'pageVisits' && 'Page Visits'}
                {masterMetric === 'numberOfBids' && 'Number of Bids'}
                {masterMetric === 'averageRating' && 'Average Rating'}
                {masterMetric === 'averageBid' && 'Average Bid'}
                {masterMetric === 'finalPrice' && 'Final Price/Income'}
                {masterMetric === 'occupancyRate' && 'Occupancy Rate'}
                {masterMetric === 'averageDuration' && 'Average Duration of Stay'}
                <DownOutlined />
              </Button>
            </Dropdown>
          </Col>
        </Row>
      </Card>

      {/* Collapsible Sections */}
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
