import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Select from 'react-select';
import styles from './SentimentBreakdownDonutChart.module.css';

const SENTIMENT_COLORS = {
  Positive: '#10B981', // green
  Neutral: '#94A3B8', // light gray
  Negative: '#EF4444', // red/terra cotta
};

const SENTIMENT_KEYWORDS = {
  Positive: [
    'clean',
    'excellent',
    'beautiful',
    'wonderful',
    'helpful',
    'perfect',
    'amazing',
    'great',
    'comfortable',
    'peaceful',
  ],
  Neutral: ['adequate', 'standard', 'average', 'typical', 'okay', 'fine', 'decent', 'sufficient'],
  Negative: [
    'noisy',
    'dirty',
    'broken',
    'uncomfortable',
    'disappointing',
    'poor',
    'maintenance',
    'issues',
  ],
};

function Spinner() {
  return (
    <div className={styles['spinner-container']} role="status" aria-live="polite" aria-busy="true">
      <div className={styles.spinner} />
      <p>Loading…</p>
    </div>
  );
}

export default function SentimentBreakdownDonutChart({ darkMode }) {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [category, setCategory] = useState('village'); // 'village' or 'property'
  const [selectedVillages, setSelectedVillages] = useState([]);
  const [selectedProperties, setSelectedProperties] = useState([]);

  const [appliedFilters, setAppliedFilters] = useState({
    fromDate: '',
    toDate: '',
    category: 'village',
    villages: [],
    properties: [],
  });

  const [chartData, setChartData] = useState(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);

  // Mock village and property options - replace with API call
  const villageOptions = [
    { value: 'Eco Village', label: 'Eco Village' },
    { value: 'Forest Retreat', label: 'Forest Retreat' },
    { value: 'Desert Oasis', label: 'Desert Oasis' },
    { value: 'River Valley', label: 'River Valley' },
    { value: 'City Sanctuary', label: 'City Sanctuary' },
  ];

  const propertyOptions = [
    { value: 'Mountain View', label: 'Mountain View' },
    { value: 'Solar Haven', label: 'Solar Haven' },
    { value: 'Lakeside Cottage', label: 'Lakeside Cottage' },
    { value: 'Woodland Cabin', label: 'Woodland Cabin' },
    { value: 'Tiny Home', label: 'Tiny Home' },
    { value: 'Riverside Cabin', label: 'Riverside Cabin' },
    { value: 'Urban Garden Apartment', label: 'Urban Garden Apartment' },
  ];

  const customSelectStyles = {
    control: provided => ({
      ...provided,
      backgroundColor: darkMode ? '#1C2541' : '#fff',
      borderColor: darkMode ? '#225163' : '#ccc',
      color: darkMode ? '#fff' : '#333',
      minHeight: '44px',
    }),
    menu: provided => ({
      ...provided,
      backgroundColor: darkMode ? '#1C2541' : '#fff',
    }),
    option: (provided, state) => {
      let optionBg;
      if (state.isFocused) {
        optionBg = darkMode ? '#3A506B' : '#f0f0f0';
      } else {
        optionBg = darkMode ? '#1C2541' : '#fff';
      }
      return {
        ...provided,
        backgroundColor: optionBg,
        color: darkMode ? '#fff' : '#333',
      };
    },
    multiValue: provided => ({
      ...provided,
      backgroundColor: darkMode ? '#3A506B' : '#e2e3fc',
    }),
    multiValueLabel: provided => ({
      ...provided,
      color: darkMode ? '#fff' : '#333',
    }),
    singleValue: provided => ({
      ...provided,
      color: darkMode ? '#fff' : '#333',
    }),
    input: provided => ({
      ...provided,
      color: darkMode ? '#fff' : '#333',
    }),
  };

  // Mock data fetch - replace with actual API call
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setActiveIndex(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock data based on filters
      const mockData = [
        { name: 'Positive', value: 2642, percentage: 62 },
        { name: 'Neutral', value: 852, percentage: 20 },
        { name: 'Negative', value: 768, percentage: 18 },
      ];

      const totalCount = mockData.reduce((sum, item) => sum + item.value, 0);

      setChartData(
        mockData.map(item => ({
          ...item,
          color: SENTIMENT_COLORS[item.name],
        })),
      );
      setTotal(totalCount);
    } catch (err) {
      setError(err.message || 'Error fetching data.');
      setChartData(null);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilters]);

  const hasFilters = useMemo(
    () =>
      Boolean(
        appliedFilters.fromDate ||
          appliedFilters.toDate ||
          (appliedFilters.villages?.length ?? 0) > 0 ||
          (appliedFilters.properties?.length ?? 0) > 0,
      ),
    [appliedFilters],
  );

  const applyFilters = () => {
    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      setError('From date must be before or equal to To date');
      return;
    }
    setAppliedFilters({
      fromDate,
      toDate,
      category,
      villages: selectedVillages,
      properties: selectedProperties,
    });
  };

  const resetFilters = () => {
    setFromDate('');
    setToDate('');
    setSelectedVillages([]);
    setSelectedProperties([]);
    setAppliedFilters({
      fromDate: '',
      toDate: '',
      category: 'village',
      villages: [],
      properties: [],
    });
  };

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    const pct = ((d.value / total) * 100).toFixed(1);
    const keywords = SENTIMENT_KEYWORDS[d.name] || [];

    return (
      <div className={styles['custom-tooltip']}>
        <strong>{d.name}</strong>
        <br />
        Count: {d.value.toLocaleString()}
        <br />
        {pct}% of reviews
        {keywords.length > 0 && (
          <>
            <br />
            <br />
            <strong>Example keywords:</strong>
            <br />
            <span className={styles['tooltip-keywords']}>{keywords.slice(0, 5).join(', ')}</span>
          </>
        )}
      </div>
    );
  };

  const DetailsPanel = () => {
    if (!chartData || total === 0) return null;

    return (
      <div className={styles['chart-details']}>
        {chartData.map((d, idx) => {
          const pct = ((d.value / total) * 100).toFixed(1);
          return (
            <div
              key={d.name}
              className={`${styles['detail-item']} ${activeIndex === idx ? styles.active : ''}`}
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <span className={styles['detail-dot']} style={{ backgroundColor: d.color }} />
              <span className={styles['detail-name']}>{d.name}</span>
              <span className={styles['detail-count']}>{d.value.toLocaleString()}</span>
              <span className={styles['detail-pct']}>{pct}%</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className={`${styles['sentiment-donut-chart']} ${
        darkMode ? styles['sentiment-donut-chart-dark-mode'] : ''
      }`}
    >
      <div className={styles['sentiment-chart-container']}>
        <div className={styles['chart-header']}>
          <h2 className={styles['chart-title']}>Sentiment Breakdown</h2>
        </div>

        <section className={styles['filter-section']}>
          <div className={styles['filter-row']}>
            <div className={styles['filter-group']}>
              <label className={styles['filter-label']} htmlFor="fromDate">
                From Date
              </label>
              <input
                id="fromDate"
                type="date"
                className={styles['filter-input']}
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
              />
            </div>

            <div className={styles['filter-group']}>
              <label className={styles['filter-label']} htmlFor="toDate">
                To Date
              </label>
              <input
                id="toDate"
                type="date"
                className={styles['filter-input']}
                value={toDate}
                onChange={e => setToDate(e.target.value)}
              />
            </div>

            <div className={styles['filter-group']}>
              <label className={styles['filter-label']} htmlFor="category">
                Category
              </label>
              <select
                id="category"
                className={styles['filter-select']}
                value={category}
                onChange={e => {
                  setCategory(e.target.value);
                  // Clear selections when switching category
                  if (e.target.value === 'village') {
                    setSelectedProperties([]);
                  } else {
                    setSelectedVillages([]);
                  }
                }}
              >
                <option value="village">By Village</option>
                <option value="property">By Property</option>
              </select>
            </div>
          </div>

          <div className={styles['filter-row']}>
            <div className={styles['filter-group']}>
              <label className={styles['filter-label']} htmlFor="villages">
                {category === 'village' ? 'Select Villages' : 'Select Villages (Disabled)'}
              </label>
              <Select
                id="villages"
                isMulti
                options={villageOptions}
                value={selectedVillages}
                onChange={setSelectedVillages}
                isDisabled={category !== 'village'}
                className={styles.select}
                placeholder={
                  category === 'village' ? 'Select Villages' : 'Select category "By Village" first'
                }
                styles={customSelectStyles}
              />
            </div>

            <div className={styles['filter-group']}>
              <label className={styles['filter-label']} htmlFor="properties">
                {category === 'property' ? 'Select Properties' : 'Select Properties (Disabled)'}
              </label>
              <Select
                id="properties"
                isMulti
                options={propertyOptions}
                value={selectedProperties}
                onChange={setSelectedProperties}
                isDisabled={category !== 'property'}
                className={styles.select}
                placeholder={
                  category === 'property'
                    ? 'Select Properties'
                    : 'Select category "By Property" first'
                }
                styles={customSelectStyles}
              />
            </div>
          </div>

          <div className={styles['filter-actions']}>
            <button className={`${styles.btn} ${styles.primary}`} onClick={applyFilters}>
              Apply Filters
            </button>
            <button
              className={`${styles.btn} ${styles.ghost}`}
              onClick={resetFilters}
              disabled={!hasFilters}
            >
              Reset
            </button>
          </div>
        </section>

        <section className={styles['chart-section']}>
          <div className={styles['chart-area']}>
            {loading && <Spinner />}

            {!loading && !error && chartData && total > 0 && (
              <>
                <div className={styles['chart-canvas']}>
                  <ResponsiveContainer width="100%" aspect={1}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        dataKey="value"
                        innerRadius="55%"
                        outerRadius="82%"
                        stroke={darkMode ? '#1c2441' : '#fff'}
                        strokeWidth={3}
                        onMouseEnter={(_, i) => setActiveIndex(i)}
                        onMouseLeave={() => setActiveIndex(null)}
                      >
                        {chartData.map((d, i) => (
                          <Cell
                            key={d.name}
                            fill={d.color}
                            className={styles['pie-cell']}
                            opacity={activeIndex == null || activeIndex === i ? 1 : 0.45}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <text
                        x="50%"
                        y="50%"
                        dominantBaseline="middle"
                        textAnchor="middle"
                        style={{
                          fontWeight: 800,
                          fontSize: '1rem',
                          fill: darkMode ? '#f8fafc' : '#0f172a',
                        }}
                      >
                        {total.toLocaleString()}
                        <tspan
                          x="50%"
                          dy="20"
                          style={{
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            fill: darkMode ? '#cbd5e1' : '#64748b',
                          }}
                        >
                          reviews
                        </tspan>
                      </text>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <DetailsPanel />
              </>
            )}

            {!loading && !error && (!chartData || total === 0) && (
              <p className={styles['no-data']}>No Data Available 😢</p>
            )}

            {!loading && error && <p className={styles['error-message']}>{error}</p>}
          </div>
        </section>
      </div>
    </div>
  );
}

SentimentBreakdownDonutChart.propTypes = {
  darkMode: PropTypes.bool,
};

SentimentBreakdownDonutChart.defaultProps = {
  darkMode: false,
};
