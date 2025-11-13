import { useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
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
import ReviewWordCloud from './ReviewWordCloud/ReviewWordCloud';
import styles from './LBDashboard.module.css';

const METRIC_OPTIONS = {
  DEMAND: [
    { key: 'pageVisits', label: 'Page Visits' },
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

const DEFAULTS = {
  DEMAND: 'pageVisits',
  REVENUE: 'finalPrice',
  VACANCY: 'occupancyRate',
};

function GraphCard({ title, metricLabel, darkMode }) {
  return (
    <Card className={`${styles.graphCard} ${darkMode ? styles.darkCard : ''}`}>
      <CardBody>
        <div className={styles.graphTitle}>
          <span className={darkMode ? styles.darkText : ''}>{title}</span>
          <span className={`${styles.metricPill} ${darkMode ? styles.darkMetricPill : ''}`}>
            {metricLabel}
          </span>
        </div>
        <div className={`${styles.graphPlaceholder} ${darkMode ? styles.darkPlaceholder : ''}`}>
          <span className={`${styles.placeholderText} ${darkMode ? styles.darkText : ''}`}>
            Graph area
          </span>
        </div>
      </CardBody>
    </Card>
  );
}

GraphCard.propTypes = {
  title: PropTypes.string.isRequired,
  metricLabel: PropTypes.string,
  darkMode: PropTypes.bool,
};

export function LBDashboard() {
  const darkMode = useSelector(state => state.theme.darkMode);
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

  const renderCategoryControls = (categoryKey, label) => (
    <>
      <Button
        className={`${styles.filterBtn} ${activeCategory === categoryKey ? styles.active : ''} ${
          darkMode ? styles.darkFilterBtn : ''
        }`}
        onClick={() => handleCategoryClick(categoryKey)}
      >
        {label}
      </Button>

      <ButtonDropdown
        isOpen={openDD[categoryKey]}
        toggle={() => toggleDD(categoryKey)}
        className={styles.dd}
      >
        <DropdownToggle
          caret
          className={`${styles.filterBtn} ${activeCategory === categoryKey ? styles.active : ''} ${
            darkMode ? styles.darkFilterBtn : ''
          }`}
        />
        <DropdownMenu
          className={`${styles.dropdownMenu} ${darkMode ? styles.darkDropdownMenu : ''}`}
        >
          {METRIC_OPTIONS[categoryKey].map(m => (
            <DropdownItem
              key={m.key}
              active={selectedMetricKey === m.key}
              onClick={() => handleMetricPick(categoryKey, m.key)}
              className={`${styles.dropdownItem} ${
                selectedMetricKey === m.key ? styles.dropdownActive : ''
              } ${darkMode ? styles.darkDropdownItem : ''}`}
            >
              {m.label}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </ButtonDropdown>
    </>
  );

  return (
    <Container
      fluid
      className={`${styles.dashboardContainer} ${darkMode ? styles.darkContainer : ''}`}
    >
      {/* Header */}
      <header className={styles.dashboardHeader}>
        <h1 className={`${styles.title} ${darkMode ? styles.darkText : ''}`}>
          Listing and Bidding Platform Dashboard
        </h1>
        <Button
          size="sm"
          onClick={goBack}
          className={`${styles.backBtn} ${darkMode ? styles.darkBackBtn : ''}`}
        >
          Back
        </Button>
      </header>

      {/* Preset Overview Filter */}
      <section className={`${styles.filterBar} ${darkMode ? styles.darkFilterBar : ''}`}>
        <div className={`${styles.filterLabel} ${darkMode ? styles.darkFilterLabel : ''}`}>
          Choose Metric to view
        </div>

        <ButtonGroup className={styles.categoryGroup}>
          {renderCategoryControls('DEMAND', 'Demand')}
          {renderCategoryControls('VACANCY', 'Vacancy')}
          {renderCategoryControls('REVENUE', 'Revenue')}
        </ButtonGroup>

        <div className={`${styles.currentMetric} ${darkMode ? styles.darkText : ''}`}>
          Current metric:&nbsp;<strong>{metricLabel}</strong>
        </div>
      </section>

      {/* By Village */}
      <section className={styles.section}>
        <details>
          <summary
            className={`${styles.sectionSummary} ${darkMode ? styles.darkSectionSummary : ''}`}
          >
            By Village
          </summary>
          <div className={`${styles.sectionBody} ${darkMode ? styles.darkSectionBody : ''}`}>
            <Row xs="1" md="3" className="g-3">
              <Col>
                <GraphCard
                  title="Comparing Demand of Villages across Months"
                  metricLabel={metricLabel}
                  darkMode={darkMode}
                />
              </Col>
              <Col>
                <GraphCard
                  title="Demand across Villages"
                  metricLabel={metricLabel}
                  darkMode={darkMode}
                />
              </Col>
              <Col>
                <GraphCard
                  title="Comparing Villages"
                  metricLabel={metricLabel}
                  darkMode={darkMode}
                />
              </Col>
            </Row>
          </div>
        </details>
      </section>

      {/* By Property */}
      <section className={styles.section}>
        <details>
          <summary
            className={`${styles.sectionSummary} ${darkMode ? styles.darkSectionSummary : ''}`}
          >
            By Property
          </summary>
          <div className={`${styles.sectionBody} ${darkMode ? styles.darkSectionBody : ''}`}>
            <Row xs="1" md="2" className="g-3">
              <Col>
                <GraphCard
                  title="Comparing Demand of Properties across Time"
                  metricLabel={metricLabel}
                  darkMode={darkMode}
                />
              </Col>
              <Col>
                <GraphCard
                  title="Comparing Ratings of Properties"
                  metricLabel={metricLabel}
                  darkMode={darkMode}
                />
              </Col>
            </Row>
          </div>
        </details>
      </section>

      {/* Insights from Reviews */}
      <section className={styles.section}>
        <details>
          <summary
            className={`${styles.sectionSummary} ${darkMode ? styles.darkSectionSummary : ''}`}
          >
            Insights from Reviews
          </summary>
          <div className={`${styles.sectionBody} ${darkMode ? styles.darkSectionBody : ''}`}>
            <ReviewWordCloud darkMode={darkMode} />
          </div>
        </details>
      </section>
    </Container>
  );
}

export default LBDashboard;
