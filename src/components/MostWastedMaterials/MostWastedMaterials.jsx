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
          backgroundColor: '#ffffff',
          border: '1px solid #d1d5db',
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
            backgroundColor: '#ffffff',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
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
                border: 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                e.target.style.backgroundColor = '#f3f4f6';
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
  if (active && payload?.length) {
    const v = payload[0].value;
    return (
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          padding: '12px',
        }}
      >
        <p
          style={{
            fontWeight: '500',
            color: '#111827',
            margin: '0 0 4px 0',
          }}
        >
          {label}
        </p>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Waste: {fmtPct(v)}%</p>
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
    <div
      style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px',
        backgroundColor: '#f9fafb',
        minHeight: '100vh',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
          Most Wasted Materials
        </h1>
        <p style={{ color: '#6b7280', marginTop: 8, fontSize: 14 }}>
          Y-axis: % of material wasted · X-axis: material name
        </p>
      </div>

      {/* Filters */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
          }}
        >
          <div>
            <label
              htmlFor="project-filter"
              style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 600,
                color: '#374151',
                marginBottom: 8,
              }}
            >
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
            <label
              htmlFor="mw-from"
              style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 600,
                color: '#374151',
                marginBottom: 8,
              }}
            >
              From
            </label>
            <input
              id="mw-from"
              type="date"
              value={dateRange.from}
              onChange={e => setDateRange(r => ({ ...r, from: e.target.value }))}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: 6,
                fontSize: 14,
              }}
            />
          </div>

          <div>
            <label
              htmlFor="mw-to"
              style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 600,
                color: '#374151',
                marginBottom: 8,
              }}
            >
              To
            </label>
            <input
              id="mw-to"
              type="date"
              value={dateRange.to}
              onChange={e => setDateRange(r => ({ ...r, to: e.target.value }))}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: 6,
                fontSize: 14,
              }}
            />
          </div>

          <div>
            <label
              htmlFor="mw-topn"
              style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 600,
                color: '#374151',
                marginBottom: 8,
              }}
            >
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
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: 6,
                fontSize: 14,
              }}
            />
          </div>
        </div>

        <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setSortDir(d => (d === 'desc' ? 'asc' : 'desc'))}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: 6,
              background: '#fff',
              cursor: 'pointer',
            }}
            title="Toggle sort order"
          >
            Sort: {sortDir === 'desc' ? 'Most → Least' : 'Least → Most'}
          </button>

          <button
            type="button"
            onClick={() => downloadCSV(chartData)}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: 6,
              background: '#fff',
              cursor: 'pointer',
            }}
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Chart */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        {chartData.length === 0 ? (
          <div
            style={{
              height: 500,
              display: 'grid',
              placeItems: 'center',
              color: '#6b7280',
            }}
          >
            No data for the selected filters.
          </div>
        ) : (
          <div style={{ width: '100%', height: 500 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 30, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="material"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                  interval={0}
                  tick={{ fill: '#374151' }}
                />
                <YAxis
                  label={{
                    value: 'Percentage of Material Wasted (%)',
                    angle: -90,
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fill: '#374151' },
                  }}
                  fontSize={12}
                  tick={{ fill: '#374151' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="wastePercentage" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  <LabelList
                    dataKey="wastePercentage"
                    position="top"
                    formatter={v => `${fmtPct(v)}%`}
                    className="fill-gray-700"
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
