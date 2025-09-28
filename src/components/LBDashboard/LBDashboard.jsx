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
import moment from 'moment';

const METRIC_OPTIONS = {
  DEMAND: [
    { key: 'pageVisits', label: 'Page Visits' },
    { key: 'numBids', label: 'Number of Bids' },
    { key: 'avgRating', label: 'Average Rating' },
  ],
  REVENUE: [
    { key: 'avgBid', label: 'Average Bid' },
    { key: 'finalPrice', label: 'Final Price / Income' },
  ],
  VACANCY: [
    { key: 'occupancyRate', label: 'Occupancy Rate (% days not vacant)' },
    { key: 'avgStay', label: 'Average Duration of Stay' },
  ],
};

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

export function LBDashboard() {
  const [activeCategory, setActiveCategory] = useState('DEMAND');
  const [selectedMetricKey, setSelectedMetricKey] = useState(DEFAULTS.DEMAND);
  const [openDD, setOpenDD] = useState({ DEMAND: false, REVENUE: false, VACANCY: false });
  const darkMode = useSelector(state => state.theme.darkMode);

  const dateRange = [
    moment()
      .subtract(1, 'year')
      .startOf('month'),
    moment().endOf('month'),
  ];

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

  const goBack = () => window.history.back();

  return (
    <Container fluid className={`${styles.dashboardContainer} ${darkMode ? styles.darkMode : ''}`}>
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

      <section className={`${styles.filterBar} ${darkMode ? styles.darkFilterBar : ''}`}>
        <div className={styles.filterLabel}>Choose Metric to view</div>
        <ButtonGroup className={styles.categoryGroup}>
          {['DEMAND', 'VACANCY', 'REVENUE'].map(category => (
            <span key={category}>
              <Button
                className={`${styles.filterBtn} ${
                  activeCategory === category ? styles.active : ''
                } ${darkMode ? styles.darkFilterBtn : ''}`}
                onClick={() => handleCategoryClick(category)}
              >
                {category.charAt(0) + category.slice(1).toLowerCase()}
              </Button>
              <ButtonDropdown
                isOpen={openDD[category]}
                toggle={() => toggleDD(category)}
                className={styles.dd}
              >
                <DropdownToggle
                  caret
                  className={`${styles.filterBtn} ${
                    activeCategory === category ? styles.active : ''
                  } ${darkMode ? styles.darkFilterBtn : ''}`}
                />
                <DropdownMenu
                  className={`${styles.dropdownMenu} ${darkMode ? styles.darkDropdown : ''}`}
                >
                  {METRIC_OPTIONS[category].map(m => (
                    <DropdownItem
                      key={m.key}
                      active={selectedMetricKey === m.key}
                      onClick={() => handleMetricPick(category, m.key)}
                      className={`${styles.dropdownItem} ${
                        selectedMetricKey === m.key ? styles.dropdownActive : ''
                      } ${darkMode ? styles.darkDropdownItem : ''}`}
                    >
                      {m.label}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </ButtonDropdown>
            </span>
          ))}
        </ButtonGroup>
        <div className={`${styles.currentMetric} ${darkMode ? styles.darkText : ''}`}>
          Current metric:&nbsp;<strong>{metricLabel}</strong>
        </div>
      </section>

      <section className={`${styles.section} ${darkMode ? styles.darkSection : ''}`}>
        <details>
          <summary
            className={`${styles.sectionSummary} ${darkMode ? styles.darkSectionSummary : ''}`}
          >
            By Village
          </summary>
          <div className={`${styles.sectionBody} ${darkMode ? styles.darkSectionBody : ''}`}>
            <div className={styles.chartRow}>
              <div className={styles.chartCol}>
                <DemandOverTime
                  compareType="villages"
                  metric={METRIC_MAPPING[selectedMetricKey]}
                  chartLabel="Comparing Demand of Villages across Months"
                  darkMode={darkMode}
                  dateRange={dateRange}
                />
              </div>
              <div className={styles.chartCol}>
                <Card className={`${styles.wordcloudCard} ${darkMode ? styles.darkCard : ''}`}>
                  another graph
                </Card>
              </div>
              <div className={styles.chartCol}>
                <Card className={`${styles.wordcloudCard} ${darkMode ? styles.darkCard : ''}`}>
                  another graph
                </Card>
              </div>
            </div>
          </div>
        </details>
      </section>

      <section className={`${styles.section} ${darkMode ? styles.darkSection : ''}`}>
        <details>
          <summary
            className={`${styles.sectionSummary} ${darkMode ? styles.darkSectionSummary : ''}`}
          >
            By Property
          </summary>
          <div className={`${styles.sectionBody} ${darkMode ? styles.darkSectionBody : ''}`}>
            <div className={styles.chartRow}>
              <div className={styles.chartCol}>
                <DemandOverTime
                  compareType="properties"
                  metric={METRIC_MAPPING[selectedMetricKey]}
                  chartLabel="Comparing Demand of Properties across Time"
                  darkMode={darkMode}
                  dateRange={dateRange}
                />
              </div>
              <div className={styles.chartCol}>
                <Card className={`${styles.wordcloudCard} ${darkMode ? styles.darkCard : ''}`}>
                  another graph
                </Card>
              </div>
            </div>
          </div>
        </details>
      </section>

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
