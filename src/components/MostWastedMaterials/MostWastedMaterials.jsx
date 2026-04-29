'use client';

import { useMemo, useRef, useState } from 'react';
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  LabelList,
} from 'recharts';
import { useSelector } from 'react-redux';
import styles from './MostWastedMaterials.module.css';

// ---------------- Mock data (unchanged) ----------------
const mockProjects = [
  { id: 'all', name: 'All Projects' },
  { id: 'project-1', name: 'Construction Site A' },
  { id: 'project-2', name: 'Office Building B' },
  { id: 'project-3', name: 'Residential Complex C' },
];

const mockData = {
  all: [
    { material: 'Concrete', wastePercentage: 15.8 },
    { material: 'Steel Rebar', wastePercentage: 12.3 },
    { material: 'Lumber', wastePercentage: 11.7 },
    { material: 'Drywall', wastePercentage: 9.4 },
    { material: 'Insulation', wastePercentage: 8.9 },
    { material: 'Tiles', wastePercentage: 7.2 },
    { material: 'Paint', wastePercentage: 6.8 },
    { material: 'Electrical Wire', wastePercentage: 5.1 },
  ],
  'project-1': [
    { material: 'Concrete', wastePercentage: 18.2 },
    { material: 'Steel Rebar', wastePercentage: 14.1 },
    { material: 'Lumber', wastePercentage: 10.3 },
    { material: 'Drywall', wastePercentage: 8.7 },
    { material: 'Insulation', wastePercentage: 7.9 },
  ],
  'project-2': [
    { material: 'Drywall', wastePercentage: 13.5 },
    { material: 'Steel Rebar', wastePercentage: 11.8 },
    { material: 'Concrete', wastePercentage: 10.9 },
    { material: 'Tiles', wastePercentage: 9.2 },
    { material: 'Paint', wastePercentage: 8.4 },
  ],
  'project-3': [
    { material: 'Lumber', wastePercentage: 16.3 },
    { material: 'Insulation', wastePercentage: 12.7 },
    { material: 'Drywall', wastePercentage: 11.1 },
    { material: 'Paint', wastePercentage: 9.8 },
    { material: 'Tiles', wastePercentage: 6.5 },
  ],
};

// ---------------- Small utils ----------------
const fmtPct = n => new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(n);

const downloadCSV = (rows, filename = 'most-wasted-materials.csv') => {
  if (!rows?.length) return;

  /* eslint-disable testing-library/no-node-access */
  const headers = Object.keys(rows[0]);
  const body = rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','));
  const csv = [headers.join(','), ...body].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  /* eslint-enable testing-library/no-node-access */
};

