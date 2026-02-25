import { useState, useEffect, useRef } from 'react';
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
import Select from 'react-select';
import httpService from '../../../services/httpService';

// Fetch project risk profile data from backend

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

  // Refs for focusing dropdowns
  const allSpanRef = useRef(null);
  const dateSpanRef = useRef(null);

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
        setAllProjects(result.map(p => p.projectName));
        setSelectedProjects(result.map(p => p.projectName));
        // Extract all unique dates from all projects
        const dates = Array.from(new Set(result.flatMap(p => p.dates || [])));
        setAllDates(dates);
        setSelectedDates(dates);
      } catch (err) {
        setError('Failed to fetch project risk profile data.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filter projects that are ongoing on ALL selected dates and in selectedProjects
  const filteredData = data.filter(
    p =>
      (selectedProjects.length === 0 || selectedProjects.includes(p.projectName)) &&
      (selectedDates.length === 0 || (p.dates || []).some(d => selectedDates.includes(d))),
  );

  // Project label function
  const getProjectLabel = () => {
    if (selectedProjects.length === allProjects.length) return 'ALL';
    if (selectedProjects.length === 0) return 'Select projects';
    return `${selectedProjects.length} selected`;
  };

  // Dates label function
  const getDateLabel = () => {
    if (selectedDates.length === allDates.length) return 'ALL';
    if (selectedDates.length === 0) return 'Select dates';
    return `${selectedDates.length} selected`;
  };

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
        {/* Project Dropdown */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: 90,
          }}
        >
          <span style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 0 }}>Project</span>
          <button
            ref={allSpanRef}
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
            onClick={() => setShowProjectDropdown(true)}
            aria-label="Show project dropdown"
          >
            {getProjectLabel()}
            {showProjectDropdown && (
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
                  classNamePrefix="custom-select"
                  options={allProjects.map(p => ({ label: p, value: p }))}
                  value={selectedProjects.map(p => ({ label: p, value: p }))}
                  onChange={opts => {
                    const values = opts && opts.length ? opts.map(o => o.value) : [];
                    setSelectedProjects(values);
                  }}
                  onBlur={() => setShowProjectDropdown(false)}
                  closeMenuOnSelect={false}
                  hideSelectedOptions={false}
                  components={{ IndicatorSeparator: () => null, ClearIndicator: () => null }}
                  styles={{
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
                    valueContainer: base => ({
                      ...base,
                      padding: '0 2px',
                      justifyContent: 'center',
                    }),
                    multiValue: base => ({
                      ...base,
                      background: '#e6f7ff',
                      fontSize: 12,
                      margin: '0 2px',
                    }),
                    input: base => ({
                      ...base,
                      margin: 0,
                      padding: 0,
                      textAlign: 'center',
                    }),
                    placeholder: base => ({
                      ...base,
                      color: '#aaa',
                      textAlign: 'center',
                    }),
                    dropdownIndicator: base => ({
                      ...base,
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }),
                    menu: base => ({ ...base, zIndex: 9999, fontSize: 14 }),
                  }}
                />
              </div>
            )}
          </button>
        </div>
        {/* Date Dropdown */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: 90,
          }}
        >
          <span style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 0 }}>Dates</span>
          <button
            ref={dateSpanRef}
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
            onClick={() => setShowDateDropdown(true)}
            aria-label="Show date dropdown"
          >
            {getDateLabel && getDateLabel()}
            {showDateDropdown && (
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
                  classNamePrefix="custom-select"
                  options={allDates.map(d => ({ label: d, value: d }))}
                  value={selectedDates.map(d => ({ label: d, value: d }))}
                  onChange={opts => {
                    const values = opts && opts.length ? opts.map(o => o.value) : [];
                    setSelectedDates(values);
                  }}
                  onBlur={() => setShowDateDropdown(false)}
                  closeMenuOnSelect={false}
                  hideSelectedOptions={false}
                  components={{ IndicatorSeparator: () => null, ClearIndicator: () => null }}
                  styles={{
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
                    valueContainer: base => ({
                      ...base,
                      padding: '0 2px',
                      justifyContent: 'center',
                    }),
                    multiValue: base => ({
                      ...base,
                      background: '#e6f7ff',
                      fontSize: 12,
                      margin: '0 2px',
                    }),
                    input: base => ({
                      ...base,
                      margin: 0,
                      padding: 0,
                      textAlign: 'center',
                    }),
                    placeholder: base => ({
                      ...base,
                      color: '#aaa',
                      textAlign: 'center',
                    }),
                    dropdownIndicator: base => ({
                      ...base,
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }),
                    menu: base => ({ ...base, zIndex: 9999, fontSize: 14 }),
                  }}
                />
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Chart Section */}
      <div style={{ width: '100%', margin: '0 -24px', padding: '0 24px' }}>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={filteredData.map(item => {
              //console.log('Before transform:', item.predictedCostOverrun);
              return {
                ...item,
                predictedCostOverrun: item.predictedCostOverrun,
              };
            })}
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
                style: {
                  textAnchor: 'middle',
                  fontSize: 14,
                  fill: '#333',
                  fontWeight: '500',
                },
              }}
              tickFormatter={value => (Number.isInteger(value) ? value : value.toFixed(0))}
              tick={{ fontSize: 12, fill: '#666' }}
            />
            <Tooltip
              formatter={(value, name) => {
                if (typeof value === 'number') {
                  // Format Time Delay specifically to 2 decimal places
                  if (name === 'Predicted Time Delay (%)') {
                    return value.toFixed(2);
                  }
                  // For other values, use 2 decimal places if not integer
                  return Number.isInteger(value) ? value.toString() : value.toFixed(2);
                }
                return value;
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
