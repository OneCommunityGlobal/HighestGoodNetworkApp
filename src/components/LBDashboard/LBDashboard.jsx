import { useState } from 'react';
import {
  Container,
  Row,
  Col,
  Button,
  ButtonGroup,
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Card,
  CardBody,
} from 'reactstrap';
import styles from './LBDashboard.module.css';
import DemandOverTime from './LbAnalytics/DemandOverTime/DemandOverTime';

const METRIC_OPTIONS = {
  DEMAND: [
    { key: 'pageVisits', label: 'Page Visits' }, // default overall
    { key: 'numBids', label: 'Number of Bids' },
    { key: 'avgRating', label: 'Average Rating' },
  ],
  REVENUE: [
    { key: 'avgBid', label: 'Average Bid' },
    { key: 'finalPrice', label: 'Final Price / Income' }, // default for Revenue
  ],
  VACANCY: [
    { key: 'occupancyRate', label: 'Occupancy Rate (% days not vacant)' }, // default for Vacancy
    { key: 'avgStay', label: 'Average Duration of Stay' },
  ],
};

// Mapping from LBDashboard metrics to DemandOverTime metrics
const METRIC_MAPPING = {
  pageVisits: 'pageVisits',
  numBids: 'numberOfBids',
  avgRating: 'averageRating',
  avgBid: 'averageBid',
  finalPrice: 'finalPrice',
  occupancyRate: 'occupancyRate',
  avgStay: 'averageDuration',
};

const DEFAULTS = {
  DEMAND: 'pageVisits',
  REVENUE: 'finalPrice',
  VACANCY: 'occupancyRate',
};

function GraphCard({ title, metricLabel }) {
  return (
    <Card className={styles.graphCard}>
      <CardBody>
        <div className={styles.graphTitle}>
          <span>{title}</span>
          <span className={styles.metricPill}>{metricLabel}</span>
        </div>
        <div className={styles.graphPlaceholder}>
          <span className={styles.placeholderText}>Graph area</span>
        </div>
      </CardBody>
    </Card>
  );
}

