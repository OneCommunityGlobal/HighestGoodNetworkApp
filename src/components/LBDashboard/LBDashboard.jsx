import { useState, useEffect, useMemo } from 'react';
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
import { CompareBarGraph } from './BarGraphs/CompareGraphs';

import httpService from '../../services/httpService';
import { ApiEndpoint } from '../../utils/URL';

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

const DEFAULTS = {
  DEMAND: 'pageVisits',
  REVENUE: 'finalPrice',
  VACANCY: 'occupancyRate',
};

//Dummy Data For Property
const propertiesData = [
  { property: 'House AB', value: 4.72 },
  { property: 'Room A', value: 4.5 },
  { property: 'Room C', value: 4.05 },
  { property: 'Room A34', value: 3.91 },
  { property: 'Room 5', value: 3.0 },
];

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

  // ---- Backend data from /villages ----
  const [villagesRaw, setVillagesRaw] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dateChipValue = 'ALL';

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await httpService.get(`${ApiEndpoint}/villages`);
        if (!mounted) return;
        setVillagesRaw(Array.isArray(res?.data) ? res.data : []);
      } catch (e) {
        if (!mounted) return;
        setError('Failed to load villages');
        setVillagesRaw([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const metricLabel = (() => {
    const all = Object.values(METRIC_OPTIONS).flat();
    return (all.find(o => o.key === selectedMetricKey) || {}).label || '';
  })();

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
        const props = Array.isArray(v.properties) ? v.properties : [];
        const bids = props.map(p => Number(p?.currentBid || 0));
        const sum = bids.reduce((a, b) => a + b, 0);
        const avg = bids.length ? sum / bids.length : 0;
        const count = props.length;

        const value =
          effectiveMetric === 'avgCurrentBid'
            ? avg
            : effectiveMetric === 'propertyCount'
            ? count
            : /* totalCurrentBid (default) */ sum;

        return {
          village: v.name || v.regionId || 'Unknown',
          value,
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 20);
  }, [villagesRaw, effectiveMetric]);

  const stripVillageWord = s => {
    const str = String(s || '');
    const suffix = ' village';
    return str.toLowerCase().endsWith(suffix) ? str.slice(0, str.length - suffix.length) : str;
  };
  const villagesDataClean = villagesData.map(d => ({
    ...d,
    village: stripVillageWord(d.village),
  }));

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
                <GraphCard
                  title="Comparing Demand of Villages across Months"
                  metricLabel={metricLabel}
                />
              </Col>
              <Col>
                <CompareBarGraph
                  title="Demand across Villages"
                  orientation="horizontal"
                  data={villagesDataClean}
                  nameKey="village"
                  valueKey="value"
                  xLabel="Vacancy Rate"
                  yLabel="Village Name"
                  showYAxisTitle={true}
                  yTickFormatter={stripVillageWord}
                  yCategoryWidth={96}
                  margins={{ top: 8, right: 16, bottom: 28, left: 22 }}
                  barSize={18}
                  maxBars={6}
                  xDomain={[0, 100]}
                  xTicks={[0, 25, 50, 75, 100]}
                  barColor="#3b82f6"
                  headerChips={[
                    { label: 'Dates', value: 'ALL' },
                    { label: 'Villages', value: 'ALL' },
                    { label: 'Metric', value: 'ALL' },
                    { label: 'List/Bid', value: 'ALL' },
                  ]}
                />
              </Col>
              <Col>
                <GraphCard title="Comparing Villages" metricLabel={metricLabel} />
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
                <GraphCard
                  title="Comparing Demand of Properties across Time"
                  metricLabel={metricLabel}
                />
              </Col>
              <Col>
                <Col>
                  <CompareBarGraph
                    title="Comparing Ratings of Properties"
                    orientation="vertical"
                    data={propertiesData}
                    nameKey="property"
                    valueKey="value"
                    xLabel="Property Name"
                    yLabel="Average Rating"
                    yDomain={[0, 5]}
                    yTicks={[0, 1, 2, 3, 4, 5]}
                    barColor="#f2b233"
                    barSize={40}
                    height={320}
                    valueFormatter={v => Number(v).toFixed(2)}
                    tooltipLabel="Average Rating"
                    headerChips={[
                      { label: 'List/Bid', value: 'ALL' },
                      { label: 'Dates', value: 'ALL' },
                      { label: 'Metric', value: 'ALL' },
                      { label: 'Properties', value: 'ALL' },
                    ]}
                  />
                </Col>
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
