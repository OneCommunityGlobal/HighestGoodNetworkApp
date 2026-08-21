'use client';

import { useState, useEffect, useRef } from 'react';
import { Dropdown } from 'react-bootstrap';
import { Package, Wrench, Building2, CalendarDays, Check } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import styles from './ResourceUsage.module.css';
import { useSelector } from 'react-redux';

const ICON_SIZE = 14;

// Each resource type gets its own icon so the filter still reads correctly
// once the selection moves away from Material. This map is also the source of
// the menu options, so an option can never exist without an icon.
const resourceTypeIcons = {
  Material: Package,
  Equipment: Wrench,
  Venue: Building2,
};

const resourceTypes = Object.keys(resourceTypeIcons);
const timePeriods = ['This Week', 'Last Week', 'This Month'];

// Menu row for a filter option. Resource types pass their own icon, since the
// icon is what distinguishes them; time periods pass none and mark the current
// selection with a check instead, because three identical calendars carry no
// information. The icon slot is always rendered so labels stay aligned.
function FilterOption({ icon, label, selected, onSelect }) {
  const Glyph = icon ?? (selected ? Check : null);
  return (
    <Dropdown.Item className={styles.filterOption} onClick={onSelect}>
      <span className={styles.filterOptionIcon} aria-hidden="true">
        {Glyph ? <Glyph size={ICON_SIZE} /> : null}
      </span>
      {label}
    </Dropdown.Item>
  );
}

// Right-aligned axis caption. Defined at module scope so recharts keeps the
// same component identity between renders.
function YAxisLabel({ viewBox, darkMode }) {
  const { x, y } = viewBox;
  return (
    <text
      x={x - 19}
      y={y - 20}
      textAnchor="start"
      dx={8}
      dy={0}
      fill={darkMode ? '#ffffff' : '#666'}
      fontSize={12}
    >
      Amount
    </text>
  );
}

const allData = {
  material: [
    { name: 'Material A', returned: 5, loaned: 3 },
    { name: 'Material B', returned: 8, loaned: 4 },
    { name: 'Material C', returned: 12, loaned: 6 },
    { name: 'Material D', returned: 25, loaned: 8 },
    { name: 'Material E', returned: 15, loaned: 3 },
    { name: 'Material F', returned: 4, loaned: 6 },
    { name: 'Material G', returned: 2, loaned: 1 },
  ],
  equipment: [
    { name: 'Laptops', returned: 15, loaned: 5 },
    { name: 'Projectors', returned: 10, loaned: 3 },
    { name: 'Chairs', returned: 30, loaned: 10 },
    { name: 'Tables', returned: 20, loaned: 5 },
    { name: 'Microphones', returned: 8, loaned: 2 },
  ],
  venue: [
    { name: 'Venue A', returned: 5, loaned: 3 },
    { name: 'Venue B', returned: 8, loaned: 4 },
    { name: 'Venue C', returned: 12, loaned: 6 },
    { name: 'Venue D', returned: 25, loaned: 8 },
    { name: 'Venue E', returned: 15, loaned: 3 },
    { name: 'Venue F', returned: 4, loaned: 6 },
    { name: 'Venue G', returned: 2, loaned: 1 },
  ],
};

