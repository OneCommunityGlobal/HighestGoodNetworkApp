'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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

// ---------------- Theme ----------------
// Light = your original design. Dark = only used when the APP is in dark mode.
const light = {
  pageBg: '#f9fafb',
  cardBg: '#ffffff',
  border: '#e5e7eb',
  inputBorder: '#d1d5db',
  text: '#111827',
  text2: '#374151',
  muted: '#6b7280',
  hover: '#f3f4f6',
  grid: '#e5e7eb',
  bar: '#3b82f6',
  shadow: 'rgba(0, 0, 0, 0.1)',
  scheme: 'light',
};

const dark = {
  pageBg: '#0f172a',
  cardBg: '#1e293b',
  border: '#334155',
  inputBorder: '#475569',
  text: '#f1f5f9',
  text2: '#cbd5e1',
  muted: '#94a3b8',
  hover: '#334155',
  grid: '#334155',
  bar: '#60a5fa',
  shadow: 'rgba(0, 0, 0, 0.4)',
  scheme: 'dark',
};

// Is this CSS color dark? Returns null when transparent / unknown.
function isDarkColor(cssColor) {
  const m = cssColor && cssColor.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const [r, g, b, a = 1] = m[1]
    .split(/[ ,/]+/)
    .filter(Boolean)
    .map(Number);
  if (a === 0) return null;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
}

// Detects the APP's theme (not the OS preference), so light stays light
// unless the app itself is switched to dark.
function detectAppDark() {
  const html = document.documentElement;
  const body = document.body;

  // 1. Explicit markers set by common theme toggles
  for (const el of [html, body]) {
    if (!el) continue;
    const marker = `${el.getAttribute('data-theme') || ''} ${el.getAttribute('data-bs-theme') ||
      ''} ${el.getAttribute('data-mode') || ''}`.toLowerCase();
    if (el.classList.contains('dark') || marker.includes('dark')) return true;
    if (el.classList.contains('light') || marker.includes('light')) return false;
  }

  // 2. Fall back to the actual page background color
  for (const el of [body, html]) {
    if (!el) continue;
    const result = isDarkColor(getComputedStyle(el).backgroundColor);
    if (result !== null) return result;
  }

  return false;
}

