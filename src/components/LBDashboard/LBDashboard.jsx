import { useState } from 'react';
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
  const darkMode = useSelector(state => state.theme.darkMode);

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
    <Container fluid className={`${styles.dashboardContainer} ${darkMode ? styles.darkMode : ''}`}>
      {/* Header */}
      <header className={`${styles.dashboardHeader} ${darkMode ? styles.darkHeader : ''}`}>
        <h1 className={styles.title}>Listing and Bidding Platform Dashboard</h1>
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
        <div className={styles.filterLabel}>Choose Metric to view</div>

        <ButtonGroup className={styles.categoryGroup}>
          {/* DEMAND */}
          <Button
            className={`${styles.filterBtn} ${activeCategory === 'DEMAND' ? styles.active : ''} ${
              darkMode ? styles.darkFilterBtn : ''
            }`}
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
              className={`${styles.filterBtn} ${activeCategory === 'DEMAND' ? styles.active : ''} ${
                darkMode ? styles.darkFilterBtn : ''
              }`}
            />
            <DropdownMenu
              className={`${styles.dropdownMenu} ${darkMode ? styles.darkDropdown : ''}`}
            >
              {METRIC_OPTIONS.DEMAND.map(m => (
                <DropdownItem
                  key={m.key}
                  active={selectedMetricKey === m.key}
                  onClick={() => handleMetricPick('DEMAND', m.key)}
                  className={`${styles.dropdownItem} ${
                    selectedMetricKey === m.key ? styles.dropdownActive : ''
                  } ${darkMode ? styles.darkDropdownItem : ''}`}
                >
                  {m.label}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </ButtonDropdown>

          {/* Apply the same dark mode classes to VACANCY and REVENUE buttons - similar pattern */}
          {/* VACANCY */}
          <Button
            className={`${styles.filterBtn} ${activeCategory === 'VACANCY' ? styles.active : ''} ${
              darkMode ? styles.darkFilterBtn : ''
            }`}
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
              className={`${styles.filterBtn} ${
                activeCategory === 'VACANCY' ? styles.active : ''
              } ${darkMode ? styles.darkFilterBtn : ''}`}
            />
            <DropdownMenu
              className={`${styles.dropdownMenu} ${darkMode ? styles.darkDropdown : ''}`}
            >
              {/* ...existing dropdown items with dark mode classes... */}
              {METRIC_OPTIONS.VACANCY.map(m => (
                <DropdownItem
                  key={m.key}
                  active={selectedMetricKey === m.key}
                  onClick={() => handleMetricPick('VACANCY', m.key)}
                  className={`${styles.dropdownItem} ${
                    selectedMetricKey === m.key ? styles.dropdownActive : ''
                  } ${darkMode ? styles.darkDropdownItem : ''}`}
                >
                  {m.label}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </ButtonDropdown>

          {/* REVENUE */}
          <Button
            className={`${styles.filterBtn} ${activeCategory === 'REVENUE' ? styles.active : ''} ${
              darkMode ? styles.darkFilterBtn : ''
            }`}
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
              className={`${styles.filterBtn} ${
                activeCategory === 'REVENUE' ? styles.active : ''
              } ${darkMode ? styles.darkFilterBtn : ''}`}
            />
            <DropdownMenu
              className={`${styles.dropdownMenu} ${darkMode ? styles.darkDropdown : ''}`}
            >
              {METRIC_OPTIONS.REVENUE.map(m => (
                <DropdownItem
                  key={m.key}
                  active={selectedMetricKey === m.key}
                  onClick={() => handleMetricPick('REVENUE', m.key)}
                  className={`${styles.dropdownItem} ${
                    selectedMetricKey === m.key ? styles.dropdownActive : ''
                  } ${darkMode ? styles.darkDropdownItem : ''}`}
                >
                  {m.label}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </ButtonDropdown>
        </ButtonGroup>

        <div className={`${styles.currentMetric} ${darkMode ? styles.darkText : ''}`}>
          Current metric:&nbsp;<strong>{metricLabel}</strong>
        </div>
      </section>

      {/* Apply dark mode to sections */}
      {/* By Village */}
      <section className={`${styles.section} ${darkMode ? styles.darkSection : ''}`}>
        <details>
          <summary
            className={`${styles.sectionSummary} ${darkMode ? styles.darkSectionSummary : ''}`}
          >
            By Village
          </summary>
          <div className={`${styles.sectionBody} ${darkMode ? styles.darkSectionBody : ''}`}>
            <Row xs="1" md="3" className="g-3">
              <Col>
                <DemandOverTime
                  masterMetricCategory={activeCategory}
                  masterMetric={METRIC_MAPPING[selectedMetricKey]}
                  compareType="villages"
                  chartLabel="Comparing Demand of Villages across Months"
                  darkMode={darkMode}
                />
              </Col>
              <Col>
                <DemandOverTime
                  masterMetricCategory={activeCategory}
                  masterMetric={METRIC_MAPPING[selectedMetricKey]}
                  compareType="villages"
                  chartLabel="Demand across Villages"
                  darkMode={darkMode}
                />
              </Col>
              <Col>
                <DemandOverTime
                  masterMetricCategory={activeCategory}
                  masterMetric={METRIC_MAPPING[selectedMetricKey]}
                  compareType="villages"
                  chartLabel="Comparing Villages"
                  darkMode={darkMode}
                />
              </Col>
            </Row>
          </div>
        </details>
      </section>

      {/* Apply dark mode to other sections the same way */}
      {/* By Property */}
      <section className={`${styles.section} ${darkMode ? styles.darkSection : ''}`}>
        <details>
          <summary
            className={`${styles.sectionSummary} ${darkMode ? styles.darkSectionSummary : ''}`}
          >
            By Property
          </summary>
          <div className={`${styles.sectionBody} ${darkMode ? styles.darkSectionBody : ''}`}>
            <Row xs="1" md="2" className="g-3">
              <Col>
                <DemandOverTime
                  masterMetricCategory={activeCategory}
                  masterMetric={METRIC_MAPPING[selectedMetricKey]}
                  compareType="properties"
                  chartLabel="Comparing Demand of Properties across Time"
                  darkMode={darkMode}
                />
              </Col>
              <Col>
                <DemandOverTime
                  masterMetricCategory={activeCategory}
                  masterMetric={METRIC_MAPPING[selectedMetricKey]}
                  compareType="properties"
                  chartLabel="Comparing Ratings of Properties"
                  darkMode={darkMode}
                />
              </Col>
            </Row>
          </div>
        </details>
      </section>

      {/* Insights from Reviews */}
      <section className={`${styles.section} ${darkMode ? styles.darkSection : ''}`}>
        <details>
          <summary
            className={`${styles.sectionSummary} ${darkMode ? styles.darkSectionSummary : ''}`}
          >
            Insights from Reviews
          </summary>
          <div className={`${styles.sectionBody} ${darkMode ? styles.darkSectionBody : ''}`}>
            <Row xs="1" md="2" className="g-3">
              <Col>
                <Card className={`${styles.wordcloudCard} ${darkMode ? styles.darkCard : ''}`}>
                  <CardBody
                    className={`${styles.wordcloudBody} ${darkMode ? styles.darkCardBody : ''}`}
                  >
                    <div className={`${styles.wordcloudTitle} ${darkMode ? styles.darkText : ''}`}>
                      Village Wordcloud
                    </div>
                    <div
                      className={`${styles.wordcloudPlaceholder} ${
                        darkMode ? styles.darkPlaceholder : ''
                      }`}
                    >
                      Wordcloud area
                    </div>
                  </CardBody>
                </Card>
              </Col>
              <Col>
                <Card className={`${styles.wordcloudCard} ${darkMode ? styles.darkCard : ''}`}>
                  <CardBody
                    className={`${styles.wordcloudBody} ${darkMode ? styles.darkCardBody : ''}`}
                  >
                    <div className={`${styles.wordcloudTitle} ${darkMode ? styles.darkText : ''}`}>
                      Property Wordcloud
                    </div>
                    <div
                      className={`${styles.wordcloudPlaceholder} ${
                        darkMode ? styles.darkPlaceholder : ''
                      }`}
                    >
                      Wordcloud area
                    </div>
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
