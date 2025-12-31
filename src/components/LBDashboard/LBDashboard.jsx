// import { useState, useEffect, useMemo } from 'react';
// import {
//   Container,
//   Row,
//   Col,
//   Button,
//   ButtonGroup,
//   ButtonDropdown,
//   DropdownToggle,
//   DropdownMenu,
//   DropdownItem,
//   Card,
//   CardBody,
// } from 'reactstrap';
// import styles from './LBDashboard.module.css';
// import { CompareBarGraph } from './BarGraphs/CompareGraphs';

// import httpService from '../../services/httpService';
// import { ApiEndpoint } from '../../utils/URL';

// const METRIC_OPTIONS = {
//   DEMAND: [
//     { key: 'pageVisits', label: 'Page Visits' },
//     { key: 'numBids', label: 'Number of Bids' },
//     { key: 'avgRating', label: 'Average Rating' },
//   ],
//   REVENUE: [
//     { key: 'avgBid', label: 'Average Bid' },
//     { key: 'finalPrice', label: 'Final Price / Income' },
//   ],
//   VACANCY: [
//     { key: 'occupancyRate', label: 'Occupancy Rate (% days not vacant)' },
//     { key: 'avgStay', label: 'Average Duration of Stay' },
//   ],
// };

// const DEFAULTS = {
//   DEMAND: 'pageVisits',
//   REVENUE: 'finalPrice',
//   VACANCY: 'occupancyRate',
// };

// //Dummy Data For Property
// const propertiesData = [
//   { property: 'House AB', value: 4.72 },
//   { property: 'Room A', value: 4.5 },
//   { property: 'Room C', value: 4.05 },
//   { property: 'Room A34', value: 3.91 },
//   { property: 'Room 5', value: 3.0 },
// ];

// function GraphCard({ title, metricLabel }) {
//   return (
//     <Card className={styles.graphCard}>
//       <CardBody>
//         <div className={styles.graphTitle}>
//           <span>{title}</span>
//           <span className={styles.metricPill}>{metricLabel}</span>
//         </div>
//         <div className={styles.graphPlaceholder}>
//           <span className={styles.placeholderText}>Graph area</span>
//         </div>
//       </CardBody>
//     </Card>
//   );
// }

// export function LBDashboard() {
//   const [activeCategory, setActiveCategory] = useState('DEMAND');
//   const [selectedMetricKey, setSelectedMetricKey] = useState(DEFAULTS.DEMAND);

//   const [openDD, setOpenDD] = useState({ DEMAND: false, REVENUE: false, VACANCY: false });

//   // ---- Backend data from /villages ----
//   const [villagesRaw, setVillagesRaw] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const dateChipValue = 'ALL';

//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         const res = await httpService.get(`${ApiEndpoint}/villages`);
//         if (!mounted) return;
//         setVillagesRaw(Array.isArray(res?.data) ? res.data : []);
//       } catch (e) {
//         if (!mounted) return;
//         setError('Failed to load villages');
//         setVillagesRaw([]);
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     })();
//     return () => {
//       mounted = false;
//     };
//   }, []);

//   const metricLabel = (() => {
//     const all = Object.values(METRIC_OPTIONS).flat();
//     return (all.find(o => o.key === selectedMetricKey) || {}).label || '';
//   })();

//   const effectiveMetric = useMemo(() => {
//     switch (selectedMetricKey) {
//       case 'avgBid':
//       case 'finalPrice':
//         return 'avgCurrentBid';
//       case 'pageVisits':
//       case 'numBids':
//       case 'avgRating':
//       case 'occupancyRate':
//       case 'avgStay':
//         return 'totalCurrentBid';
//       default:
//         return 'totalCurrentBid';
//     }
//   }, [selectedMetricKey]);

//   const valueFormatter = useMemo(() => {
//     if (selectedMetricKey === 'avgRating') return v => Number(v).toFixed(2);
//     if (selectedMetricKey === 'occupancyRate') return v => `${v}%`;
//     if (selectedMetricKey === 'avgStay') return v => `${v} days`;
//     if (selectedMetricKey === 'avgBid' || selectedMetricKey === 'finalPrice') {
//       return v => `₹${Number(v).toLocaleString()}`;
//     }
//     return v => Number(v);
//   }, [selectedMetricKey]);

