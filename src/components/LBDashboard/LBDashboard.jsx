import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import {
  Container,
  Button,
  ButtonGroup,
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Card,
  Row,
  Col,
} from 'reactstrap';

import DemandOverTime from './LbAnalytics/DemandOverTime/DemandOverTime';
import ReviewWordCloud from './ReviewWordCloud/ReviewWordCloud';
import { CompareBarGraph } from './BarGraphs/CompareGraphs';
import { ComparePropertiesRatings } from './BarGraphs/ComparePropertiesRatings';

import httpService from '../../services/httpService';
import { ApiEndpoint } from '../../utils/URL';

import styles from './LBDashboard.module.css';

function randomInt(min, max) {
  const range = max - min + 1;
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    if (range <= 256) {
      const arr = new Uint8Array(1);
      const limit = 256 - (256 % range);
      let r;
      do {
        crypto.getRandomValues(arr);
        r = arr[0];
      } while (r >= limit);
      return min + (r % range);
    } else {
      const arr = new Uint32Array(1);
      const MAX = 0x100000000;
      const limit = MAX - (MAX % range);
      let r;
      do {
        crypto.getRandomValues(arr);
        r = arr[0];
      } while (r >= limit);
      return min + (r % range);
    }
  }
  return Math.floor(Math.random() * range) + min;
}

