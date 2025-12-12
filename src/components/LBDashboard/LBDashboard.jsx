import { useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import {
  Container,
  Button,
  ButtonGroup,
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Card,
} from 'reactstrap';
import ReviewWordCloud from './ReviewWordCloud/ReviewWordCloud';
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

function GraphCard({ title, metricLabel, darkMode }) {
  return (
    <Card className={`${styles.graphCard} ${darkMode ? styles.darkCard : ''}`}>
      <div>
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
      </div>
    </Card>
  );
}

GraphCard.propTypes = {
  title: PropTypes.string.isRequired,
  metricLabel: PropTypes.string,
  darkMode: PropTypes.bool,
};

const CategoryControls = ({
  categoryKey,
  label,
  activeCategory,
  selectedMetricKey,
  openDD,
  darkMode,
  onCategoryClick,
  onMetricPick,
  onToggleDD,
}) => (
  <>
    <Button
      className={`${styles.filterBtn} ${activeCategory === categoryKey ? styles.active : ''} ${
        darkMode ? styles.darkFilterBtn : ''
      }`}
      onClick={() => onCategoryClick(categoryKey)}
    >
      {label}
    </Button>

    <ButtonDropdown
      isOpen={openDD[categoryKey]}
      toggle={() => onToggleDD(categoryKey)}
      className={styles.dd}
    >
      <DropdownToggle
        caret
        className={`${styles.filterBtn} ${activeCategory === categoryKey ? styles.active : ''} ${
          darkMode ? styles.darkFilterBtn : ''
        }`}
      />
      <DropdownMenu className={`${styles.dropdownMenu} ${darkMode ? styles.darkDropdownMenu : ''}`}>
        {METRIC_OPTIONS[categoryKey].map(m => (
          <DropdownItem
            key={m.key}
            active={selectedMetricKey === m.key}
            onClick={() => onMetricPick(categoryKey, m.key)}
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

CategoryControls.propTypes = {
  categoryKey: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  activeCategory: PropTypes.string.isRequired,
  selectedMetricKey: PropTypes.string.isRequired,
  openDD: PropTypes.object.isRequired,
  darkMode: PropTypes.bool,
  onCategoryClick: PropTypes.func.isRequired,
  onMetricPick: PropTypes.func.isRequired,
  onToggleDD: PropTypes.func.isRequired,
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

  const getMetricLabel = () => {
    const all = Object.values(METRIC_OPTIONS).flat();
    return (all.find(o => o.key === selectedMetricKey) || {}).label || '';
  };

  const handleCategoryClick = category => {
    setActiveCategory(category);
    setSelectedMetricKey(DEFAULTS[category]);
  };

  const handleMetricPick = (category, key) => {
    setActiveCategory(category);
    setSelectedMetricKey(key);
  };

  const toggleDD = category => setOpenDD(s => ({ ...s, [category]: !s[category] }));

  const goBack = () => globalThis.history.back();

  const metricLabel = getMetricLabel();

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
          <CategoryControls
            categoryKey="DEMAND"
            label="Demand"
            activeCategory={activeCategory}
            selectedMetricKey={selectedMetricKey}
            openDD={openDD}
            darkMode={darkMode}
            onCategoryClick={handleCategoryClick}
            onMetricPick={handleMetricPick}
            onToggleDD={toggleDD}
          />
          <CategoryControls
            categoryKey="VACANCY"
            label="Vacancy"
            activeCategory={activeCategory}
            selectedMetricKey={selectedMetricKey}
            openDD={openDD}
            darkMode={darkMode}
            onCategoryClick={handleCategoryClick}
            onMetricPick={handleMetricPick}
            onToggleDD={toggleDD}
          />
          <CategoryControls
            categoryKey="REVENUE"
            label="Revenue"
            activeCategory={activeCategory}
            selectedMetricKey={selectedMetricKey}
            openDD={openDD}
            darkMode={darkMode}
            onCategoryClick={handleCategoryClick}
            onMetricPick={handleMetricPick}
            onToggleDD={toggleDD}
          />
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
            <ReviewWordCloud darkMode={darkMode} />
          </div>
        </details>
      </section>
    </Container>
  );
}

export default LBDashboard;
