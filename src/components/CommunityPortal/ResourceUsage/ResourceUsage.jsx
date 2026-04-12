'use client';

import { useState, useEffect } from 'react';
import { Dropdown } from 'react-bootstrap';
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
    { title: 'Most waste event type', value: 'Kids event', color: '#dcfce7' },
    { title: 'Most vulnerable materials', value: 'Flower', color: '#f3e8ff' },
    { title: 'Top rated venues', value: 'Kevin building', color: '#dcfce7' },
    { title: 'Lowest rated venues', value: 'Community centers', color: '#ffe4e6' },
    { title: 'Highest cost venues/hr', value: 'Kevin building', color: '#dcfce7' },
    { title: 'Most vulnerable equipment', value: 'Chair', color: '#ffe4e6' },
  ],
  'Last Week': [
    { title: 'Most waste event type', value: 'Sports event', color: '#dcfce7' },
    { title: 'Most vulnerable materials', value: 'Paper', color: '#f3e8ff' },
    { title: 'Top rated venues', value: 'Sports center', color: '#dcfce7' },
    { title: 'Lowest rated venues', value: 'Old hall', color: '#ffe4e6' },
    { title: 'Highest cost venues/hr', value: 'Sports center', color: '#dcfce7' },
    { title: 'Most vulnerable equipment', value: 'Table', color: '#ffe4e6' },
  ],
  'This Month': [
    { title: 'Most waste event type', value: 'Community event', color: '#dcfce7' },
    { title: 'Most vulnerable materials', value: 'Plastic', color: '#f3e8ff' },
    { title: 'Top rated venues', value: 'Community hall', color: '#dcfce7' },
    { title: 'Lowest rated venues', value: 'Small rooms', color: '#ffe4e6' },
    { title: 'Highest cost venues/hr', value: 'Community hall', color: '#dcfce7' },
    { title: 'Most vulnerable equipment', value: 'Microphone', color: '#ffe4e6' },
  ],
};

