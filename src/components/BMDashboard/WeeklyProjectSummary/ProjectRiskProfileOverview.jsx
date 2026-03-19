import { useEffect, useState } from 'react';
import Select from 'react-select';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import httpService from '../../../services/httpService';

// ── Shared inline-dropdown styles ────────────────────────────────────────────
// Both the Project and Dates selectors share the same appearance; define once.
const inlineSelectStyles = {
  control: base => ({
    ...base,
    fontSize: 14,
    minHeight: 22,
    width: 120,
    background: 'none',
    border: 'none',
    boxShadow: 'none',
    textAlign: 'center',
    alignItems: 'center',
    padding: 0,
  }),
  valueContainer: base => ({ ...base, padding: '0 2px', justifyContent: 'center' }),
  multiValue: base => ({ ...base, background: '#e6f7ff', fontSize: 12, margin: '0 2px' }),
  input: base => ({ ...base, margin: 0, padding: 0, textAlign: 'center' }),
  placeholder: base => ({ ...base, color: '#aaa', textAlign: 'center' }),
  dropdownIndicator: base => ({
    ...base,
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  menu: base => ({ ...base, zIndex: 9999, fontSize: 14 }),
};

const SHARED_SELECT_COMPONENTS = {
  IndicatorSeparator: () => null,
  ClearIndicator: () => null,
};

// ── Reusable inline filter dropdown ──────────────────────────────────────────
function InlineMultiSelect({ label, options, value, onChange, onBlur, show, onOpen }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 90 }}>
      <span style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 0 }}>{label}</span>
      <button
        type="button"
        style={{
          fontSize: 14,
          color: '#444',
          fontWeight: 500,
          marginBottom: 2,
          cursor: 'pointer',
          position: 'relative',
          display: 'inline-block',
          minWidth: 60,
          textAlign: 'center',
          background: 'none',
          border: 'none',
          padding: 0,
        }}
        onClick={onOpen}
        aria-label={`Show ${label} dropdown`}
      >
        {value.length === options.length
          ? 'ALL'
          : value.length === 0
          ? `Select ${label.toLowerCase()}`
          : `${value.length} selected`}
        {show && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: '100%',
              zIndex: 2000,
              minWidth: 120,
              background: 'white',
              boxShadow: '0 2px 8px #eee',
              borderRadius: 4,
              marginTop: 2,
            }}
          >
            <Select
              menuIsOpen
              isMulti
              options={options}
              value={value.map(v => ({ label: v, value: v }))}
              onChange={opts => onChange(opts ? opts.map(o => o.value) : [])}
              onBlur={onBlur}
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
              components={SHARED_SELECT_COMPONENTS}
              styles={inlineSelectStyles}
            />
          </div>
        )}
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ProjectRiskProfileOverview() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allProjects, setAllProjects] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [allDates, setAllDates] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [showDateDropdown, setShowDateDropdown] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await httpService.get(
          `${process.env.REACT_APP_APIENDPOINT}/projects/risk-profile`,
        );
        let result = res.data;
        if (!Array.isArray(result)) result = [result];
        setData(result);
        const projects = result.map(p => p.projectName);
        const dates = Array.from(new Set(result.flatMap(p => p.dates || [])));
        setAllProjects(projects);
        setSelectedProjects(projects);
        setAllDates(dates);
        setSelectedDates(dates);
      } catch {
        setError('Failed to fetch project risk profile data.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredData = data.filter(
    p =>
      (selectedProjects.length === 0 || selectedProjects.includes(p.projectName)) &&
      (selectedDates.length === 0 || (p.dates || []).some(d => selectedDates.includes(d))),
  );

  if (loading) return <div>Loading project risk profiles...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 8,
        boxShadow: '0 2px 8px #eee',
        padding: 24,
        marginBottom: 24,
        width: '100%',
        gridColumn: '1 / -1',
      }}
    >
      <h2 style={{ marginBottom: 24 }}>Project Risk Profile Overview</h2>

      <div
        style={{
          display: 'flex',
          gap: 40,
          flexWrap: 'wrap',
          marginBottom: 24,
          alignItems: 'flex-end',
        }}
      >
        <InlineMultiSelect
          label="Project"
          options={allProjects.map(p => ({ label: p, value: p }))}
          value={selectedProjects}
          onChange={setSelectedProjects}
          onBlur={() => setShowProjectDropdown(false)}
          show={showProjectDropdown}
          onOpen={() => setShowProjectDropdown(true)}
        />
        <InlineMultiSelect
          label="Dates"
          options={allDates.map(d => ({ label: d, value: d }))}
          value={selectedDates}
          onChange={setSelectedDates}
          onBlur={() => setShowDateDropdown(false)}
          show={showDateDropdown}
          onOpen={() => setShowDateDropdown(true)}
        />
      </div>

      <div style={{ width: '100%', margin: '0 -24px', padding: '0 24px' }}>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={filteredData}
            margin={{ top: 20, right: 40, left: 60, bottom: 80 }}
            barCategoryGap="20%"
            barGap={4}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="projectName"
              tick={{ fontSize: 12, fill: '#666' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              label={{
                value: 'Percentage (%)',
                angle: -90,
                position: 'insideLeft',
                offset: 15,
                style: { textAnchor: 'middle', fontSize: 14, fill: '#333', fontWeight: '500' },
              }}
              tickFormatter={value => (Number.isInteger(value) ? value : value.toFixed(0))}
              tick={{ fontSize: 12, fill: '#666' }}
            />
            <Tooltip
              formatter={(value, name) => {
                if (typeof value !== 'number') return value;
                if (name === 'Predicted Time Delay (%)') return value.toFixed(2);
                return Number.isInteger(value) ? value.toString() : value.toFixed(2);
              }}
            />
            <Legend wrapperStyle={{ marginTop: 20 }} />
            <Bar
              dataKey="predictedCostOverrun"
              name="Predicted Cost Overrun (%)"
              fill="#4285F4"
              barSize={35}
            />
            <Bar dataKey="totalOpenIssues" name="Issues" fill="#EA4335" barSize={35} />
            <Bar
              dataKey="predictedTimeDelay"
              name="Predicted Time Delay (%)"
              fill="#FBBC05"
              barSize={35}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