function useTheme() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const update = () => setIsDark(detectAppDark());
    update();

    const opts = {
      attributes: true,
      attributeFilter: ['class', 'style', 'data-theme', 'data-bs-theme', 'data-mode'],
    };
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, opts);
    if (document.body) obs.observe(document.body, opts);

    // If the app follows the OS setting via CSS, re-check right after it flips
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onMq = () => setTimeout(update, 50);
    mq.addEventListener('change', onMq);

    return () => {
      obs.disconnect();
      mq.removeEventListener('change', onMq);
    };
  }, []);

  return isDark ? dark : light;
}

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
  const t = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* id ties this button to the <label htmlFor> */}
      <button
        id={buttonId}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        style={{
          width: '100%',
          padding: '8px 16px',
          textAlign: 'left',
          backgroundColor: t.cardBg,
          color: t.text,
          border: `1px solid ${t.inputBorder}`,
          borderRadius: '6px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>{selected.name}</span>
        <span style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-labelledby={buttonId}
          style={{
            position: 'absolute',
            zIndex: 10,
            width: '100%',
            marginTop: '4px',
            backgroundColor: t.cardBg,
            border: `1px solid ${t.inputBorder}`,
            borderRadius: '6px',
            boxShadow: `0 4px 6px ${t.shadow}`,
          }}
        >
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
              style={{
                width: '100%',
                padding: '8px 16px',
                textAlign: 'left',
                backgroundColor: 'transparent',
                color: t.text,
                border: 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                e.target.style.backgroundColor = t.hover;
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
  const t = useTheme();
  if (active && payload?.length) {
    const v = payload[0].value;
    return (
      <div
        style={{
          backgroundColor: t.cardBg,
          border: `1px solid ${t.border}`,
          borderRadius: '8px',
          boxShadow: `0 4px 6px ${t.shadow}`,
          padding: '12px',
        }}
      >
        <p
          style={{
            fontWeight: '500',
            color: t.text,
            margin: '0 0 4px 0',
          }}
        >
          {label}
        </p>
        <p style={{ fontSize: '14px', color: t.muted, margin: 0 }}>Waste: {fmtPct(v)}%</p>
      </div>
    );
  }
  return null;
}

// ---------------- Main Component (mock-only) ----------------
export default function MostWastedMaterials() {
  const t = useTheme();

  const [selectedProject, setSelectedProject] = useState(mockProjects[0]);
  const [dateRange, setDateRange] = useState({
    from: '2024-01-01',
    to: new Date().toISOString().split('T')[0],
  });

  // New controls
  const [topN, setTopN] = useState(8);
  const [sortDir, setSortDir] = useState('desc'); // 'desc' = most→least; 'asc' = least→most

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

  // Shared themed styles
  const labelStyle = {
    display: 'block',
    fontSize: 14,
    fontWeight: 600,
    color: t.text2,
    marginBottom: 8,
  };

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    fontSize: 14,
    borderRadius: 6,
    border: `1px solid ${t.inputBorder}`,
    backgroundColor: t.cardBg,
    color: t.text,
    colorScheme: t.scheme, // keeps the date picker icon visible
  };

  const btnStyle = {
    padding: '8px 12px',
    borderRadius: 6,
    cursor: 'pointer',
    border: `1px solid ${t.inputBorder}`,
    background: t.cardBg,
    color: t.text,
  };

  const cardStyle = {
    backgroundColor: t.cardBg,
    borderRadius: '8px',
    border: `1px solid ${t.border}`,
    padding: '24px',
    boxShadow: `0 1px 3px ${t.shadow}`,
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px',
        backgroundColor: t.pageBg,
        color: t.text,
        minHeight: '100vh',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: t.text, margin: 0 }}>
          Most Wasted Materials
        </h1>
        <p style={{ color: t.muted, marginTop: 8, fontSize: 14 }}>
          Y-axis: % of material wasted · X-axis: material name
        </p>
      </div>

      {/* Filters */}
      <div style={{ ...cardStyle, marginBottom: '24px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
          }}
        >
          <div>
            <label htmlFor="project-filter" style={labelStyle}>
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
            <label htmlFor="mw-from" style={labelStyle}>
              From
            </label>
            <input
              id="mw-from"
              type="date"
              value={dateRange.from}
              onChange={e => setDateRange(r => ({ ...r, from: e.target.value }))}
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="mw-to" style={labelStyle}>
              To
            </label>
            <input
              id="mw-to"
              type="date"
              value={dateRange.to}
              onChange={e => setDateRange(r => ({ ...r, to: e.target.value }))}
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="mw-topn" style={labelStyle}>
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
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setSortDir(d => (d === 'desc' ? 'asc' : 'desc'))}
            style={btnStyle}
            title="Toggle sort order"
          >
            Sort: {sortDir === 'desc' ? 'Most → Least' : 'Least → Most'}
          </button>

          <button type="button" onClick={() => downloadCSV(chartData)} style={btnStyle}>
            Export CSV
          </button>
        </div>
      </div>

      {/* Chart */}
      <div style={cardStyle}>
        {chartData.length === 0 ? (
          <div
            style={{
              height: 500,
              display: 'grid',
              placeItems: 'center',
              color: t.muted,
            }}
          >
            No data for the selected filters.
          </div>
        ) : (
          <div style={{ width: '100%', height: 500 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 30, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
                <XAxis
                  dataKey="material"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                  interval={0}
                  tick={{ fill: t.text2 }}
                />
                <YAxis
                  label={{
                    value: 'Percentage of Material Wasted (%)',
                    angle: -90,
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fill: t.text2 },
                  }}
                  fontSize={12}
                  tick={{ fill: t.text2 }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: t.hover }} />
                <Bar dataKey="wastePercentage" fill={t.bar} radius={[4, 4, 0, 0]}>
                  <LabelList
                    dataKey="wastePercentage"
                    position="top"
                    formatter={v => `${fmtPct(v)}%`}
                    fill={t.text}
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