/* ---------- Insight definitions for clarity ---------- */
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

  const darkMode = useSelector(state => state.theme.darkMode);

  useEffect(() => {
    setData(allData[resourceType.toLowerCase()]);
  }, [resourceType]);

  useEffect(() => {
    setInsights(allInsights[insightsTimePeriod]);
  }, [insightsTimePeriod]);

  return (
    // added by shreya P — outer wrapper now stretches to fill the page with correct flex direction
    <div
      data-testid="resource-usage-container"
      className={`${styles.resourceUsageContainer} ${
        darkMode ? 'dark-mode bg-oxford-blue text-light' : ''
      }`}
    >
      {/* LEFT SECTION — Chart */}
      <div className={`${styles.chartSection} ${darkMode ? 'bg-space-cadet' : ''}`}>
        {/* added by shreya P — headerSection uses flex row so title and dropdowns sit side-by-side and align properly */}
        <div className={styles.headerSection}>
          <h1
            // added by shreya P — heading color switches in dark mode so it stays visible
            style={{ color: darkMode ? '#ffffff' : '#111827' }}
          >
            Resources usage
          </h1>

          {/* added by shreya P — filters wrapper keeps dropdowns in a row with consistent gap */}
          <div className={styles.filters}>
            {/* added by shreya P — Resource type dropdown: Toggle and Menu get dark CSS module classes */}
            <Dropdown>
              <Dropdown.Toggle
                className={`${styles.customDropdown} ${darkMode ? styles.customDropdownDark : ''}`}
              >
                {resourceType}
              </Dropdown.Toggle>
              <Dropdown.Menu className={darkMode ? styles.dropdownMenuDark : ''}>
                <Dropdown.Item
                  className={darkMode ? styles.dropdownItemDark : ''}
                  onClick={() => setResourceType('Material')}
                >
                  Material
                </Dropdown.Item>
                <Dropdown.Item
                  className={darkMode ? styles.dropdownItemDark : ''}
                  onClick={() => setResourceType('Equipment')}
                >
                  Equipment
                </Dropdown.Item>
                <Dropdown.Item
                  className={darkMode ? styles.dropdownItemDark : ''}
                  onClick={() => setResourceType('Venue')}
                >
                  Venue
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            {/* added by shreya P — Time period dropdown: same dark class treatment as above */}
            <Dropdown>
              <Dropdown.Toggle
                className={`${styles.customDropdown} ${darkMode ? styles.customDropdownDark : ''}`}
              >
                {timePeriod}
              </Dropdown.Toggle>
              <Dropdown.Menu className={darkMode ? styles.dropdownMenuDark : ''}>
                <Dropdown.Item
                  className={darkMode ? styles.dropdownItemDark : ''}
                  onClick={() => setTimePeriod('This Week')}
                >
                  This Week
                </Dropdown.Item>
                <Dropdown.Item
                  className={darkMode ? styles.dropdownItemDark : ''}
                  onClick={() => setTimePeriod('Last Week')}
                >
                  Last Week
                </Dropdown.Item>
                <Dropdown.Item
                  className={darkMode ? styles.dropdownItemDark : ''}
                  onClick={() => setTimePeriod('This Month')}
                >
                  This Month
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>

        {/* CHART */}
        <div className={styles.chartContainer}>
          <div className={styles.yAxisLabel} style={{ color: darkMode ? '#ffffff' : '#666' }}>
            Amount
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 30, bottom: 80 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={darkMode ? '#3A506B' : '#eee'}
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
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: darkMode ? '#ffffff' : '#666',
                  fontWeight: 700,
                  fontSize: 12,
                }}
              />

              <Tooltip content={<CustomTooltip darkMode={darkMode} />} />

              <Legend
                align="right"
                verticalAlign="top"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{
                  color: darkMode ? '#ffffff' : '#666',
                }}
              />

              <Bar dataKey="returned" stackId="a" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="loaned" stackId="a" fill="#fca5a5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* RIGHT SECTION — Insights */}
      {/* added by shreya P — darkInsightsSection class handles the dark background for the right panel */}
      <div className={`${styles.insightsSection} ${darkMode ? styles.darkInsightsSection : ''}`}>
        {/* added by shreya P — insightsHeader keeps "Insights" title and the dropdown aligned on one row */}
        <div className={styles.insightsHeader}>
          <h2
            // added by shreya P — h2 color switches so "Insights" is readable in dark mode
            style={{ color: darkMode ? '#ffffff' : '#111827' }}
          >
            Insights
          </h2>

          {/* added by shreya P — Insights time-period dropdown gets the same dark classes */}
          <Dropdown>
            <Dropdown.Toggle
              className={`${styles.customDropdown} ${darkMode ? styles.customDropdownDark : ''}`}
            >
              {insightsTimePeriod}
            </Dropdown.Toggle>
            <Dropdown.Menu className={darkMode ? styles.dropdownMenuDark : ''}>
              <Dropdown.Item
                className={darkMode ? styles.dropdownItemDark : ''}
                onClick={() => setInsightsTimePeriod('This Week')}
              >
                This Week
              </Dropdown.Item>
              <Dropdown.Item
                className={darkMode ? styles.dropdownItemDark : ''}
                onClick={() => setInsightsTimePeriod('Last Week')}
              >
                Last Week
              </Dropdown.Item>
              <Dropdown.Item
                className={darkMode ? styles.dropdownItemDark : ''}
                onClick={() => setInsightsTimePeriod('This Month')}
              >
                This Month
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>

        {/* added by shreya P — insightsGrid renders cards in a 2-column grid */}
        <div className={styles.insightsGrid}>
          {insights.map((insight, idx) => (
            <div
              key={idx}
              // added by shreya P — removed bg-yinmn-blue Bootstrap class; dark card bg is now
              // controlled by .darkInsightsSection .insightCard in the CSS module to avoid
              // a Bootstrap override fight that was causing alignment/colour conflicts
              className={`${styles.insightCard} ${darkMode ? styles.insightCardDark : ''}`}
            >
              <div className={styles.insightTooltip}>{insightDefinitions[insight.title]}</div>

              <div
                className={styles.insightTitle}
                title={insightDefinitions[insight.title]}
                // added by shreya P — insightTitle colour: was '#342d2dff' (nearly black) in dark mode
                // which made it invisible on a dark card. Changed to '#e5e7eb' (light grey).
                style={{ color: darkMode ? '#e5e7eb' : '#6b7280', fontWeight: 600 }}
              >
                {insight.title}
              </div>

              <div
                className={styles.insightBadge}
                // added by shreya P — badge keeps its pastel background in both modes;
                // text is forced dark so it stays readable on the light-coloured badge pill
                style={{ backgroundColor: insight.color, color: '#111827' }}
              >
                {insight.value}
              </div>

              {/* added by shreya P — insightMeta text colour handled by CSS module dark rule */}
              <div className={styles.insightMeta}>Based on returned vs loaned comparison</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