export function LBDashboard() {
  const [activeCategory, setActiveCategory] = useState('DEMAND');
  const [selectedMetricKey, setSelectedMetricKey] = useState(DEFAULTS.DEMAND);

  const [openDD, setOpenDD] = useState({ DEMAND: false, REVENUE: false, VACANCY: false });

  const metricLabel = (() => {
    const all = Object.values(METRIC_OPTIONS).flat();
    return (all.find(o => o.key === selectedMetricKey) || {}).label || '';
  })();

  const handleCategoryClick = category => {
    setActiveCategory(category);
    setSelectedMetricKey(DEFAULTS[category]);
  };

  const handleMetricPick = (category, key) => {
    setActiveCategory(category);
    setSelectedMetricKey(key);
  };

  const toggleDD = category => setOpenDD(s => ({ ...s, [category]: !s[category] }));

  const goBack = () => {
    window.history.back();
  };

  return (
    <Container fluid className={styles.dashboardContainer}>
      {/* Header */}
      <header className={styles.dashboardHeader}>
        <h1 className={styles.title}>Listing and Bidding Platform Dashboard</h1>
        <Button size="sm" onClick={goBack} className={styles.backBtn}>
          Back
        </Button>
      </header>

      {/* Preset Overview Filter */}
      <section className={styles.filterBar}>
        <div className={styles.filterLabel}>Choose Metric to view</div>

        <ButtonGroup className={styles.categoryGroup}>
          {/* DEMAND */}
          <Button
            className={`${styles.filterBtn} ${activeCategory === 'DEMAND' ? styles.active : ''}`}
            onClick={() => handleCategoryClick('DEMAND')}
          >
            Demand
          </Button>
          <ButtonDropdown
            isOpen={openDD.DEMAND}
            toggle={() => toggleDD('DEMAND')}
            className={styles.dd}
          >
            <DropdownToggle
              caret
              className={`${styles.filterBtn} ${activeCategory === 'DEMAND' ? styles.active : ''}`}
            />
            <DropdownMenu className={styles.dropdownMenu}>
              {METRIC_OPTIONS.DEMAND.map(m => (
                <DropdownItem
                  key={m.key}
                  active={selectedMetricKey === m.key}
                  onClick={() => handleMetricPick('DEMAND', m.key)}
                  className={`${styles.dropdownItem} ${
                    selectedMetricKey === m.key ? styles.dropdownActive : ''
                  }`}
                >
                  {m.label}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </ButtonDropdown>

          {/* VACANCY */}
          <Button
            className={`${styles.filterBtn} ${activeCategory === 'VACANCY' ? styles.active : ''}`}
            onClick={() => handleCategoryClick('VACANCY')}
          >
            Vacancy
          </Button>
          <ButtonDropdown
            isOpen={openDD.VACANCY}
            toggle={() => toggleDD('VACANCY')}
            className={styles.dd}
          >
            <DropdownToggle
              caret
              className={`${styles.filterBtn} ${activeCategory === 'VACANCY' ? styles.active : ''}`}
            />
            <DropdownMenu className={styles.dropdownMenu}>
              {METRIC_OPTIONS.VACANCY.map(m => (
                <DropdownItem
                  key={m.key}
                  active={selectedMetricKey === m.key}
                  onClick={() => handleMetricPick('VACANCY', m.key)}
                  className={`${styles.dropdownItem} ${
                    selectedMetricKey === m.key ? styles.dropdownActive : ''
                  }`}
                >
                  {m.label}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </ButtonDropdown>

          {/* REVENUE */}
          <Button
            className={`${styles.filterBtn} ${activeCategory === 'REVENUE' ? styles.active : ''}`}
            onClick={() => handleCategoryClick('REVENUE')}
          >
            Revenue
          </Button>
          <ButtonDropdown
            isOpen={openDD.REVENUE}
            toggle={() => toggleDD('REVENUE')}
            className={styles.dd}
          >
            <DropdownToggle
              caret
              className={`${styles.filterBtn} ${activeCategory === 'REVENUE' ? styles.active : ''}`}
            />
            <DropdownMenu className={styles.dropdownMenu}>
              {METRIC_OPTIONS.REVENUE.map(m => (
                <DropdownItem
                  key={m.key}
                  active={selectedMetricKey === m.key}
                  onClick={() => handleMetricPick('REVENUE', m.key)}
                  className={`${styles.dropdownItem} ${
                    selectedMetricKey === m.key ? styles.dropdownActive : ''
                  }`}
                >
                  {m.label}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </ButtonDropdown>
        </ButtonGroup>

        <div className={styles.currentMetric}>
          Current metric:&nbsp;<strong>{metricLabel}</strong>
        </div>
      </section>

      {/* By Village */}
      <section className={styles.section}>
        <details>
          <summary className={styles.sectionSummary}>By Village</summary>
          <div className={styles.sectionBody}>
            <Row xs="1" md="3" className="g-3">
              <Col>
                <DemandOverTime
                  masterMetricCategory={activeCategory}
                  masterMetric={METRIC_MAPPING[selectedMetricKey]}
                  compareType="villages"
                  chartLabel="Comparing Demand of Villages across Months"
                />
              </Col>
              <Col>
                <DemandOverTime
                  masterMetricCategory={activeCategory}
                  masterMetric={METRIC_MAPPING[selectedMetricKey]}
                  compareType="villages"
                  chartLabel="Demand across Villages"
                />
              </Col>
              <Col>
                <DemandOverTime
                  masterMetricCategory={activeCategory}
                  masterMetric={METRIC_MAPPING[selectedMetricKey]}
                  compareType="villages"
                  chartLabel="Comparing Villages"
                />
              </Col>
            </Row>
          </div>
        </details>
      </section>

      {/* By Property */}
      <section className={styles.section}>
        <details>
          <summary className={styles.sectionSummary}>By Property</summary>
          <div className={styles.sectionBody}>
            <Row xs="1" md="2" className="g-3">
              <Col>
                <DemandOverTime
                  masterMetricCategory={activeCategory}
                  masterMetric={METRIC_MAPPING[selectedMetricKey]}
                  compareType="properties"
                  chartLabel="Comparing Demand of Properties across Time"
                />
              </Col>
              <Col>
                <DemandOverTime
                  masterMetricCategory={activeCategory}
                  masterMetric={METRIC_MAPPING[selectedMetricKey]}
                  compareType="properties"
                  chartLabel="Comparing Ratings of Properties"
                />
              </Col>
            </Row>
          </div>
        </details>
      </section>

      {/* Insights from Reviews */}
      <section className={styles.section}>
        <details>
          <summary className={styles.sectionSummary}>Insights from Reviews</summary>
          <div className={styles.sectionBody}>
            <Row xs="1" md="2" className="g-3">
              <Col>
                <Card className={styles.wordcloudCard}>
                  <CardBody className={styles.wordcloudBody}>
                    <div className={styles.wordcloudTitle}>Village Wordcloud</div>
                    <div className={styles.wordcloudPlaceholder}>Wordcloud area</div>
                  </CardBody>
                </Card>
              </Col>
              <Col>
                <Card className={styles.wordcloudCard}>
                  <CardBody className={styles.wordcloudBody}>
                    <div className={styles.wordcloudTitle}>Property Wordcloud</div>
                    <div className={styles.wordcloudPlaceholder}>Wordcloud area</div>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </div>
        </details>
      </section>
    </Container>
  );
}

export default LBDashboard;