const allInsights = {
  'This Week': [
    { title: 'Most waste event type', value: 'Kids event', color: '#b0d9cb', textColor: '#1a5c3a' },
    { title: 'Most vulnerable materials', value: 'Flower', color: '#c3b8e8', textColor: '#4a2f8a' },
    { title: 'Top rated venues', value: 'Kevin building', color: '#b0d9cb', textColor: '#1a5c3a' },
    {
      title: 'Lowest rated venues',
      value: 'Community centers',
      color: '#fdcdb6',
      textColor: '#8b1a2a',
    },
    {
      title: 'Highest cost venues/hr',
      value: 'Kevin building',
      color: '#b0d9cb',
      textColor: '#1a5c3a',
    },
    { title: 'Most vulnerable equipment', value: 'Chair', color: '#fdcdb6', textColor: '#8b1a2a' },
  ],
  'Last Week': [
    {
      title: 'Most waste event type',
      value: 'Sports event',
      color: '#b0d9cb',
      textColor: '#1a5c3a',
    },
    { title: 'Most vulnerable materials', value: 'Paper', color: '#c3b8e8', textColor: '#4a2f8a' },
    { title: 'Top rated venues', value: 'Sports center', color: '#b0d9cb', textColor: '#1a5c3a' },
    { title: 'Lowest rated venues', value: 'Old hall', color: '#fdcdb6', textColor: '#8b1a2a' },
    {
      title: 'Highest cost venues/hr',
      value: 'Sports center',
      color: '#b0d9cb',
      textColor: '#1a5c3a',
    },
    { title: 'Most vulnerable equipment', value: 'Table', color: '#fdcdb6', textColor: '#8b1a2a' },
  ],
  'This Month': [
    {
      title: 'Most waste event type',
      value: 'Community event',
      color: '#b0d9cb',
      textColor: '#1a5c3a',
    },
    {
      title: 'Most vulnerable materials',
      value: 'Plastic',
      color: '#c3b8e8',
      textColor: '#4a2f8a',
    },
    { title: 'Top rated venues', value: 'Community hall', color: '#b0d9cb', textColor: '#1a5c3a' },
    { title: 'Lowest rated venues', value: 'Small rooms', color: '#fdcdb6', textColor: '#8b1a2a' },
    {
      title: 'Highest cost venues/hr',
      value: 'Community hall',
      color: '#b0d9cb',
      textColor: '#1a5c3a',
    },
    {
      title: 'Most vulnerable equipment',
      value: 'Microphone',
      color: '#fdcdb6',
      textColor: '#8b1a2a',
    },
  ],
};

/* ----------Insight definitions for clarity ---------- */
const insightDefinitions = {
  'Most vulnerable materials':
    'Material with the lowest return rate compared to loaned items for the selected period.',
  'Most vulnerable equipment':
    'Equipment with the lowest return rate compared to loaned items for the selected period.',
  'Most waste event type': 'Event type associated with the highest reported waste.',
  'Top rated venues': 'Venue with the highest average rating for the selected period.',
  'Lowest rated venues': 'Venue with the lowest average rating for the selected period.',
  'Highest cost venues/hr': 'Venue with the highest hourly cost during the selected period.',
};

function filterDataByDate(data, timePeriod) {
  return data;
}

function CustomTooltip({ active, payload, darkMode }) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div
      className={styles.chartTooltip}
      style={{
        backgroundColor: darkMode ? '#1e293b' : '#ffffff',
        color: darkMode ? '#f8fafc' : '#111827',
      }}
    >
      <div className={styles.tooltipTitle}>{data.name}</div>

      <div className={styles.tooltipRow}>
        <span className={styles.tooltipDot} style={{ background: '#22c55e' }} />
        <span>Returned</span>
        <span className={styles.tooltipValue}>{data.returned}</span>
      </div>

      <div className={styles.tooltipRow}>
        <span className={styles.tooltipDot} style={{ background: '#fca5a5' }} />
        <span>Loaned</span>
        <span className={styles.tooltipValue}>{data.loaned}</span>
      </div>
    </div>
  );
}