const METRIC_OPTIONS = {
  DEMAND: [
    { key: 'pageVisits', label: 'Page Visits', biddingOnly: false },
    { key: 'numBids', label: 'Number of Bids', biddingOnly: true },
    { key: 'avgRating', label: 'Average Rating', biddingOnly: false },
  ],
  REVENUE: [
    { key: 'avgBid', label: 'Average Bid', biddingOnly: true },
    { key: 'finalPrice', label: 'Final Price / Income', biddingOnly: true },
  ],
  VACANCY: [
    { key: 'occupancyRate', label: 'Occupancy Rate (% days not vacant)', biddingOnly: false },
    { key: 'avgStay', label: 'Average Duration of Stay', biddingOnly: false },
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

const getClassNames = (baseClass, darkClass, darkMode) =>
  `${baseClass} ${darkMode ? darkClass : ''}`;

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
  listingBiddingFilter,
  onCategoryClick,
  onMetricPick,
  onToggleDD,
}) => {
  const availableMetrics = METRIC_OPTIONS[categoryKey].filter(
    m => listingBiddingFilter !== 'listing' || !m.biddingOnly,
  );

  return (
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
        <DropdownMenu
          className={`${styles.dropdownMenu} ${darkMode ? styles.darkDropdownMenu : ''}`}
        >
          {availableMetrics.map(m => (
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
};

CategoryControls.propTypes = {
  categoryKey: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  activeCategory: PropTypes.string.isRequired,
  selectedMetricKey: PropTypes.string.isRequired,
  openDD: PropTypes.object.isRequired,
  darkMode: PropTypes.bool,
  listingBiddingFilter: PropTypes.string.isRequired,
  onCategoryClick: PropTypes.func.isRequired,
  onMetricPick: PropTypes.func.isRequired,
  onToggleDD: PropTypes.func.isRequired,
};

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

const FilterSection = ({
  darkMode,
  activeCategory,
  selectedMetricKey,
  openDD,
  metricLabel,
  fromDate,
  toDate,
  compareType,
  listingBiddingFilter,
  onCategoryClick,
  onMetricPick,
  onToggleDD,
  onFromDateChange,
  onToDateChange,
  onCompareTypeChange,
  onListingBiddingChange,
}) => (
  <section className={getClassNames(styles.filterBar, styles.darkFilterBar, darkMode)}>
    <div className={styles.filterGrid}>
      {/* From Date */}
      <div className={styles.filterGroup}>
        <label
          htmlFor="lbDashboard-fromDate"
          className={getClassNames(styles.filterLabel, styles.darkFilterLabel, darkMode)}
        >
          From Date
        </label>
        <DatePicker
          id="lbDashboard-fromDate"
          selected={fromDate}
          onChange={onFromDateChange}
          dateFormat="MMM dd, yyyy"
          maxDate={toDate}
          className={`${styles.dateInput} ${darkMode ? styles.darkDateInput : ''}`}
        />
      </div>

      {/* To Date */}
      <div className={styles.filterGroup}>
        <label
          htmlFor="lbDashboard-toDate"
          className={getClassNames(styles.filterLabel, styles.darkFilterLabel, darkMode)}
        >
          To Date
        </label>
        <DatePicker
          id="lbDashboard-toDate"
          selected={toDate}
          onChange={onToDateChange}
          dateFormat="MMM dd, yyyy"
          minDate={fromDate}
          maxDate={new Date()}
          className={`${styles.dateInput} ${darkMode ? styles.darkDateInput : ''}`}
        />
      </div>

      {/* Compare By */}
      <div className={styles.filterGroup}>
        <label
          htmlFor="lbDashboard-compareType"
          className={getClassNames(styles.filterLabel, styles.darkFilterLabel, darkMode)}
        >
          Compare By
        </label>
        <select
          id="lbDashboard-compareType"
          value={compareType}
          onChange={e => onCompareTypeChange(e.target.value)}
          className={`${styles.selectInput} ${darkMode ? styles.darkSelectInput : ''}`}
        >
          <option value="villages">Villages</option>
          <option value="properties">Properties</option>
        </select>
      </div>

      {/* Type */}
      <div className={styles.filterGroup}>
        <label
          htmlFor="lbDashboard-typeFilter"
          className={getClassNames(styles.filterLabel, styles.darkFilterLabel, darkMode)}
        >
          Type
        </label>
        <select
          id="lbDashboard-typeFilter"
          value={listingBiddingFilter}
          onChange={e => onListingBiddingChange(e.target.value)}
          className={`${styles.selectInput} ${darkMode ? styles.darkSelectInput : ''}`}
        >
          <option value="all">All</option>
          <option value="listing">Listing</option>
          <option value="bidding">Bidding</option>
        </select>
      </div>
    </div>

    {/* Metric Selection */}
    <div className={styles.metricSection}>
      <div className={getClassNames(styles.filterLabel, styles.darkFilterLabel, darkMode)}>
        Metric
      </div>
      <ButtonGroup className={styles.categoryGroup}>
        <CategoryControls
          categoryKey="DEMAND"
          label="Demand"
          activeCategory={activeCategory}
          selectedMetricKey={selectedMetricKey}
          openDD={openDD}
          darkMode={darkMode}
          listingBiddingFilter={listingBiddingFilter}
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
          listingBiddingFilter={listingBiddingFilter}
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
          listingBiddingFilter={listingBiddingFilter}
          onCategoryClick={onCategoryClick}
          onMetricPick={onMetricPick}
          onToggleDD={onToggleDD}
        />
      </ButtonGroup>
      <div className={getClassNames(styles.currentMetric, styles.darkText, darkMode)}>
        Current:&nbsp;<strong>{metricLabel}</strong>
      </div>
    </div>
  </section>
);

FilterSection.propTypes = {
  darkMode: PropTypes.bool,
  activeCategory: PropTypes.string.isRequired,
  selectedMetricKey: PropTypes.string.isRequired,
  openDD: PropTypes.object.isRequired,
  metricLabel: PropTypes.string,
  fromDate: PropTypes.instanceOf(Date).isRequired,
  toDate: PropTypes.instanceOf(Date).isRequired,
  compareType: PropTypes.string.isRequired,
  listingBiddingFilter: PropTypes.string.isRequired,
  onCategoryClick: PropTypes.func.isRequired,
  onMetricPick: PropTypes.func.isRequired,
  onToggleDD: PropTypes.func.isRequired,
  onFromDateChange: PropTypes.func.isRequired,
  onToDateChange: PropTypes.func.isRequired,
  onCompareTypeChange: PropTypes.func.isRequired,
  onListingBiddingChange: PropTypes.func.isRequired,
};

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

  // Date range state - default to last 365 days
  const [fromDate, setFromDate] = useState(
    moment()
      .subtract(365, 'days')
      .toDate(),
  );
  const [toDate, setToDate] = useState(moment().toDate());

  // Compare type: 'villages' or 'properties'
  const [compareType, setCompareType] = useState('villages');

  // Listing/Bidding filter: 'all', 'listing', 'bidding'
  const [listingBiddingFilter, setListingBiddingFilter] = useState('all');

  // --- Mock Villages data ---
  const [villagesRaw, setVillagesRaw] = useState([]);
  const [loadingVillages, setLoadingVillages] = useState(false);
  const [villagesError, setVillagesError] = useState(null);

  useEffect(() => {
    setLoadingVillages(true);

    // Generate mock data based on filters
    const generateMockVillages = () => {
      const villages = [
        { name: 'Tree House Village', regionId: '7' },
        { name: 'Cob Village', regionId: '3' },
        { name: 'Earthbag Village', regionId: '1' },
        { name: 'Recycled Materials Village', regionId: '6' },
        { name: 'Straw Bale Village', regionId: '2' },
        { name: 'Earth Block Village', regionId: '4' },
        { name: 'Duplicable City Center', regionId: 'C' },
        { name: 'Shipping Container Village', regionId: '5' },
      ];

      // Calculate a seed based on date range
      const daysDiff = moment(toDate).diff(moment(fromDate), 'days');
      const dateSeed = daysDiff > 0 ? daysDiff : 1;

      return villages.map(v => {
        // Different ranges based on listing/bidding filter
        const multiplier =
          listingBiddingFilter === 'bidding' ? 0.6 : listingBiddingFilter === 'listing' ? 1.2 : 1;

        return {
          _id: v.regionId,
          name: v.name,
          regionId: v.regionId,
          analytics: {
            pageVisits: Math.floor(randomInt(10, 80) * multiplier * (dateSeed / 30)),
            numberOfBids: Math.floor(randomInt(5, 40) * multiplier * (dateSeed / 60)),
            averageBid: randomInt(20000, 100000),
            finalPrice: randomInt(50000, 150000),
            occupancyRate: randomInt(50, 98),
            averageStay: randomInt(3, 45),
          },
        };
      });
    };

    setTimeout(() => {
      setVillagesRaw(generateMockVillages());
      setLoadingVillages(false);
    }, 300);
  }, [fromDate, toDate, listingBiddingFilter]);

  const dateRange = useMemo(() => [moment(fromDate).startOf('day'), moment(toDate).endOf('day')], [
    fromDate,
    toDate,
  ]);

  const getMetricLabel = () => {
    const all = Object.values(METRIC_OPTIONS).flat();
    return (all.find(o => o.key === selectedMetricKey) || {}).label || '';
  };

  // Decide which numeric value to calculate for the bar chart
  const effectiveMetric = useMemo(() => {
    switch (selectedMetricKey) {
      case 'avgBid':
      case 'finalPrice':
        return 'avgCurrentBid';
      case 'pageVisits':
      case 'numBids':
      case 'avgRating':
      case 'occupancyRate':
      case 'avgStay':
        return 'totalCurrentBid';
      default:
        return 'totalCurrentBid';
    }
  }, [selectedMetricKey]);

  const valueFormatter = useMemo(() => {
    if (selectedMetricKey === 'avgRating') return v => Number(v).toFixed(2);
    if (selectedMetricKey === 'occupancyRate') return v => `${v}%`;
    if (selectedMetricKey === 'avgStay') return v => `${v} days`;
    if (selectedMetricKey === 'avgBid' || selectedMetricKey === 'finalPrice') {
      return v => `₹${Number(v).toLocaleString()}`;
    }
    return v => Number(v);
  }, [selectedMetricKey]);

  // Derive villagesData from backend
  const villagesData = useMemo(() => {
    if (!villagesRaw.length) return [];

    return villagesRaw
      .map(v => {
        const analytics = v.analytics || {};
        let value = 0;

        // Map selected metric to analytics field
        switch (selectedMetricKey) {
          case 'pageVisits':
            value = analytics.pageVisits || 0;
            break;
          case 'numBids':
            value = analytics.numberOfBids || 0;
            break;
          case 'avgBid':
            value = analytics.averageBid || 0;
            break;
          case 'finalPrice':
            value = analytics.finalPrice || 0;
            break;
          case 'avgRating':
            value = analytics.averageRating || randomInt(30, 50) / 10;
            break;
          case 'occupancyRate':
            value = analytics.occupancyRate || 0;
            break;
          case 'avgStay':
            value = analytics.averageStay || 0;
            break;
          default:
            // Fallback to old logic for properties.currentBid
            const props = Array.isArray(v.properties) ? v.properties : [];
            const bids = props.map(p => Number(p?.currentBid || 0));
            const sum = bids.reduce((a, b) => a + b, 0);
            value = sum;
        }

        return {
          village: v.name || v.regionId || 'Unknown',
          value,
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 20);
  }, [villagesRaw, selectedMetricKey]);

  const stripVillageWord = s => {
    const str = String(s || '');
    const suffix = ' village';
    return str.toLowerCase().endsWith(suffix) ? str.slice(0, str.length - suffix.length) : str;
  };

  const villagesDataClean = useMemo(
    () =>
      villagesData.map(d => ({
        ...d,
        village: stripVillageWord(d.village),
      })),
    [villagesData],
  );

  const handleCategoryClick = category => {
    setActiveCategory(category);
    const availableMetrics = METRIC_OPTIONS[category].filter(
      m => listingBiddingFilter !== 'listing' || !m.biddingOnly,
    );
    const defaultMetric = availableMetrics.find(m => m.key === DEFAULTS[category]);
    setSelectedMetricKey(defaultMetric ? defaultMetric.key : availableMetrics[0]?.key);
  };

  const handleMetricPick = (category, key) => {
    setActiveCategory(category);
    setSelectedMetricKey(key);
  };

  const handleListingBiddingChange = newFilter => {
    setListingBiddingFilter(newFilter);
    if (newFilter === 'listing') {
      const currentOption = Object.values(METRIC_OPTIONS)
        .flat()
        .find(m => m.key === selectedMetricKey);
      if (currentOption?.biddingOnly) {
        const availableMetrics = METRIC_OPTIONS[activeCategory].filter(m => !m.biddingOnly);
        if (availableMetrics.length > 0) {
          setSelectedMetricKey(availableMetrics[0].key);
        } else {
          setActiveCategory('DEMAND');
          setSelectedMetricKey('pageVisits');
        }
      }
    }
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
        fromDate={fromDate}
        toDate={toDate}
        compareType={compareType}
        listingBiddingFilter={listingBiddingFilter}
        onCategoryClick={handleCategoryClick}
        onMetricPick={handleMetricPick}
        onToggleDD={toggleDD}
        onFromDateChange={setFromDate}
        onToDateChange={setToDate}
        onCompareTypeChange={setCompareType}
        onListingBiddingChange={handleListingBiddingChange}
      />

      {compareType === 'villages' && (
        <AnalysisSection title="By Village" darkMode={darkMode}>
          <Row xs="1" md="3" className="g-3">
            <Col>
              <DemandOverTime
                compareType="villages"
                metric={mappedMetric}
                chartLabel="Comparing Demand of Villages across Months"
                darkMode={darkMode}
                dateRange={dateRange}
              />
            </Col>

            <Col>
              {loadingVillages && (
                <div className={getClassNames('', styles.darkText, darkMode)}>
                  Loading villages…
                </div>
              )}
              {villagesError && (
                <div className={getClassNames('', styles.darkText, darkMode)}>{villagesError}</div>
              )}

              {!loadingVillages && !villagesError && (
                <CompareBarGraph
                  title="Demand across Villages"
                  orientation="horizontal"
                  data={villagesDataClean}
                  nameKey="village"
                  valueKey="value"
                  xLabel="Value"
                  yLabel="Village Name"
                  showYAxisTitle={true}
                  yTickFormatter={stripVillageWord}
                  yCategoryWidth={120}
                  margins={{ top: 20, right: 50, bottom: 50, left: 100 }}
                  barSize={24}
                  maxBars={6}
                  valueFormatter={valueFormatter}
                  headerChips={[
                    { label: 'Dates', value: 'ALL' },
                    { label: 'Villages', value: 'ALL' },
                    { label: 'Metric', value: metricLabel || 'ALL' },
                    { label: 'List/Bid', value: 'ALL' },
                  ]}
                />
              )}
            </Col>

            <Col>
              <GraphCard title="Comparing Villages" metricLabel={metricLabel} darkMode={darkMode} />
            </Col>
          </Row>
        </AnalysisSection>
      )}

      {compareType === 'properties' && (
        <AnalysisSection title="By Property" darkMode={darkMode}>
          <Row xs="1" md="2" className="g-3">
            <Col>
              <DemandOverTime
                compareType="properties"
                metric={mappedMetric}
                chartLabel="Comparing Demand of Properties across Time"
                darkMode={darkMode}
                dateRange={dateRange}
              />
            </Col>

            <Col>
              <ComparePropertiesRatings
                fromDate={fromDate}
                toDate={toDate}
                listingBiddingFilter={listingBiddingFilter}
                selectedMetricKey={selectedMetricKey}
              />
            </Col>
          </Row>
        </AnalysisSection>
      )}

      <AnalysisSection title="Insights from Reviews" darkMode={darkMode}>
        <ReviewWordCloud darkMode={darkMode} />
      </AnalysisSection>
    </Container>
  );
}

export default LBDashboard;
