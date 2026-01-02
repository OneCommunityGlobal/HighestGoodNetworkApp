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
import RatingDistribution from './RatingDistribution/RatingDistribution';
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

// Helper function to get class names
const getClassNames = (baseClass, darkClass, darkMode) =>
  `${baseClass} ${darkMode ? darkClass : ''}`;

// Extracted header component
const DashboardHeader = ({ darkMode, onBack }) => (
  <header className={styles.dashboardHeader}>
    <h1 className={getClassNames(styles.title, styles.darkText, darkMode)}>
      Listing and Bidding Platform Dashboard
    </h1>
    <Button
      size="sm"
      onClick={onBack}
      className={getClassNames(styles.backBtn, styles.darkBackBtn, darkMode)}
    >
      Back
    </Button>
  </header>
);

DashboardHeader.propTypes = {
  darkMode: PropTypes.bool,
  onBack: PropTypes.func.isRequired,
};

// Extracted filter section component
const FilterSection = ({
  darkMode,
  activeCategory,
  selectedMetricKey,
  openDD,
  metricLabel,
  onCategoryClick,
  onMetricPick,
  onToggleDD,
}) => (
  <section className={getClassNames(styles.filterBar, styles.darkFilterBar, darkMode)}>
    <div className={getClassNames(styles.filterLabel, styles.darkFilterLabel, darkMode)}>
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
        onCategoryClick={onCategoryClick}
        onMetricPick={onMetricPick}
        onToggleDD={onToggleDD}
      />
      <CategoryControls
        categoryKey="VACANCY"
        label="Vacancy"
        activeCategory={activeCategory}
        selectedMetricKey={selectedMetricKey}
        openDD={openDD}
        darkMode={darkMode}
        onCategoryClick={onCategoryClick}
        onMetricPick={onMetricPick}
        onToggleDD={onToggleDD}
      />
      <CategoryControls
        categoryKey="REVENUE"
        label="Revenue"
        activeCategory={activeCategory}
        selectedMetricKey={selectedMetricKey}
        openDD={openDD}
        darkMode={darkMode}
        onCategoryClick={onCategoryClick}
        onMetricPick={onMetricPick}
        onToggleDD={onToggleDD}
      />
    </ButtonGroup>

    <div className={getClassNames(styles.currentMetric, styles.darkText, darkMode)}>
      Current metric:&nbsp;<strong>{metricLabel}</strong>
    </div>
  </section>
);

FilterSection.propTypes = {
  darkMode: PropTypes.bool,
  activeCategory: PropTypes.string.isRequired,
  selectedMetricKey: PropTypes.string.isRequired,
  openDD: PropTypes.object.isRequired,
  metricLabel: PropTypes.string,
  onCategoryClick: PropTypes.func.isRequired,
  onMetricPick: PropTypes.func.isRequired,
  onToggleDD: PropTypes.func.isRequired,
};

// Extracted analysis section component
const AnalysisSection = ({ title, darkMode, children }) => (
  <section className={getClassNames(styles.section, styles.darkSection, darkMode)}>
    <details>
      <summary
        className={getClassNames(styles.sectionSummary, styles.darkSectionSummary, darkMode)}
      >
        {title}
      </summary>
      <div className={getClassNames(styles.sectionBody, styles.darkSectionBody, darkMode)}>
        {children}
      </div>
    </details>
  </section>
);

AnalysisSection.propTypes = {
  title: PropTypes.string.isRequired,
  darkMode: PropTypes.bool,
  children: PropTypes.node,
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
  const mappedMetric = METRIC_MAPPING[selectedMetricKey];

  return (
    <Container
      fluid
      className={getClassNames(styles.dashboardContainer, styles.darkContainer, darkMode)}
    >
      <DashboardHeader darkMode={darkMode} onBack={goBack} />

      <FilterSection
        darkMode={darkMode}
        activeCategory={activeCategory}
        selectedMetricKey={selectedMetricKey}
        openDD={openDD}
        metricLabel={metricLabel}
        onCategoryClick={handleCategoryClick}
        onMetricPick={handleMetricPick}
        onToggleDD={toggleDD}
      />

      <AnalysisSection title="By Village" darkMode={darkMode}>
        <div className={styles.chartRow}>
          <div className={styles.chartCol}>
            <DemandOverTime
              compareType="villages"
              metric={mappedMetric}
              chartLabel="Comparing Demand of Villages across Months"
              darkMode={darkMode}
              dateRange={dateRange}
            />
          </div>
          <div className={styles.chartCol}>
            <Card className={getClassNames(styles.wordcloudCard, styles.darkCard, darkMode)}>
              another graph
            </Card>
          </div>
          <div className={styles.chartCol}>
            <Card className={getClassNames(styles.wordcloudCard, styles.darkCard, darkMode)}>
              another graph
            </Card>
          </div>
        </div>
      </AnalysisSection>

      <AnalysisSection title="By Property" darkMode={darkMode}>
        <div className={styles.chartRow}>
          <div className={styles.chartCol}>
            <DemandOverTime
              compareType="properties"
              metric={mappedMetric}
              chartLabel="Comparing Demand of Properties across Time"
              darkMode={darkMode}
              dateRange={dateRange}
            />
          </div>
        </div>
      </AnalysisSection>

      <AnalysisSection title="Insights from Reviews" darkMode={darkMode}>
        <div className={styles.chartRow}>
          <div className={styles.chartCol}>
            <RatingDistribution darkMode={darkMode} />
          </div>
          <div className={styles.chartCol}>
            <ReviewWordCloud darkMode={darkMode} />
          </div>
        </div>
      </AnalysisSection>
    </Container>
  );
}

export default LBDashboard;