//   // Derive villagesData from backend
//   const villagesData = useMemo(() => {
//     if (!villagesRaw.length) return [];
//     return villagesRaw
//       .map(v => {
//         const props = Array.isArray(v.properties) ? v.properties : [];
//         const bids = props.map(p => Number(p?.currentBid || 0));
//         const sum = bids.reduce((a, b) => a + b, 0);
//         const avg = bids.length ? sum / bids.length : 0;
//         const count = props.length;

//         const value =
//           effectiveMetric === 'avgCurrentBid'
//             ? avg
//             : effectiveMetric === 'propertyCount'
//             ? count
//             : /* totalCurrentBid (default) */ sum;

//         return {
//           village: v.name || v.regionId || 'Unknown',
//           value,
//         };
//       })
//       .sort((a, b) => b.value - a.value)
//       .slice(0, 20);
//   }, [villagesRaw, effectiveMetric]);

//   const stripVillageWord = s => {
//     const str = String(s || '');
//     const suffix = ' village';
//     return str.toLowerCase().endsWith(suffix) ? str.slice(0, str.length - suffix.length) : str;
//   };
//   const villagesDataClean = villagesData.map(d => ({
//     ...d,
//     village: stripVillageWord(d.village),
//   }));

//   const handleCategoryClick = category => {
//     setActiveCategory(category);
//     setSelectedMetricKey(DEFAULTS[category]);
//   };

//   const handleMetricPick = (category, key) => {
//     setActiveCategory(category);
//     setSelectedMetricKey(key);
//   };

//   const toggleDD = category => setOpenDD(s => ({ ...s, [category]: !s[category] }));

//   const goBack = () => {
//     window.history.back();
//   };

//   return (
//     <Container fluid className={styles.dashboardContainer}>
//       {/* Header */}
//       <header className={styles.dashboardHeader}>
//         <h1 className={styles.title}>Listing and Bidding Platform Dashboard</h1>
//         <Button size="sm" onClick={goBack} className={styles.backBtn}>
//           Back
//         </Button>
//       </header>

//       {/* Preset Overview Filter */}
//       <section className={styles.filterBar}>
//         <div className={styles.filterLabel}>Choose Metric to view</div>

//         <ButtonGroup className={styles.categoryGroup}>
//           {/* DEMAND */}
//           <Button
//             className={`${styles.filterBtn} ${activeCategory === 'DEMAND' ? styles.active : ''}`}
//             onClick={() => handleCategoryClick('DEMAND')}
//           >
//             Demand
//           </Button>
//           <ButtonDropdown
//             isOpen={openDD.DEMAND}
//             toggle={() => toggleDD('DEMAND')}
//             className={styles.dd}
//           >
//             <DropdownToggle
//               caret
//               className={`${styles.filterBtn} ${activeCategory === 'DEMAND' ? styles.active : ''}`}
//             />
//             <DropdownMenu className={styles.dropdownMenu}>
//               {METRIC_OPTIONS.DEMAND.map(m => (
//                 <DropdownItem
//                   key={m.key}
//                   active={selectedMetricKey === m.key}
//                   onClick={() => handleMetricPick('DEMAND', m.key)}
//                   className={`${styles.dropdownItem} ${
//                     selectedMetricKey === m.key ? styles.dropdownActive : ''
//                   }`}
//                 >
//                   {m.label}
//                 </DropdownItem>
//               ))}
//             </DropdownMenu>
//           </ButtonDropdown>