// ---------------- Reusable Dropdown ----------------
// `buttonId` links the label's htmlFor to this button for a11y.
function CustomDropdown({ options, selected, onSelect, buttonId = undefined }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const darkMode = useSelector(state => state.theme.darkMode);

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* id ties this button to the <label htmlFor> */}
      <button
        id={buttonId}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={styles.dropdownButton}
      >
        <span>{selected.name}</span>
        <span style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
      </button>

      {isOpen && (
        <div role="listbox" aria-labelledby={buttonId} className={styles.dropdownMenu}>
          {options.map(option => (
            <button
              type="button"
              key={option.id}
              role="option"
              aria-selected={selected.id === option.id}
              onClick={() => {
                onSelect(option);
                setIsOpen(false);
              }}
              className={styles.dropdownItem}
              onMouseEnter={e => {
                e.target.style.backgroundColor = darkMode ? '#5a6578' : '#f3f4f6';
              }}
              onMouseLeave={e => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              {option.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------- Tooltip ----------------
function CustomTooltip({ active, payload, label }) {
  const darkMode = useSelector(state => state.theme.darkMode);

  if (active && payload?.length) {
    const v = payload[0].value;
    return (
      <div
        className={styles.tooltip}
        style={{
          backgroundColor: darkMode ? '#2d3748' : '#ffffff',
          border: `1px solid ${darkMode ? '#4a5568' : '#e5e7eb'}`,
          borderRadius: '8px',
          boxShadow: darkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
          padding: '12px',
        }}
      >
        <p
          style={{
            fontWeight: '500',
            color: darkMode ? '#e2e8f0' : '#111827',
            margin: '0 0 4px 0',
          }}
        >
          {label}
        </p>
        <p
          style={{
            fontSize: '14px',
            color: darkMode ? '#cbd5e0' : '#6b7280',
            margin: 0,
          }}
        >
          Waste: {fmtPct(v)}%
        </p>
      </div>
    );
  }
  return null;
}

// ---------------- Main Component (mock-only) ----------------
export default function MostWastedMaterials() {
  const [selectedProject, setSelectedProject] = useState(mockProjects[0]);
  const [dateRange, setDateRange] = useState({
    from: '2024-01-01',
    to: new Date().toISOString().split('T')[0],
  });

  // New controls
  const [topN, setTopN] = useState(8);
  const [sortDir, setSortDir] = useState('desc'); // 'desc' = most→least; 'asc' = least→most
  const darkMode = useSelector(state => state.theme.darkMode);

  // Compute chart data from mock (respect filters + topN + sort)
  const chartData = useMemo(() => {
    const raw = mockData[selectedProject.id] || mockData.all || [];
    const sorted = [...raw].sort((a, b) =>
      sortDir === 'desc'
        ? b.wastePercentage - a.wastePercentage
        : a.wastePercentage - b.wastePercentage,
    );
    return sorted.slice(0, Math.max(1, Math.min(20, topN || 1)));
  }, [selectedProject, sortDir, topN, dateRange]);

  return (
    <div className={`${styles.container} ${darkMode ? styles.darkMode : ''}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Most Wasted Materials</h1>
        <p className={styles.subtitle}>Y-axis: % of material wasted · X-axis: material name</p>
      </div>

      {/* Filters */}
      <div className={styles.card}>
        <div className={styles.filterGrid}>
          <div>
            <label htmlFor="project-filter" className={styles.filterLabel}>
              Project Filter
            </label>
            <CustomDropdown
              options={mockProjects}
              selected={selectedProject}
              onSelect={setSelectedProject}
              buttonId="project-filter"
            />
          </div>

          <div>
            <label htmlFor="mw-from" className={styles.filterLabel}>
              From
            </label>
            <input
              id="mw-from"
              type="date"
              value={dateRange.from}
              onChange={e => setDateRange(r => ({ ...r, from: e.target.value }))}
              className={styles.input}
            />
          </div>

          <div>
            <label htmlFor="mw-to" className={styles.filterLabel}>
              To
            </label>
            <input
              id="mw-to"
              type="date"
              value={dateRange.to}
              onChange={e => setDateRange(r => ({ ...r, to: e.target.value }))}
              className={styles.input}
            />
          </div>

          <div>
            <label htmlFor="mw-topn" className={styles.filterLabel}>
              Top N
            </label>
            <input
              id="mw-topn"
              type="number"
              min={1}
              max={20}
              value={topN}
              onFocus={e => e.target.select()}
              onChange={e => {
                const val = e.target.value;

                // Allow empty input while typing
                if (val === '') {
                  setTopN('');
                  return;
                }

                const num = Number(val);
                if (!Number.isNaN(num)) {
                  setTopN(num);
                }
              }}
              onBlur={() => {
                // Clamp value only when leaving the field
                setTopN(prev => {
                  const n = Number(prev);
                  if (Number.isNaN(n)) return 1;
                  return Math.max(1, Math.min(20, n));
                });
              }}
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.actionButtons}>
          <button
            type="button"
            onClick={() => setSortDir(d => (d === 'desc' ? 'asc' : 'desc'))}
            className={styles.actionButton}
            title="Toggle sort order"
          >
            Sort: {sortDir === 'desc' ? 'Most → Least' : 'Least → Most'}
          </button>

          <button
            type="button"
            onClick={() => downloadCSV(chartData)}
            className={styles.actionButton}
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className={styles.card}>
        {chartData.length === 0 ? (
          <div className={styles.noData}>No data for the selected filters.</div>
        ) : (
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 30, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#4a5568' : '#e5e7eb'} />
                <XAxis
                  dataKey="material"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                  interval={0}
                  tick={{ fill: darkMode ? '#cbd5e0' : '#374151' }}
                />
                <YAxis
                  label={{
                    value: 'Percentage of Material Wasted (%)',
                    angle: -90,
                    position: 'insideLeft',
                    style: {
                      textAnchor: 'middle',
                      fill: darkMode ? '#cbd5e0' : '#374151',
                    },
                  }}
                  fontSize={12}
                  tick={{ fill: darkMode ? '#cbd5e0' : '#374151' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="wastePercentage"
                  fill={darkMode ? '#4299e1' : '#3b82f6'}
                  radius={[4, 4, 0, 0]}
                >
                  <LabelList
                    dataKey="wastePercentage"
                    position="top"
                    formatter={v => `${fmtPct(v)}%`}
                    style={{ fill: darkMode ? '#e2e8f0' : '#374151' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