export default function ResourceUsage() {
  const [resourceType, setResourceType] = useState('Material');
  const [timePeriod, setTimePeriod] = useState('This Week');
  const [insightsTimePeriod, setInsightsTimePeriod] = useState('Last Week');
  const [data, setData] = useState(allData.material);
  const [insights, setInsights] = useState(allInsights['Last Week']);
  const [showScroll, setShowScroll] = useState(false);

  const darkMode = useSelector(state => state.theme.darkMode);
  const badgeRefs = useRef([]);

  useEffect(() => {
    badgeRefs.current.forEach(badge => {
      if (badge) {
        badge.style.setProperty('color', '#000');
      }
    });
  }, [insights, darkMode]);

  useEffect(() => {
    const resourceTypeKey = resourceType.toLowerCase();
    const filteredData = filterDataByDate(allData[resourceTypeKey], timePeriod);
    setData(filteredData);
  }, [resourceType, timePeriod, allData]);

  useEffect(() => {
    setInsights(allInsights[insightsTimePeriod]);
  }, [insightsTimePeriod]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScroll(window.scrollY < 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const ResourceTypeIcon = resourceTypeIcons[resourceType] ?? Package;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      data-testid="resource-usage-container"
      className={`${styles.resourceUsageContainer} ${
        darkMode ? 'dark-mode bg-oxford-blue text-light' : ''
      }`}
    >
      {showScroll && (
        <button
          onClick={scrollToTop}
          className={`${styles.scrollButton} ${darkMode ? styles.dark : ''}`}
        >
          ↑
        </button>
      )}
      {/* LEFT SECTION */}
      <div className={`${styles.chartSection} ${darkMode ? 'bg-space-cadet' : ''}`}>
        <div className={styles.headerSection}>
          <h1>Resources usage</h1>

          <div className={styles.filters}>
            <Dropdown>
              <Dropdown.Toggle className={styles.customDropdown}>
                <ResourceTypeIcon
                  className={styles.filterIcon}
                  size={ICON_SIZE}
                  aria-hidden="true"
                />
                {resourceType}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {resourceTypes.map(type => (
                  <FilterOption
                    key={type}
                    icon={resourceTypeIcons[type]}
                    label={type}
                    selected={resourceType === type}
                    onSelect={() => setResourceType(type)}
                  />
                ))}
              </Dropdown.Menu>
            </Dropdown>

            <Dropdown>
              <Dropdown.Toggle className={styles.customDropdown}>
                <CalendarDays className={styles.filterIcon} size={ICON_SIZE} aria-hidden="true" />
                {timePeriod}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {timePeriods.map(period => (
                  <FilterOption
                    key={period}
                    label={period}
                    selected={timePeriod === period}
                    onSelect={() => setTimePeriod(period)}
                  />
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>

        {/* CHART */}
        <div className={styles.chartContainer}>
          {data && data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 20, right: 60, left: 20, bottom: 20 }}
                barCategoryGap="15%"
              >
                <CartesianGrid
                  strokeDasharray="6 6"
                  stroke={darkMode ? '#4C6485' : '#9CA3AF'}
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: darkMode ? '#ffffff' : '#666',
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                />

                <YAxis
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tickCount={5}
                  domain={[0, 'auto']}
                  width={40}
                  tick={{
                    fill: darkMode ? '#ffffff' : '#666',
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                  label={<YAxisLabel darkMode={darkMode} />}
                />

                <Tooltip
                  content={<CustomTooltip darkMode={darkMode} />}
                  cursor={{
                    fill: darkMode ? 'rgba(58, 80, 107, 0.45)' : 'rgba(17, 24, 39, 0.08)',
                  }}
                />

                <Legend
                  align="right"
                  verticalAlign="top"
                  iconType="circle"
                  iconSize={10}
                  wrapperStyle={{
                    top: 0,
                    right: 0,
                    paddingBottom: '20px',
                    color: darkMode ? '#ffffff' : '#666',
                    fontSize: '0.875rem',
                    lineHeight: '1.5',
                  }}
                  formatter={value => (
                    <span
                      style={{
                        color: darkMode ? '#ffffff' : '#666',
                        marginLeft: '6px',
                        marginRight: '12px',
                        fontSize: '0.875rem',
                      }}
                    >
                      {value.charAt(0).toUpperCase() + value.slice(1)}
                    </span>
                  )}
                />

                <Bar dataKey="returned" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
                <Bar dataKey="loaned" stackId="a" fill="#fca5a5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
              }}
            >
              <p>No data available for the selected time period and resource type.</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className={`${styles.insightsSection} ${darkMode ? styles.darkInsightsSection : ''}`}>
        <div className={styles.insightsHeader}>
          <h2>Insights</h2>
          <Dropdown>
            <Dropdown.Toggle className={styles.customDropdown}>
              <CalendarDays className={styles.filterIcon} size={ICON_SIZE} aria-hidden="true" />
              {insightsTimePeriod}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {timePeriods.map(period => (
                <FilterOption
                  key={period}
                  label={period}
                  selected={insightsTimePeriod === period}
                  onSelect={() => setInsightsTimePeriod(period)}
                />
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>

        <div className={styles.insightsGrid}>
          {insights.map((insight, idx) => (
            <div
              key={idx}
              className={`${styles.insightCard} ${darkMode ? 'bg-yinmn-blue text-light' : ''}`}
            >
              <div className={styles.insightContent}>
                <div
                  className={styles.insightTitle}
                  title={insightDefinitions[insight.title]}
                  style={{ color: darkMode ? '#e5e7eb' : '#6b7280', fontWeight: 600 }}
                >
                  {insight.title}
                </div>

                <div
                  ref={el => (badgeRefs.current[idx] = el)}
                  className={styles.insightBadge}
                  style={{ backgroundColor: insight.color, color: insight.textColor }}
                >
                  {insight.value}
                </div>

                <div className={styles.insightMeta}>Based on returned vs loaned comparison</div>
              </div>

              {/* Tooltip */}
              <div className={styles.insightTooltip}>{insightDefinitions[insight.title]}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