//           {/* VACANCY */}
//           <Button
//             className={`${styles.filterBtn} ${activeCategory === 'VACANCY' ? styles.active : ''}`}
//             onClick={() => handleCategoryClick('VACANCY')}
//           >
//             Vacancy
//           </Button>
//           <ButtonDropdown
//             isOpen={openDD.VACANCY}
//             toggle={() => toggleDD('VACANCY')}
//             className={styles.dd}
//           >
//             <DropdownToggle
//               caret
//               className={`${styles.filterBtn} ${activeCategory === 'VACANCY' ? styles.active : ''}`}
//             />
//             <DropdownMenu className={styles.dropdownMenu}>
//               {METRIC_OPTIONS.VACANCY.map(m => (
//                 <DropdownItem
//                   key={m.key}
//                   active={selectedMetricKey === m.key}
//                   onClick={() => handleMetricPick('VACANCY', m.key)}
//                   className={`${styles.dropdownItem} ${
//                     selectedMetricKey === m.key ? styles.dropdownActive : ''
//                   }`}
//                 >
//                   {m.label}
//                 </DropdownItem>
//               ))}
//             </DropdownMenu>
//           </ButtonDropdown>

//           {/* REVENUE */}
//           <Button
//             className={`${styles.filterBtn} ${activeCategory === 'REVENUE' ? styles.active : ''}`}
//             onClick={() => handleCategoryClick('REVENUE')}
//           >
//             Revenue
//           </Button>
//           <ButtonDropdown
//             isOpen={openDD.REVENUE}
//             toggle={() => toggleDD('REVENUE')}
//             className={styles.dd}
//           >
//             <DropdownToggle
//               caret
//               className={`${styles.filterBtn} ${activeCategory === 'REVENUE' ? styles.active : ''}`}
//             />
//             <DropdownMenu className={styles.dropdownMenu}>
//               {METRIC_OPTIONS.REVENUE.map(m => (
//                 <DropdownItem
//                   key={m.key}
//                   active={selectedMetricKey === m.key}
//                   onClick={() => handleMetricPick('REVENUE', m.key)}
//                   className={`${styles.dropdownItem} ${
//                     selectedMetricKey === m.key ? styles.dropdownActive : ''
//                   }`}
//                 >
//                   {m.label}
//                 </DropdownItem>
//               ))}
//             </DropdownMenu>
//           </ButtonDropdown>
//         </ButtonGroup>

//         <div className={styles.currentMetric}>
//           Current metric:&nbsp;<strong>{metricLabel}</strong>
//         </div>
//       </section>

//       {/* By Village */}
//       <section className={styles.section}>
//         <details>
//           <summary className={styles.sectionSummary}>By Village</summary>
//           <div className={styles.sectionBody}>
//             <Row xs="1" md="3" className="g-3">
//               <Col>
//                 <GraphCard
//                   title="Comparing Demand of Villages across Months"
//                   metricLabel={metricLabel}
//                 />
//               </Col>
//               <Col>
//                 <CompareBarGraph
//                   title="Demand across Villages"
//                   orientation="horizontal"
//                   data={villagesDataClean}
//                   nameKey="village"
//                   valueKey="value"
//                   xLabel="Vacancy Rate"
//                   yLabel="Village Name"
//                   showYAxisTitle={true}
//                   yTickFormatter={stripVillageWord}
//                   yCategoryWidth={96}
//                   margins={{ top: 8, right: 16, bottom: 28, left: 22 }}
//                   barSize={18}
//                   maxBars={6}
//                   xDomain={[0, 100]}
//                   xTicks={[0, 25, 50, 75, 100]}
//                   barColor="#3b82f6"
//                   headerChips={[
//                     { label: 'Dates', value: 'ALL' },
//                     { label: 'Villages', value: 'ALL' },
//                     { label: 'Metric', value: 'ALL' },
//                     { label: 'List/Bid', value: 'ALL' },
//                   ]}
//                 />
//               </Col>
//               <Col>
//                 <GraphCard title="Comparing Villages" metricLabel={metricLabel} />
//               </Col>
//             </Row>
//           </div>
//         </details>
//       </section>

//       {/* By Property */}
//       <section className={styles.section}>
//         <details>
//           <summary className={styles.sectionSummary}>By Property</summary>
//           <div className={styles.sectionBody}>
//             <Row xs="1" md="2" className="g-3">
//               <Col>
//                 <GraphCard
//                   title="Comparing Demand of Properties across Time"
//                   metricLabel={metricLabel}
//                 />
//               </Col>
//               <Col>
//                 <Col>
//                   <CompareBarGraph
//                     title="Comparing Ratings of Properties"
//                     orientation="vertical"
//                     data={propertiesData}
//                     nameKey="property"
//                     valueKey="value"
//                     xLabel="Property Name"
//                     yLabel="Average Rating"
//                     yDomain={[0, 5]}
//                     yTicks={[0, 1, 2, 3, 4, 5]}
//                     barColor="#f2b233"
//                     barSize={40}
//                     height={320}
//                     valueFormatter={v => Number(v).toFixed(2)}
//                     tooltipLabel="Average Rating"
//                     headerChips={[
//                       { label: 'List/Bid', value: 'ALL' },
//                       { label: 'Dates', value: 'ALL' },
//                       { label: 'Metric', value: 'ALL' },
//                       { label: 'Properties', value: 'ALL' },
//                     ]}
//                   />
//                 </Col>
//               </Col>
//             </Row>
//           </div>
//         </details>
//       </section>

//       {/* Insights from Reviews */}
//       <section className={styles.section}>
//         <details>
//           <summary className={styles.sectionSummary}>Insights from Reviews</summary>
//           <div className={styles.sectionBody}>
//             <Row xs="1" md="2" className="g-3">
//               <Col>
//                 <Card className={styles.wordcloudCard}>
//                   <CardBody className={styles.wordcloudBody}>
//                     <div className={styles.wordcloudTitle}>Village Wordcloud</div>
//                     <div className={styles.wordcloudPlaceholder}>Wordcloud area</div>
//                   </CardBody>
//                 </Card>
//               </Col>
//               <Col>
//                 <Card className={styles.wordcloudCard}>
//                   <CardBody className={styles.wordcloudBody}>
//                     <div className={styles.wordcloudTitle}>Property Wordcloud</div>
//                     <div className={styles.wordcloudPlaceholder}>Wordcloud area</div>
//                   </CardBody>
//                 </Card>
//               </Col>
//             </Row>
//           </div>
//         </details>
//       </section>
//     </Container>
//   );
// }

// export default LBDashboard;

import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import moment from 'moment';

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

import httpService from '../../services/httpService';
import { ApiEndpoint } from '../../utils/URL';

import styles from './LBDashboard.module.css';

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

// Dummy data for Property graph (keep until backend is wired)
const propertiesData = [
  { property: 'House AB', value: 4.72 },
  { property: 'Room A', value: 4.5 },
  { property: 'Room C', value: 4.05 },
  { property: 'Room A34', value: 3.91 },
  { property: 'Room 5', value: 3.0 },
];

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

  // --- Villages backend data ---
  const [villagesRaw, setVillagesRaw] = useState([]);
  const [loadingVillages, setLoadingVillages] = useState(false);
  const [villagesError, setVillagesError] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoadingVillages(true);
        setVillagesError(null);

        const res = await httpService.get(`${ApiEndpoint}/villages`);
        if (!mounted) return;

        setVillagesRaw(Array.isArray(res?.data) ? res.data : []);
      } catch (e) {
        if (!mounted) return;
        setVillagesError('Failed to load villages');
        setVillagesRaw([]);
      } finally {
        if (mounted) setLoadingVillages(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

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
        const props = Array.isArray(v.properties) ? v.properties : [];
        const bids = props.map(p => Number(p?.currentBid || 0));
        const sum = bids.reduce((a, b) => a + b, 0);
        const avg = bids.length ? sum / bids.length : 0;

        const value = effectiveMetric === 'avgCurrentBid' ? avg : sum;

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
              <div className={getClassNames('', styles.darkText, darkMode)}>Loading villages…</div>
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
                yCategoryWidth={96}
                margins={{ top: 8, right: 16, bottom: 28, left: 22 }}
                barSize={18}
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
              barSize={40}
              barColor="#f2b233"
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
        </Row>
      </AnalysisSection>

      <AnalysisSection title="Insights from Reviews" darkMode={darkMode}>
        <ReviewWordCloud darkMode={darkMode} />
      </AnalysisSection>
    </Container>
  );
}

export default LBDashboard;
